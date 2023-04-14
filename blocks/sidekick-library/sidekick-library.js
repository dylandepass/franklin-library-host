import '../../library/library.js';
import { readBlockConfig } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const library = document.createElement('franklin-library');
  library.config = {};

  Object.keys(blockConfig).forEach((attr) => {
    library.config[attr] = blockConfig[attr];
  })

  block.replaceChildren(library);
}