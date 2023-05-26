/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-disable consistent-return */

import {
  createCopy,
  createTag, getMetadata, readBlockConfig, toCamelCase,
} from '../../utils/dom.js';

export function getLibraryMetadata(block) {
  const libraryMetadata = block.querySelector('.library-metadata');
  const metadata = {};
  if (libraryMetadata) {
    const meta = readBlockConfig(libraryMetadata);
    Object.keys(meta).forEach((key) => {
      if (key === 'style') return;

      metadata[toCamelCase(key)] = meta[key];
    });
    libraryMetadata.remove();

    return metadata;
  }
}

/**
 * Get the default library metadata for a document.
 * @param {*} document
 * @returns
 */
export function getDefaultLibraryMetadata(document) {
  const defaultLibraryMetadataElement = document.querySelector(':scope > div > .library-metadata:only-child');
  if (defaultLibraryMetadataElement) {
    return getLibraryMetadata(defaultLibraryMetadataElement.parentElement);
  }

  return {};
}

export function getBlockName(block, includeVariants = true) {
  if (!block) return;

  const classes = block.className.split(' ');
  const name = classes.shift();
  if (!includeVariants) {
    return name;
  }

  return classes.length > 0 ? `${name} (${classes.join(', ')})` : name;
}

export function getTable(block, name, path) {
  const url = new URL(path);
  block.querySelectorAll('img').forEach((img) => {
    if (!img.src.includes('data:')) {
      const srcSplit = img.src.split('/');
      const mediaPath = srcSplit.pop();
      img.src = `${url.origin}/${mediaPath}`;
    }

    const { width, height } = img;
    const ratio = width > 200 ? 200 / width : 1;
    img.width = width * ratio;
    img.height = height * ratio;
  });

  block.querySelectorAll('span.icon').forEach((icon) => {
    const classNames = icon.className.split(' ');

    // Loop through each class
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < classNames.length; i++) {
      const className = classNames[i];

      // Check if the class starts with "icon-"
      if (className.startsWith('icon-')) {
        // Remove the "icon-" prefix
        const iconName = className.replace('icon-', '');
        // eslint-disable-next-line no-param-reassign
        icon.parentElement.textContent = `:${iconName}:`;
        break;
      }
    }
  });
  const rows = [...block.children];
  const maxCols = rows.reduce(
    (cols, row) => (row.children.length > cols ? row.children.length : cols),
    0,
  );

  const table = document.createElement('table');
  table.setAttribute('border', '1');

  const backgroundColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--sk-table-bg-color') || '#ff8012';

  const foregroundColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--sk-table-fg-color') || '#ffffff';

  const headerRow = document.createElement('tr');
  headerRow.append(createTag('td', { colspan: maxCols, style: `background-color: ${backgroundColor}; color: ${foregroundColor};  height:23px;` }, name));
  table.append(headerRow);
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    [...row.children].forEach((col) => {
      const td = document.createElement('td');
      if (row.children.length < maxCols) {
        td.setAttribute('colspan', maxCols);
      }
      td.innerHTML = col.innerHTML;
      tr.append(td);
    });
    table.append(tr);
  });
  return table.outerHTML;
}

export function getBlockTags(block) {
  const blockName = getAuthorName(block) || getBlockName(block);
  if (block.nextElementSibling?.className !== 'library-metadata') {
    return blockName;
  }
  const libraryMetadata = getMetadata(block.nextElementSibling);
  return libraryMetadata?.searchtags?.text
    ? `${libraryMetadata?.searchtags?.text} ${blockName}`
    : blockName;
}

export function isMatchingBlock(pageBlock, query) {
  const tagsString = getBlockTags(pageBlock);
  if (!query || !tagsString) return false;
  const searchTokens = query.split(' ');
  return searchTokens.every(token => tagsString.toLowerCase().includes(token.toLowerCase()));
}

export async function fetchBlock(path) {
  if (!window.blocks) {
    window.blocks = {};
  }
  if (!window.blocks[path]) {
    const resp = await fetch(`${path}.plain.html`);
    if (!resp.ok) return;

    const html = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    window.blocks[path] = doc;
  }

  return window.blocks[path];
}

export function parseDescription(description) {
  if (!description) return;

  return Array.isArray(description)
    ? description.map(item => `<p>${item}</p>`).join(' ')
    : description;
}

export function copyBlock(element, name, path) {
  const table = getTable(
    element,
    name,
    path,
  );
  const blob = new Blob([table], { type: 'text/html' });
  createCopy(blob);
}
