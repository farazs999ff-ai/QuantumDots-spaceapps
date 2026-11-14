import PptxGenJS from 'pptxgenjs';
import { PRESENTATION_SLIDES, PRESENTERS, PresentationSlide } from './deckData';

const COLORS = {
  bg: '070A11',
  surface: '0F172A',
  surfaceAlt: '111C33',
  border: '1E293B',
  textPrimary: 'F1F5F9',
  textSecondary: '94A3B8',
  textMuted: '64748B',
  accentCyan: '38BDF8',
  accentEmerald: '34D399',
  accentAmber: 'FBBF24',
};

function addSlideChrome(
  slide: PptxGenJS.Slide,
  slideData: PresentationSlide,
  presenterName: string,
  presenterRole: string,
): void {
  slide.background = { color: COLORS.bg };

  // Subtle top rule
  slide.addShape('rect', {
    x: 0.6,
    y: 0.45,
    w: 12.13,
    h: 0.015,
    fill: { color: COLORS.border },
  });

  // Kicker & Presenter header
  slide.addText(slideData.kicker.toUpperCase(), {
    x: 0.6,
    y: 0.18,
    w: 3.5,
    h: 0.25,
    fontFace: 'IBM Plex Mono',
    fontSize: 9,
    color: COLORS.accentCyan,
    bold: true,
  });

  slide.addText(`${presenterName}  ·  ${presenterRole}`, {
    x: 4.5,
    y: 0.18,
    w: 8.23,
    h: 0.25,
    align: 'right',
    fontFace: 'IBM Plex Sans',
    fontSize: 9.5,
    color: COLORS.textSecondary,
  });

  // Slide Title & Subtitle
  slide.addText(slideData.title, {
    x: 0.6,
    y: 0.62,
    w: 12.13,
    h: 0.55,
    fontFace: 'IBM Plex Sans',
    fontSize: 25,
    bold: true,
    color: COLORS.textPrimary,
  });

  slide.addText(slideData.subtitle, {
    x: 0.6,
    y: 1.16,
    w: 12.13,
    h: 0.36,
    fontFace: 'IBM Plex Sans',
    fontSize: 12,
    color: COLORS.textSecondary,
  });

  // Footer
  slide.addShape('rect', {
    x: 0.6,
    y: 6.98,
    w: 12.13,
    h: 0.012,
    fill: { color: COLORS.border },
  });

  slide.addText('Quantum Dots in Projection  ·  Optical Spectroscopy Simulation', {
    x: 0.6,
    y: 7.05,
    w: 8.0,
    h: 0.28,
    fontFace: 'IBM Plex Sans',
    fontSize: 8.5,
    color: COLORS.textMuted,
  });

  slide.addText(`${slideData.number} / ${PRESENTATION_SLIDES.length}`, {
    x: 11.2,
    y: 7.05,
    w: 1.53,
    h: 0.28,
    align: 'right',
    fontFace: 'IBM Plex Mono',
    fontSize: 8.5,
    color: COLORS.textMuted,
  });

  // Embed presenter cue in PowerPoint speaker notes
  slide.addNotes(`[${presenterName} — ${presenterRole}]\n\n${slideData.speakerNotes}`);
}

function addBullets(
  slide: PptxGenJS.Slide,
  items: string[],
  x: number,
  y: number,
  w: number,
  h: number,
  fontSize = 12,
): void {
  const runs = items.map((text) => ({
    text,
    options: {
      bullet: { code: '2022' },
      color: COLORS.textPrimary,
      fontSize,
      fontFace: 'IBM Plex Sans',
      paraSpaceAfter: 9,
      breakLine: true,
    },
  }));
  slide.addText(runs, { x, y, w, h, valign: 'top' });
}

