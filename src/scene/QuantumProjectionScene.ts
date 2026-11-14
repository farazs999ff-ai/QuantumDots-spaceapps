import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { QuantumSimulationState } from '../physics/quantumConfinement';
import {
  createContactShadowTexture,
  createExoplanetAlbedoTexture,
  createProjectionScreenCanvas,
  paintProjectionScreen,
} from './proceduralTextures';

export type CameraPreset = 'overview' | 'qd' | 'projection' | 'planet';

interface CameraPose {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

const CAMERA_POSES: Record<CameraPreset, CameraPose> = {
  overview: {
    position: new THREE.Vector3(0.5, 4.4, 17.5),
    target: new THREE.Vector3(0.2, 0.9, -1.0),
  },
  qd: {
    position: new THREE.Vector3(-4.2, 2.2, 5.8),
    target: new THREE.Vector3(-5.2, 0.85, 0.0),
  },
  projection: {
    position: new THREE.Vector3(3.4, 2.4, 7.6),
    target: new THREE.Vector3(3.6, 1.3, -1.2),
  },
  planet: {
    position: new THREE.Vector3(8.5, 4.6, 6.2),
    target: new THREE.Vector3(11.5, 4.2, -16.0),
  },
};

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

interface LatticeSite {
  x: number;
  y: number;
  z: number;
  isCation: boolean;
  rNorm: number;
}

function buildZincBlendeSites(): LatticeSite[] {
  const sites: LatticeSite[] = [];
  const a = 0.27;
  const fccOffsets = [
    [0, 0, 0],
    [0, 0.5, 0.5],
    [0.5, 0, 0.5],
    [0.5, 0.5, 0],
  ];

  for (let ix = -3; ix <= 3; ix++) {
    for (let iy = -3; iy <= 3; iy++) {
      for (let iz = -3; iz <= 3; iz++) {
        for (const [ox, oy, oz] of fccOffsets) {
          const cx = (ix + ox) * a;
          const cy = (iy + oy) * a;
          const cz = (iz + oz) * a;
          const rC = Math.hypot(cx, cy, cz);
          if (rC <= 1.0) {
            sites.push({ x: cx, y: cy, z: cz, isCation: true, rNorm: rC });
          }

          const ax = (ix + ox + 0.25) * a;
          const ay = (iy + oy + 0.25) * a;
          const az = (iz + oz + 0.25) * a;
          const rA = Math.hypot(ax, ay, az);
          if (rA <= 1.0) {
            sites.push({ x: ax, y: ay, z: az, isCation: false, rNorm: rA });
          }
        }
      }
    }
  }
  return sites;
}

// Pre-allocated scratch helpers (zero GC inside animation loop)
const _vec3 = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _color = new THREE.Color();
const _up = new THREE.Vector3(0, 1, 0);

export class QuantumProjectionScene {
  private container: HTMLElement;
  private isSoftwareGl: boolean;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private composer: EffectComposer | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private envRenderTarget: THREE.WebGLRenderTarget;

  private frameId = 0;
  private disposed = false;
  private clock = new THREE.Clock();

  // Camera transition state
  private cameraTransitionActive = false;
  private desiredCamPos = CAMERA_POSES.overview.position.clone();
  private desiredCamTarget = CAMERA_POSES.overview.target.clone();

  // Optical Stage & Quantum Dot assembly
  private benchGroup = new THREE.Group();
  private qdStageGroup = new THREE.Group();
  private qdSpinGroup = new THREE.Group();
  private coreMesh!: THREE.Mesh;
  private coreMat!: THREE.MeshPhysicalMaterial;
  private shellMesh!: THREE.Mesh;
  private shellMat!: THREE.MeshPhysicalMaterial;
  private excitonMesh!: THREE.Mesh;
  private excitonMat!: THREE.ShaderMaterial;
  private cationInstanced!: THREE.InstancedMesh;
  private anionInstanced!: THREE.InstancedMesh;
  private ligandInstanced!: THREE.InstancedMesh;
  private latticeSites: LatticeSite[] = [];
  private ligandDirs: THREE.Vector3[] = [];
  private qdPointLight!: THREE.PointLight;
  private excitationBeamMat!: THREE.MeshBasicMaterial;
  private emissionBeamMat!: THREE.MeshBasicMaterial;
  private photonInstanced!: THREE.InstancedMesh;
  private photonPhases: Float32Array;

