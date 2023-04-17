import '../../tools/sidekick/library/index.js';
import { readBlockConfig } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const library = document.createElement('franklin-library');

  block.replaceChildren(library);
}