export function createPresentationDeck(customPresenterNames?: string[]): PptxGenJS {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 in
  pptx.author = 'Quantum Dots in Projection Team';
  pptx.title = 'Quantum Dots in Projection — Technical Explanation';
  pptx.subject = 'Brus Quantum Confinement & Exoplanet Transmission Spectroscopy';

  const resolvedNames = PRESENTERS.map(
    (p, idx) => customPresenterNames?.[idx]?.trim() || p.defaultName,
  );

  for (const slideData of PRESENTATION_SLIDES) {
    const slide = pptx.addSlide();
    const presenter = PRESENTERS[slideData.presenterIndex];
    const presenterName = resolvedNames[slideData.presenterIndex];

    addSlideChrome(slide, slideData, presenterName, presenter.role);

    if (slideData.layout === 'title') {
      // KPI strip
      if (slideData.stats) {
        const cardW = 2.88;
        const gap = 0.2;
        slideData.stats.forEach((stat, i) => {
          const cx = 0.6 + i * (cardW + gap);
          slide.addShape('roundRect', {
            x: cx,
            y: 1.75,
            w: cardW,
            h: 1.15,
            rectRadius: 0.08,
            fill: { color: COLORS.surface },
            line: { color: COLORS.border, width: 1 },
          });
          slide.addText(stat.label.toUpperCase(), {
            x: cx + 0.18,
            y: 1.9,
            w: cardW - 0.36,
            h: 0.25,
            fontFace: 'IBM Plex Sans',
            fontSize: 9,
            color: COLORS.textSecondary,
          });
          slide.addText(`${stat.value}${stat.unit ? ` ${stat.unit}` : ''}`, {
            x: cx + 0.18,
            y: 2.22,
            w: cardW - 0.36,
            h: 0.48,
            fontFace: 'IBM Plex Mono',
            fontSize: 18,
            bold: true,
            color: COLORS.accentCyan,
          });
        });
      }

      // Summary points
      if (slideData.bullets) {
        slide.addShape('roundRect', {
          x: 0.6,
          y: 3.15,
          w: 12.13,
          h: 1.55,
          rectRadius: 0.08,
          fill: { color: COLORS.surface },
          line: { color: COLORS.border, width: 1 },
        });
        addBullets(slide, slideData.bullets, 0.85, 3.3, 11.6, 1.3, 12.5);
      }

      // 6-Presenter Roster Strip
      slide.addText('TEAM PRESENTATION PLAN (6 PRESENTERS · 9 SLIDES)', {
        x: 0.6,
        y: 4.92,
        w: 12.13,
        h: 0.26,
        fontFace: 'IBM Plex Mono',
        fontSize: 9.5,
        bold: true,
        color: COLORS.textSecondary,
      });

      const memW = 1.9;
      const memGap = 0.145;
      PRESENTERS.forEach((p, idx) => {
        const mx = 0.6 + idx * (memW + memGap);
        slide.addShape('roundRect', {
          x: mx,
          y: 5.25,
          w: memW,
          h: 1.48,
          rectRadius: 0.07,
          fill: { color: COLORS.surfaceAlt },
          line: { color: COLORS.border, width: 1 },
        });
        slide.addText(resolvedNames[idx], {
          x: mx + 0.12,
          y: 5.38,
          w: memW - 0.24,
          h: 0.28,
          fontFace: 'IBM Plex Sans',
          fontSize: 11,
          bold: true,
          color: COLORS.textPrimary,
        });
        slide.addText(p.role, {
          x: mx + 0.12,
          y: 5.7,
          w: memW - 0.24,
          h: 0.52,
          fontFace: 'IBM Plex Sans',
          fontSize: 9,
          color: COLORS.textSecondary,
        });
        slide.addText(`Slides ${p.slideNumbers.join(', ')}`, {
          x: mx + 0.12,
          y: 6.32,
          w: memW - 0.24,
          h: 0.26,
          fontFace: 'IBM Plex Mono',
          fontSize: 9,
          color: COLORS.accentEmerald,
        });
      });
    } else if (slideData.layout === 'flow' && slideData.flowSteps) {
      const boxW = 2.85;
      const gap = 0.24;
      slideData.flowSteps.forEach((step, i) => {
        const bx = 0.6 + i * (boxW + gap);
        slide.addShape('roundRect', {
          x: bx,
          y: 1.8,
          w: boxW,
          h: 2.95,
          rectRadius: 0.08,
          fill: { color: COLORS.surface },
          line: { color: COLORS.border, width: 1 },
        });
        slide.addText(`STAGE ${step.step}`, {
          x: bx + 0.2,
          y: 1.98,
          w: boxW - 0.4,
          h: 0.26,
          fontFace: 'IBM Plex Mono',
          fontSize: 9.5,
          bold: true,
          color: COLORS.accentCyan,
        });
        slide.addText(step.title, {
          x: bx + 0.2,
          y: 2.32,
          w: boxW - 0.4,
          h: 0.55,
          fontFace: 'IBM Plex Sans',
          fontSize: 13.5,
          bold: true,
          color: COLORS.textPrimary,
        });
        slide.addText(step.detail, {
          x: bx + 0.2,
          y: 2.95,
          w: boxW - 0.4,
          h: 1.6,
          fontFace: 'IBM Plex Sans',
          fontSize: 11,
          color: COLORS.textSecondary,
          valign: 'top',
        });
      });

      if (slideData.bullets) {
        slide.addShape('roundRect', {
          x: 0.6,
          y: 5.05,
          w: 12.13,
          h: 1.55,
          rectRadius: 0.08,
          fill: { color: COLORS.surfaceAlt },
          line: { color: COLORS.border, width: 1 },
        });
        addBullets(slide, slideData.bullets, 0.85, 5.25, 11.6, 1.25, 12.5);
      }
    } else if (slideData.layout === 'equation' && slideData.equation) {
      slide.addShape('roundRect', {
        x: 0.6,
        y: 1.75,
        w: 12.13,
        h: 1.3,
        rectRadius: 0.08,
        fill: { color: COLORS.surfaceAlt },
        line: { color: COLORS.accentCyan, width: 1 },
      });
      slide.addText(slideData.equation.formula, {
        x: 0.8,
        y: 1.92,
        w: 11.73,
        h: 0.55,
        align: 'center',
        fontFace: 'IBM Plex Mono',
        fontSize: 14,
        bold: true,
        color: COLORS.textPrimary,
      });
      slide.addText(slideData.equation.caption, {
        x: 0.8,
        y: 2.58,
        w: 11.73,
        h: 0.3,
        align: 'center',
        fontFace: 'IBM Plex Sans',
        fontSize: 10.5,
        color: COLORS.textSecondary,
      });

      // Terms grid
      const termW = 5.95;
      slideData.equation.terms.forEach((term, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const tx = 0.6 + col * (termW + 0.23);
        const ty = 3.28 + row * 1.1;
        slide.addShape('roundRect', {
          x: tx,
          y: ty,
          w: termW,
          h: 0.92,
          rectRadius: 0.07,
          fill: { color: COLORS.surface },
          line: { color: COLORS.border, width: 1 },
        });
        slide.addText(term.symbol, {
          x: tx + 0.2,
          y: ty + 0.14,
          w: 2.0,
          h: 0.64,
          fontFace: 'IBM Plex Mono',
          fontSize: 12.5,
          bold: true,
          color: COLORS.accentCyan,
          valign: 'middle',
        });
        slide.addText(term.meaning, {
          x: tx + 2.2,
          y: ty + 0.14,
          w: termW - 2.4,
          h: 0.64,
          fontFace: 'IBM Plex Sans',
          fontSize: 11,
          color: COLORS.textPrimary,
          valign: 'middle',
        });
      });

      if (slideData.stats) {
        const sw = 3.9;
        slideData.stats.forEach((stat, idx) => {
          const sx = 0.6 + idx * (sw + 0.215);
          slide.addShape('roundRect', {
            x: sx,
            y: 5.6,
            w: sw,
            h: 1.05,
            rectRadius: 0.07,
            fill: { color: COLORS.surface },
            line: { color: COLORS.border, width: 1 },
          });
          slide.addText(stat.label, {
            x: sx + 0.2,
            y: 5.72,
            w: sw - 0.4,
            h: 0.25,
            fontFace: 'IBM Plex Sans',
            fontSize: 9.5,
            color: COLORS.textSecondary,
          });
          slide.addText(`${stat.value} ${stat.unit ?? ''}`, {
            x: sx + 0.2,
            y: 6.02,
            w: sw - 0.4,
            h: 0.45,
            fontFace: 'IBM Plex Mono',
            fontSize: 14.5,
            bold: true,
            color: COLORS.accentEmerald,
          });
        });
      }
    } else if (slideData.layout === 'table' && slideData.table) {
      const cellMargin: [number, number, number, number] = [8, 10, 8, 10];
      const tableRows: PptxGenJS.TableRow[] = [
        slideData.table.headers.map((h) => ({
          text: h,
          options: {
            fill: { color: COLORS.surfaceAlt },
            color: COLORS.accentCyan,
            fontFace: 'IBM Plex Mono',
            fontSize: 10.5,
            bold: true,
            margin: cellMargin,
          },
        })),
        ...slideData.table.rows.map((row) =>
          row.map((cell, ci) => ({
            text: cell,
            options: {
              fill: { color: COLORS.surface },
              color: COLORS.textPrimary,
              fontFace: ci === 0 ? 'IBM Plex Sans' : 'IBM Plex Mono',
              fontSize: 11,
              bold: ci === 0,
              margin: cellMargin,
            },
          })),
        ),
      ];

      slide.addTable(tableRows, {
        x: 0.6,
        y: 1.75,
        w: 12.13,
        border: { pt: 1, color: COLORS.border },
        colW: [3.63, 1.5, 1.8, 1.7, 1.7, 1.8],
      });

      if (slideData.bullets) {
        slide.addShape('roundRect', {
          x: 0.6,
          y: 4.5,
          w: 12.13,
          h: 2.1,
          rectRadius: 0.08,
          fill: { color: COLORS.surface },
          line: { color: COLORS.border, width: 1 },
        });
        addBullets(slide, slideData.bullets, 0.85, 4.72, 11.6, 1.75, 12.5);
      }
    } else if (slideData.columns) {
      const colW = 5.92;
      const boxH = slideData.stats ? 3.8 : 4.95;
      slideData.columns.forEach((col, i) => {
        const cx = 0.6 + i * (colW + 0.29);
        slide.addShape('roundRect', {
          x: cx,
          y: 1.75,
          w: colW,
          h: boxH,
          rectRadius: 0.08,
          fill: { color: COLORS.surface },
          line: { color: COLORS.border, width: 1 },
        });
        slide.addText(col.heading, {
          x: cx + 0.24,
          y: 1.95,
          w: colW - 0.48,
          h: 0.35,
          fontFace: 'IBM Plex Sans',
          fontSize: 14,
          bold: true,
          color: i === 0 ? COLORS.accentCyan : COLORS.accentEmerald,
        });
        addBullets(slide, col.items, cx + 0.24, 2.42, colW - 0.48, boxH - 0.8, 11.5);
      });

      if (slideData.stats) {
        const sw = 3.9;
        slideData.stats.forEach((stat, idx) => {
          const sx = 0.6 + idx * (sw + 0.215);
          slide.addShape('roundRect', {
            x: sx,
            y: 5.75,
            w: sw,
            h: 0.95,
            rectRadius: 0.07,
            fill: { color: COLORS.surfaceAlt },
            line: { color: COLORS.border, width: 1 },
          });
          slide.addText(stat.label, {
            x: sx + 0.2,
            y: 5.84,
            w: sw - 0.4,
            h: 0.24,
            fontFace: 'IBM Plex Sans',
            fontSize: 9.5,
            color: COLORS.textSecondary,
          });
          slide.addText(`${stat.value} ${stat.unit ?? ''}`, {
            x: sx + 0.2,
            y: 6.12,
            w: sw - 0.4,
            h: 0.42,
            fontFace: 'IBM Plex Mono',
            fontSize: 14,
            bold: true,
            color: COLORS.textPrimary,
          });
        });
      }
    }
  }

  return pptx;
}

export async function downloadPresentationPptx(customPresenterNames?: string[]): Promise<void> {
  const pptx = createPresentationDeck(customPresenterNames);
  await pptx.writeFile({ fileName: 'Quantum_Dots_in_Projection_9_Slides.pptx' });
}