  // Projection spectrometer assembly
  private projectionGroup = new THREE.Group();
  private screenCtx!: CanvasRenderingContext2D;
  private screenTex!: THREE.CanvasTexture;
  private screenMat!: THREE.MeshStandardMaterial;

  // Exoplanet & starfield assembly
  private planetGroup = new THREE.Group();
  private planetMesh!: THREE.Mesh;
  private atmosMat!: THREE.ShaderMaterial;
  private orbitArcMat!: THREE.MeshBasicMaterial;
  private hostStarMesh!: THREE.Mesh;

  // Cached simulation values for animation loop
  private simState: QuantumSimulationState;
  private disposableTextures: THREE.Texture[] = [];
  private disposableGeometries: THREE.BufferGeometry[] = [];
  private disposableMaterials: THREE.Material[] = [];

  private onContextLostBound: (e: Event) => void;
  private onContextRestoredBound: () => void;
  private onResizeBound: () => void;
  private onControlsStartBound: () => void;

  constructor(
    container: HTMLElement,
    initialSim: QuantumSimulationState,
    onContextStatus?: (lost: boolean) => void,
  ) {
    this.container = container;
    this.simState = initialSim;
    this.isSoftwareGl = detectSoftwareWebGL();
    this.photonPhases = new Float32Array(36);
    for (let i = 0; i < this.photonPhases.length; i++) {
      this.photonPhases[i] = i / this.photonPhases.length;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06080d);
    this.scene.fog = new THREE.FogExp2(0x06080d, 0.014);

    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 220);
    this.camera.position.copy(CAMERA_POSES.overview.position);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Studio IBL environment map via RoomEnvironment on every device
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const roomEnv = new RoomEnvironment();
    this.envRenderTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    this.scene.environment = this.envRenderTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 2.6;
    this.controls.maxDistance = 36;
    this.controls.maxPolarAngle = Math.PI * 0.56;
    this.controls.target.copy(CAMERA_POSES.overview.target);
    this.controls.update();

    this.onControlsStartBound = () => {
      this.cameraTransitionActive = false;
    };
    this.controls.addEventListener('start', this.onControlsStartBound);

    if (!this.isSoftwareGl) {
      this.composer = new EffectComposer(this.renderer);
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      this.bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.52, 0.35, 0.72);
      this.composer.addPass(this.bloomPass);
    }

    this.setupLighting();
    this.buildStarfield();
    this.buildOpticalBench();
    this.buildQuantumDotAssembly();
    this.buildProjectionSpectrometer();
    this.buildExoplanetSystem();

