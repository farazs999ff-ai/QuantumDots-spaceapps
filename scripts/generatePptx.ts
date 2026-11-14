import path from 'node:path';
import { createPresentationDeck } from '../src/presentation/exportPptx';

async function main() {
  const pptx = createPresentationDeck();
  const outPath = path.resolve(process.cwd(), 'public', 'Quantum_Dots_in_Projection_9_Slides.pptx');
  await pptx.writeFile({ fileName: outPath });
  console.log(`Generated ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