    this.applySimulationState(initialSim);

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.onContextLostBound = (e: Event) => {
      e.preventDefault();
      onContextStatus?.(true);
    };
    this.onContextRestoredBound = () => {
      onContextStatus?.(false);
    };
    this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLostBound);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.onContextRestoredBound);

    this.onResizeBound = () => this.handleResize();
    window.addEventListener('resize', this.onResizeBound);

    this.tick();
  }

  private trackGeo<T extends THREE.BufferGeometry>(geo: T): T {
    this.disposableGeometries.push(geo);
    return geo;
  }

  private trackMat<T extends THREE.Material>(mat: T): T {
    this.disposableMaterials.push(mat);
    return mat;
  }

  private trackTex<T extends THREE.Texture>(tex: T): T {
    this.disposableTextures.push(tex);
    return tex;
  }

  private setupLighting(): void {
    // Cool sky / dark lab slate hemisphere fill
    const hemi = new THREE.HemisphereLight(0xb8d4ff, 0x111827, 0.65);
    this.scene.add(hemi);

    // Warm laboratory / stellar key directional light
    const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.2);
    keyLight.position.set(8, 12, 9);
    keyLight.castShadow = !this.isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 36;
    const d = 12;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    // Cool rim backlight for optical mount silhouettes
    const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.9);
    rimLight.position.set(-10, 6, -12);
    this.scene.add(rimLight);
  }

  private buildStarfield(): void {
    const count = 1400;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    // Realistic Planckian stellar color classes (O/B blue, A white, G yellow, K/M orange)
    const palette = [
      new THREE.Color(0x9bb8ff),
      new THREE.Color(0xcad8ff),
      new THREE.Color(0xf8f7ff),
      new THREE.Color(0xfff2db),
      new THREE.Color(0xffd2a1),
    ];

    let seed = 9187;
    const rand = () => {
      seed = (seed * 48271) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let i = 0; i < count; i++) {
      const r = 42 + rand() * 85;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.65 + 4;
      positions[i * 3 + 2] = -Math.abs(r * Math.sin(phi) * Math.sin(theta)) * 0.9 - 6;

      const c = palette[Math.floor(rand() * palette.length)];
      const brightness = 0.45 + rand() * 0.55;
      colors[i * 3] = c.r * brightness;
      colors[i * 3 + 1] = c.g * brightness;
      colors[i * 3 + 2] = c.b * brightness;
    }

    const geo = this.trackGeo(new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = this.trackMat(
      new THREE.PointsMaterial({
        size: 0.22,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
      }),
    );

    const stars = new THREE.Points(geo, mat);
    this.scene.add(stars);
  }

  private buildOpticalBench(): void {
    // Precision matte-black anodized optical breadboard rail beneath the QD + Grating + Screen
    this.benchGroup.position.set(0, -1.65, -0.5);
    this.scene.add(this.benchGroup);

    const railGeo = this.trackGeo(new THREE.BoxGeometry(15.2, 0.24, 3.6));
    const railMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x0f1520,
        roughness: 0.72,
        metalness: 0.35,
      }),
    );
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(-0.6, -0.12, 0);
    rail.receiveShadow = true;
    this.benchGroup.add(rail);

    // Brushed aluminum dovetail guide tracks along the optical bench
    const trackGeo = this.trackGeo(new THREE.BoxGeometry(14.8, 0.04, 0.16));
    const trackMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.28,
        metalness: 0.88,
      }),
    );
    for (const zOff of [-0.9, 0.9]) {
      const track = new THREE.Mesh(trackGeo, trackMat);
      track.position.set(-0.6, 0.02, zOff);
      this.benchGroup.add(track);
    }

    // Precision grid markings (offset +0.021 above rail surface to prevent Z-fighting)
    const gridHelper = new THREE.GridHelper(14, 28, 0x334155, 0x1e293b);
    gridHelper.scale.set(1.05, 1, 0.24);
    gridHelper.position.set(-0.6, 0.025, 0);
    this.benchGroup.add(gridHelper);
  }

  private buildQuantumDotAssembly(): void {
    this.qdStageGroup.position.set(-5.2, -1.65, 0);
    this.scene.add(this.qdStageGroup);

    const shadowTex = this.trackTex(createContactShadowTexture());
    const shadowPlane = new THREE.Mesh(
      this.trackGeo(new THREE.PlaneGeometry(4.2, 4.2)),
      this.trackMat(
        new THREE.MeshBasicMaterial({
          map: shadowTex,
          transparent: true,
          opacity: 0.55,
          depthWrite: false,
        }),
      ),
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.03;
    this.qdStageGroup.add(shadowPlane);

    // 1. Machined optical pedestal (LatheGeometry) grounded flush on bench y=0
    const lathePts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(1.15, 0.0),
      new THREE.Vector2(1.15, 0.18),
      new THREE.Vector2(0.88, 0.28),
      new THREE.Vector2(0.55, 0.42),
      new THREE.Vector2(0.45, 0.92),
      new THREE.Vector2(0.75, 1.05),
      new THREE.Vector2(0.75, 1.15),
      new THREE.Vector2(0.0, 1.15),
    ];
    const pedestalGeo = this.trackGeo(new THREE.LatheGeometry(lathePts, 48));
    const pedestalMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.62,
        metalness: 0.45,
      }),
    );
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    this.qdStageGroup.add(pedestal);

    // 2. Brushed titanium retaining gimbal ring around the suspended nanocrystal
    const gimbalMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x94a3b8,
        roughness: 0.22,
        metalness: 0.92,
        clearcoat: 0.4,
      }),
    );
    const gimbalRing = new THREE.Mesh(
      this.trackGeo(new THREE.TorusGeometry(1.75, 0.045, 16, 72)),
      gimbalMat,
    );
    gimbalRing.position.y = 2.55;
    gimbalRing.rotation.y = Math.PI * 0.18;
    gimbalRing.castShadow = true;
    this.qdStageGroup.add(gimbalRing);

    // Side trunnion posts linking pedestal to gimbal ring
    const postGeo = this.trackGeo(new THREE.CylinderGeometry(0.055, 0.075, 1.55, 16));
    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(postGeo, gimbalMat);
      post.position.set(side * 1.65, 1.8, -side * 0.95);
      post.rotation.z = side * 0.22;
      this.qdStageGroup.add(post);
    }

    // 3. Excitation Laser Aperture Emitter (left of QD)
    const emitterHousing = new THREE.Mesh(
      this.trackGeo(new THREE.CylinderGeometry(0.24, 0.28, 0.95, 24)),
      pedestalMat,
    );
    emitterHousing.rotation.z = Math.PI / 2;
    emitterHousing.position.set(-2.9, 2.55, 0);
    this.qdStageGroup.add(emitterHousing);

    const emitterLens = new THREE.Mesh(
      this.trackGeo(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 24)),
      this.trackMat(
        new THREE.MeshPhysicalMaterial({
          color: 0x93c5fd,
          roughness: 0.08,
          metalness: 0.1,
          transmission: this.isSoftwareGl ? 0 : 0.85,
          transparent: true,
          opacity: this.isSoftwareGl ? 0.5 : 1,
          ior: 1.52,
        }),
      ),
    );
    emitterLens.rotation.z = Math.PI / 2;
    emitterLens.position.set(-2.4, 2.55, 0);
    this.qdStageGroup.add(emitterLens);

    // Excitation beam cylinder from emitter to QD center
    this.excitationBeamMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    const excitationBeam = new THREE.Mesh(
      this.trackGeo(new THREE.CylinderGeometry(0.07, 0.18, 2.4, 20, 1, true)),
      this.excitationBeamMat,
    );
    excitationBeam.rotation.z = Math.PI / 2;
    excitationBeam.position.set(-1.25, 2.55, 0);
    this.qdStageGroup.add(excitationBeam);

    // 4. Colloidal Core-Shell Quantum Dot (centered at y = 2.55 above stage)
    this.qdSpinGroup.position.set(0, 2.55, 0);
    this.qdStageGroup.add(this.qdSpinGroup);

    // Semiconductor Core (faceted Wulff crystal geometry)
    const coreGeo = this.trackGeo(new THREE.IcosahedronGeometry(0.95, 1));
    this.coreMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x1e293b,
        emissive: 0x000000,
        emissiveIntensity: 0,
        roughness: 0.25,
        metalness: 0.65,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
      }),
    );
    this.coreMesh = new THREE.Mesh(coreGeo, this.coreMat);
    this.coreMesh.renderOrder = 1;
    this.qdSpinGroup.add(this.coreMesh);

    // Atomic Zinc-Blende Crystal Lattice (InstancedMesh cations + anions inside core)
    this.latticeSites = buildZincBlendeSites();
    const cations = this.latticeSites.filter((s) => s.isCation);
    const anions = this.latticeSites.filter((s) => !s.isCation);

    const atomGeo = this.trackGeo(new THREE.SphereGeometry(0.068, 12, 10));
    const cationMat = this.trackMat(
      new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.28, metalness: 0.72 }),
    );
    const anionMat = this.trackMat(
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.38, metalness: 0.45 }),
    );

    this.cationInstanced = new THREE.InstancedMesh(atomGeo, cationMat, cations.length);
    this.anionInstanced = new THREE.InstancedMesh(atomGeo, anionMat, anions.length);
    this.cationInstanced.frustumCulled = false;
    this.anionInstanced.frustumCulled = false;
    this.qdSpinGroup.add(this.cationInstanced);
    this.qdSpinGroup.add(this.anionInstanced);

    // 1S Exciton Radial Confinement Standing-Wave Envelope (Custom GLSL Shader)
    this.excitonMat = this.trackMat(
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(0x38bdf8) },
          uActive: { value: 1.0 },
          uFreq: { value: 4.0 },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vLocalPos;
          varying vec3 vViewDir;
          void main() {
            vLocalPos = position;
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
            vViewDir = normalize(-mvPos.xyz);
            gl_Position = projectionMatrix * mvPos;
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uColor;
          uniform float uActive;
          uniform float uFreq;
          varying vec3 vNormal;
          varying vec3 vLocalPos;
          varying vec3 vViewDir;
          void main() {
            float fresnel = pow(1.0 - max(0.0, dot(vNormal, vViewDir)), 2.2);
            float wave = 0.5 + 0.5 * sin(length(vLocalPos) * 8.0 - uTime * uFreq + vLocalPos.y * 3.0);
            float alpha = uActive * (0.12 + 0.42 * fresnel + 0.16 * wave);
            gl_FragColor = vec4(uColor * (0.85 + 0.45 * wave), alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.excitonMesh = new THREE.Mesh(
      this.trackGeo(new THREE.SphereGeometry(0.86, 32, 24)),
      this.excitonMat,
    );
    this.excitonMesh.renderOrder = 2;
    this.qdSpinGroup.add(this.excitonMesh);

    // Epitaxial Passivating ZnS Shell (outer translucent crystalline barrier)
    this.shellMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe2e8f0,
        roughness: 0.12,
        metalness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        ior: 2.36,
        transmission: this.isSoftwareGl ? 0 : 0.72,
        thickness: 0.8,
        transparent: true,
        opacity: this.isSoftwareGl ? 0.28 : 0.88,
        depthWrite: false,
      }),
    );
    this.shellMesh = new THREE.Mesh(
      this.trackGeo(new THREE.IcosahedronGeometry(1.18, 2)),
      this.shellMat,
    );
    this.shellMesh.renderOrder = 3;
    this.qdSpinGroup.add(this.shellMesh);

    // Organic Surface Passivation Ligands (InstancedMesh stalks around shell)
    const ligandGeo = this.trackGeo(new THREE.CylinderGeometry(0.014, 0.022, 0.34, 6));
    ligandGeo.translate(0, 0.17, 0);
    const ligandMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.65,
        metalness: 0.2,
      }),
    );
    const ligandCount = 64;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < ligandCount; i++) {
      const y = 1 - (i / (ligandCount - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      this.ligandDirs.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
    }
    this.ligandInstanced = new THREE.InstancedMesh(ligandGeo, ligandMat, ligandCount);
    this.ligandInstanced.frustumCulled = false;
    this.qdSpinGroup.add(this.ligandInstanced);

    // QD Photoluminescence PointLight illuminating the optical stage
    this.qdPointLight = new THREE.PointLight(0x38bdf8, 3.0, 14, 1.8);
    this.qdPointLight.position.set(0, 2.55, 0);
    this.qdStageGroup.add(this.qdPointLight);

    // Emitted Photoluminescence Optical Path (from QD toward Dispersion Grating)
    this.emissionBeamMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.24,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    const emissionBeam = new THREE.Mesh(
      this.trackGeo(new THREE.CylinderGeometry(0.32, 0.12, 5.4, 24, 1, true)),
      this.emissionBeamMat,
    );
    emissionBeam.rotation.z = Math.PI / 2;
    emissionBeam.position.set(2.9, 2.55, 0);
    this.qdStageGroup.add(emissionBeam);

    // Flowing photon wavepackets along emission optical axis
    const photonGeo = this.trackGeo(new THREE.SphereGeometry(0.055, 8, 8));
    const photonMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.photonInstanced = new THREE.InstancedMesh(photonGeo, photonMat, this.photonPhases.length);
    this.photonInstanced.frustumCulled = false;
    this.qdStageGroup.add(this.photonInstanced);
  }

  private buildProjectionSpectrometer(): void {
    this.projectionGroup.position.set(2.4, -1.65, -0.5);
    this.scene.add(this.projectionGroup);

    const housingMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.58,
        metalness: 0.55,
      }),
    );
    const chromeMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xcbd5e1,
        roughness: 0.16,
        metalness: 0.94,
        clearcoat: 0.6,
      }),
    );

    // 1. Optical Collimator Slit & Blazed Diffraction Grating Mount (x = -2.0 relative to group)
    const slitStand = new THREE.Mesh(
      this.trackGeo(new THREE.BoxGeometry(0.28, 2.4, 1.3)),
      housingMat,
    );
    slitStand.position.set(-2.0, 1.2, 0.5);
    slitStand.castShadow = true;
    this.projectionGroup.add(slitStand);

    const gratingPlate = new THREE.Mesh(
      this.trackGeo(new THREE.BoxGeometry(0.12, 1.25, 0.95)),
      chromeMat,
    );
    gratingPlate.position.set(-1.35, 2.55, 0.45);
    gratingPlate.rotation.y = -0.35;
    this.projectionGroup.add(gratingPlate);

    const gratingPost = new THREE.Mesh(
      this.trackGeo(new THREE.CylinderGeometry(0.09, 0.12, 2.0, 16)),
      housingMat,
    );
    gratingPost.position.set(-1.35, 1.0, 0.45);
    this.projectionGroup.add(gratingPost);

    // 2. Calibrated Spectral Projection Screen Frame & Focal-Plane Canvas
    const frameGroup = new THREE.Group();
    frameGroup.position.set(1.9, 2.25, -0.55);
    frameGroup.rotation.y = -0.24;
    this.projectionGroup.add(frameGroup);

    // Support pillars for projection screen
    for (const xOff of [-2.4, 2.4]) {
      const pillar = new THREE.Mesh(
        this.trackGeo(new THREE.CylinderGeometry(0.08, 0.11, 2.25, 16)),
        housingMat,
      );
      pillar.position.set(xOff, -1.125, -0.08);
      pillar.castShadow = true;
      frameGroup.add(pillar);
    }

    // Beveled outer bezel
    const bezel = new THREE.Mesh(
      this.trackGeo(new THREE.BoxGeometry(6.35, 2.65, 0.18)),
      housingMat,
    );
    bezel.castShadow = true;
    bezel.receiveShadow = true;
    frameGroup.add(bezel);

    // Dynamic spectral projection canvas surface
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    const { ctx, texture } = createProjectionScreenCanvas(maxAniso);
    this.screenCtx = ctx;
    this.screenTex = this.trackTex(texture);
    this.screenMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: this.screenTex,
        emissiveMap: this.screenTex,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.9,
        roughness: 0.45,
        metalness: 0.05,
      }),
    );

    const screenMesh = new THREE.Mesh(
      this.trackGeo(new THREE.PlaneGeometry(6.0, 2.25)),
      this.screenMat,
    );
    screenMesh.position.z = 0.096;
    frameGroup.add(screenMesh);
  }

  private buildExoplanetSystem(): void {
    this.planetGroup.position.set(11.5, 4.2, -16.0);
    this.scene.add(this.planetGroup);

    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    const planetTex = this.trackTex(createExoplanetAlbedoTexture(maxAniso));

    // 1. Exoplanet Cloud-Deck Sphere
    const planetGeo = this.trackGeo(new THREE.SphereGeometry(3.4, 64, 48));
    const planetMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: planetTex,
        roughness: 0.78,
        metalness: 0.04,
      }),
    );
    this.planetMesh = new THREE.Mesh(planetGeo, planetMat);
    this.planetMesh.rotation.z = 0.14;
    this.planetGroup.add(this.planetMesh);

    // 2. Atmospheric Limb Scattering Shader (Rayleigh / Resonance Fresnel)
    this.atmosMat = this.trackMat(
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(0x38bdf8) },
          uIntensity: { value: 0.45 },
          uResonance: { value: 0.0 },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
            vViewDir = normalize(-mvPos.xyz);
            gl_Position = projectionMatrix * mvPos;
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uIntensity;
          uniform float uResonance;
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            float rim = pow(0.68 - dot(vNormal, vViewDir), 3.2);
            float alpha = clamp(rim * (uIntensity + uResonance * 0.65), 0.0, 0.92);
            gl_FragColor = vec4(uColor * (1.0 + uResonance * 0.7), alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    );
    const atmosMesh = new THREE.Mesh(
      this.trackGeo(new THREE.SphereGeometry(3.78, 64, 48)),
      this.atmosMat,
    );
    this.planetGroup.add(atmosMesh);

    // 3. Precision Equatorial / Orbital Inclination Reference Ring
    this.orbitArcMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x475569,
        transparent: true,
        opacity: 0.35,
      }),
    );
    const orbitArc = new THREE.Mesh(
      this.trackGeo(new THREE.TorusGeometry(4.55, 0.02, 10, 96)),
      this.orbitArcMat,
    );
    orbitArc.rotation.x = Math.PI * 0.48;
    orbitArc.rotation.y = 0.18;
    this.planetGroup.add(orbitArc);

    // 4. Distant Host Star behind the transiting exoplanet limb
    this.hostStarMesh = new THREE.Mesh(
      this.trackGeo(new THREE.SphereGeometry(2.1, 32, 24)),
      this.trackMat(
        new THREE.MeshBasicMaterial({
          color: 0xfff3d6,
        }),
      ),
    );
    this.hostStarMesh.position.set(16.5, 6.2, -32.0);
    this.scene.add(this.hostStarMesh);
  }

  public setCameraPreset(preset: CameraPreset): void {
    const pose = CAMERA_POSES[preset];
    this.desiredCamPos.copy(pose.position);
    this.desiredCamTarget.copy(pose.target);
    this.cameraTransitionActive = true;
  }

  public applySimulationState(sim: QuantumSimulationState): void {
    this.simState = sim;

    // 1. Scale Quantum Dot assembly realistically with nanoparticle radius R (1.2 - 5.5 nm)
    const normalizedRadius = (sim.radiusNm - 1.2) / (5.5 - 1.2);
    const visualScale = 0.62 + normalizedRadius * 0.56;
    this.qdSpinGroup.scale.setScalar(visualScale);

    // Update atomic lattice cation/anion colors & visible active atom count based on physical radius
    const cationMat = this.cationInstanced.material as THREE.MeshStandardMaterial;
    const anionMat = this.anionInstanced.material as THREE.MeshStandardMaterial;
    cationMat.color.setHex(sim.material.cationHex);
    anionMat.color.setHex(sim.material.anionHex);

    const activeCutoff = 0.42 + normalizedRadius * 0.58;
    let cIdx = 0;
    let aIdx = 0;
    for (let i = 0; i < this.latticeSites.length; i++) {
      const site = this.latticeSites[i];
      const visible = site.rNorm <= activeCutoff;
      _vec3.set(site.x, site.y, site.z);
      _scale.setScalar(visible ? 1 : 0);
      _quat.identity();
      _mat4.compose(_vec3, _quat, _scale);
      if (site.isCation) {
        this.cationInstanced.setMatrixAt(cIdx++, _mat4);
      } else {
        this.anionInstanced.setMatrixAt(aIdx++, _mat4);
      }
    }
    this.cationInstanced.instanceMatrix.needsUpdate = true;
    this.anionInstanced.instanceMatrix.needsUpdate = true;
    this.cationInstanced.computeBoundingSphere();
    this.anionInstanced.computeBoundingSphere();

    // Update surface passivation ligand orientations on the ZnS shell
    for (let i = 0; i < this.ligandDirs.length; i++) {
      const dir = this.ligandDirs[i];
      _vec3.copy(dir).multiplyScalar(1.14);
      _quat.setFromUnitVectors(_up, dir);
      _scale.set(1, 0.85 + 0.25 * (1 - normalizedRadius), 1);
      _mat4.compose(_vec3, _quat, _scale);
      this.ligandInstanced.setMatrixAt(i, _mat4);
    }
    this.ligandInstanced.instanceMatrix.needsUpdate = true;
    this.ligandInstanced.computeBoundingSphere();

    // 2. Excitation laser color
    this.excitationBeamMat.color.setHex(sim.excitationColor.hex);
    this.excitationBeamMat.opacity = 0.14 + Math.min(0.45, (sim.excitationEv - 1.4) * 0.13);

    // 3. Core luminescence, Exciton standing wave, Emission Beam & Bloom
    if (sim.isEmitting) {
      _color.setHex(sim.emissionColor.hex);
      this.coreMat.emissive.copy(_color);
      this.coreMat.emissiveIntensity = 1.2 + sim.emissionIntensity * 1.6;
      this.shellMat.emissive.copy(_color);
      this.shellMat.emissiveIntensity = 0.28 * sim.emissionIntensity;

      this.excitonMat.uniforms.uColor.value.copy(_color);
      this.excitonMat.uniforms.uActive.value = sim.emissionIntensity;
      this.excitonMat.uniforms.uFreq.value = 2.5 + sim.bandgapEv * 1.4;

      this.qdPointLight.color.copy(_color);
      this.qdPointLight.intensity = 2.2 + sim.emissionIntensity * 3.8;

      this.emissionBeamMat.color.copy(_color);
      this.emissionBeamMat.opacity = 0.08 + sim.emissionIntensity * 0.24;
      (this.photonInstanced.material as THREE.MeshBasicMaterial).color.copy(_color);
      this.photonInstanced.visible = true;

      if (this.bloomPass) {
        this.bloomPass.strength = 0.42 + sim.emissionIntensity * 0.38;
      }
    } else {
      this.coreMat.emissive.setHex(0x0f172a);
      this.coreMat.emissiveIntensity = 0.08;
      this.shellMat.emissive.setHex(0x000000);
      this.shellMat.emissiveIntensity = 0;

      this.excitonMat.uniforms.uActive.value = 0.0;
      this.qdPointLight.intensity = 0.2;
      this.emissionBeamMat.opacity = 0.02;
      this.photonInstanced.visible = false;

      if (this.bloomPass) {
        this.bloomPass.strength = 0.15;
      }
    }

    // 4. Update 3D Projection Screen texture
    paintProjectionScreen(this.screenCtx, this.screenTex, sim);

    // 5. Update Exoplanet atmospheric limb resonance
    if (sim.activeMatch) {
      _color.setHex(sim.emissionColor.hex);
      this.atmosMat.uniforms.uColor.value.copy(_color);
      this.atmosMat.uniforms.uResonance.value = sim.activeMatch.overlapStrength;
      this.orbitArcMat.color.copy(_color);
      this.orbitArcMat.opacity = 0.42 + sim.activeMatch.overlapStrength * 0.35;
    } else {
      this.atmosMat.uniforms.uColor.value.setHex(0x60a5fa);
      this.atmosMat.uniforms.uResonance.value = 0.0;
      this.orbitArcMat.color.setHex(0x475569);
      this.orbitArcMat.opacity = 0.32;
    }
  }

  public resize(): void {
    this.handleResize();
  }

  private handleResize(): void {
    if (this.disposed) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    if (this.composer) {
      this.composer.setSize(width, height);
    }
    if (this.bloomPass) {
      this.bloomPass.resolution.set(width, height);
    }
  }

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl.fenceSync) {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) {
        if (sync) gl.deleteSync(sync);
        return;
      }
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private tick = (): void => {
    if (this.disposed) return;

    const delta = Math.min(0.05, this.clock.getDelta());
    const elapsed = this.clock.getElapsedTime();

    // Smoothly damp camera toward active preset if not overridden by manual OrbitControls
    if (this.cameraTransitionActive) {
      this.camera.position.x = THREE.MathUtils.damp(
        this.camera.position.x,
        this.desiredCamPos.x,
        5.5,
        delta,
      );
      this.camera.position.y = THREE.MathUtils.damp(
        this.camera.position.y,
        this.desiredCamPos.y,
        5.5,
        delta,
      );
      this.camera.position.z = THREE.MathUtils.damp(
        this.camera.position.z,
        this.desiredCamPos.z,
        5.5,
        delta,
      );

      this.controls.target.x = THREE.MathUtils.damp(
        this.controls.target.x,
        this.desiredCamTarget.x,
        5.5,
        delta,
      );
      this.controls.target.y = THREE.MathUtils.damp(
        this.controls.target.y,
        this.desiredCamTarget.y,
        5.5,
        delta,
      );
      this.controls.target.z = THREE.MathUtils.damp(
        this.controls.target.z,
        this.desiredCamTarget.z,
        5.5,
        delta,
      );

      if (
        this.camera.position.distanceToSquared(this.desiredCamPos) < 0.001 &&
        this.controls.target.distanceToSquared(this.desiredCamTarget) < 0.001
      ) {
        this.cameraTransitionActive = false;
      }
    }

    // Quantum Dot crystalline rotation & exciton wave
    this.qdSpinGroup.rotation.y += delta * 0.28;
    this.qdSpinGroup.rotation.x = Math.sin(elapsed * 0.45) * 0.14;
    this.excitonMat.uniforms.uTime.value = elapsed;

    // Stream photoluminescence wavepackets from QD to optical grating
    if (this.simState.isEmitting) {
      const speed = 0.45 + this.simState.emissionIntensity * 0.35;
      for (let i = 0; i < this.photonPhases.length; i++) {
        const phase = (this.photonPhases[i] + elapsed * speed) % 1;
        const x = 0.65 + phase * 5.1;
        const spread = 0.06 + phase * 0.18;
        const y = 2.55 + Math.sin(i * 2.1 + elapsed * 3.0) * spread;
        const z = Math.cos(i * 1.7 + elapsed * 2.5) * spread;
        _vec3.set(x, y, z);
        _quat.identity();
        _scale.setScalar(0.75 + 0.45 * Math.sin(phase * Math.PI));
        _mat4.compose(_vec3, _quat, _scale);
        this.photonInstanced.setMatrixAt(i, _mat4);
      }
      this.photonInstanced.instanceMatrix.needsUpdate = true;
    }

    // Exoplanet axial rotation
    this.planetMesh.rotation.y += delta * 0.06;

    this.controls.update();

    if (this.isSoftwareGl || !this.composer) {
      this.renderer.render(this.scene, this.camera);
    } else {
      this.composer.render();
    }

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    window.clearTimeout(this.frameId);

    window.removeEventListener('resize', this.onResizeBound);
    this.controls.removeEventListener('start', this.onControlsStartBound);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLostBound);
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.onContextRestoredBound);

    this.controls.dispose();
    this.composer?.dispose();
    this.envRenderTarget.dispose();

    for (const geo of this.disposableGeometries) geo.dispose();
    for (const mat of this.disposableMaterials) mat.dispose();
    for (const tex of this.disposableTextures) tex.dispose();

    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
