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

/* eslint-disable no-await-in-loop, no-param-reassign, consistent-return, no-plusplus */

import { Overlay } from '@spectrum-web-components/overlay';
import {
  copyBlock,
  fetchBlock,
  getBlockName,
  getDefaultLibraryMetadata,
  getLibraryMetadata,
  isMatchingBlock,
  parseDescription,
} from './utils.js';
import {
  createSideNavItem, createTag,
} from '../../utils/dom.js';
import { APP_EVENTS } from '../../events/events.js';

// The currently active block element
let activeBlockElement;
let activeOverlayContent;
let selectedElement;
let iframeFocused = false;

function renderNoResults() {
  return /* html */`
    <div class="message-container">
        <sp-illustrated-message
        heading="No results"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 150 103"
                width="150"
                height="103"
                viewBox="0 0 150 103"
            >
                <path
                    d="M133.7,8.5h-118c-1.9,0-3.5,1.6-3.5,3.5v27c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5V23.5h119V92c0,0.3-0.2,0.5-0.5,0.5h-118c-0.3,0-0.5-0.2-0.5-0.5V69c0-0.8-0.7-1.5-1.5-1.5s-1.5,0.7-1.5,1.5v23c0,1.9,1.6,3.5,3.5,3.5h118c1.9,0,3.5-1.6,3.5-3.5V12C137.2,10.1,135.6,8.5,133.7,8.5z M15.2,21.5V12c0-0.3,0.2-0.5,0.5-0.5h118c0.3,0,0.5,0.2,0.5,0.5v9.5H15.2z M32.6,16.5c0,0.6-0.4,1-1,1h-10c-0.6,0-1-0.4-1-1s0.4-1,1-1h10C32.2,15.5,32.6,15.9,32.6,16.5z M13.6,56.1l-8.6,8.5C4.8,65,4.4,65.1,4,65.1c-0.4,0-0.8-0.1-1.1-0.4c-0.6-0.6-0.6-1.5,0-2.1l8.6-8.5l-8.6-8.5c-0.6-0.6-0.6-1.5,0-2.1c0.6-0.6,1.5-0.6,2.1,0l8.6,8.5l8.6-8.5c0.6-0.6,1.5-0.6,2.1,0c0.6,0.6,0.6,1.5,0,2.1L15.8,54l8.6,8.5c0.6,0.6,0.6,1.5,0,2.1c-0.3,0.3-0.7,0.4-1.1,0.4c-0.4,0-0.8-0.1-1.1-0.4L13.6,56.1z"
                ></path>
            </svg>
        </sp-illustrated-message>
    </div>
    `;
}

function onPreview(event, path) {
  event.stopPropagation();
  window.open(path, '_blockpreview');
}

function renderScaffolding() {
  return /* html */`
    <sp-split-view 
        primary-size="350" 
        dir="ltr" 
        splitter-pos="250"
        resizable
      >
      <div class="menu">
        <div class="search">
          <sp-search></sp-search>
        </div>
      </div>
      <div class="content">
        <sp-split-view
          vertical
          resizable
          primary-size="2600"
          secondary-min="200"
          splitter-pos="250"
        >
          <div class="view">
            <div class="action-bar">
              <sp-action-group compact emphasized selects="single" selected="desktop">
                <sp-action-button value="mobile">
                    <sp-icon-device-phone slot="icon"></sp-icon-device-phone>
                    Mobile
                </sp-action-button>
                <sp-action-button value="tablet">
                    <sp-icon-device-tablet slot="icon"></sp-icon-device-tablet>
                    Tablet
                </sp-action-button>
                <sp-action-button value="desktop">
                    <sp-icon-device-desktop slot="icon"></sp-icon-device-desktop>
                    Desktop
                </sp-action-button>
              </sp-action-group>
              <sp-divider size="s"></sp-divider>
            </div>
            <div class="frame-view">
              <iframe></iframe>
            </div>
          </div>
          <div class="details-container">
            <div class="action-bar">
              <h3 class="block-title"></h3>
              <div class="actions">
                  <sp-action-button class="copy-button">Copy Block</sp-action-button>
              </div>
            </div>
            <sp-divider size="s"></sp-divider>
            <div class="details"></div>
          </div>
        </sp-split-view>
      </div>
    </sp-split-view>
  `;
}

function handleMutations(mutations) {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes') {
      if (mutation.attributeName === 'src') {
        const modifiedImgId = mutation.target.getAttribute('data-library-id');
        const modifiedEleemnt = activeBlockElement.querySelector(`[data-library-id="${modifiedImgId}"]`);
        modifiedEleemnt.src = mutation.target.src;
        modifiedEleemnt.width = mutation.target.width;
        modifiedEleemnt.height = mutation.target.height;
      }
    } else if (mutation.type === 'characterData') {
      const modifiedTextId = mutation.target.parentElement.getAttribute('data-library-id');
      const modifiedEleemnt = activeBlockElement.querySelector(`[data-library-id="${modifiedTextId}"]`);
      if (modifiedEleemnt) {
        // console.log('old', mutation.oldValue);
        // console.log('new', mutation.target.nodeValue);
      }
      modifiedEleemnt.innerHTML = mutation.target.parentElement.innerHTML;
    } else if (mutation.type === 'childList') {
      if (mutation.addedNodes.length > 0) {
        const modifiedTextId = mutation.target.getAttribute('data-library-id');
        const modifiedEleemnt = activeBlockElement.querySelector(`[data-library-id="${modifiedTextId}"]`);
        modifiedEleemnt.replaceChildren();
        for (const child of mutation.addedNodes) {
          const clonedContent = child.cloneNode(true);
          modifiedEleemnt.textContent = clonedContent.textContent;
        }
      }
    }
  });
}

function disableContentEditable(up, twoup) {
  up.removeAttribute('contentEditable');
  up.removeAttribute('data-library-id');

  if (twoup) {
    twoup.removeAttribute('contentEditable');
    twoup.removeAttribute('data-library-id');
  }
}

function decorateEditableElements(block) {
  [...block.querySelectorAll('p, strong, a, h1, h2, h3, h4, h5, h6')].forEach((el) => {
    el.setAttribute('contentEditable', true);
    el.setAttribute('data-library-id', window.crypto.randomUUID());
  });

  [...block.querySelectorAll('a')].forEach((el) => {
    const up = el.parentElement;
    const twoup = el.parentElement.parentElement;

    const isUpSingleNodeP = up.childNodes.length === 1 && up.tagName === 'P';
    const isTwoUpSingleNodeP = twoup.childNodes.length === 1 && twoup.tagName === 'P';
    const isTwoUpSingleNodeDiv = twoup.childNodes.length === 1 && twoup.tagName === 'DIV';
    const isUpSingleNodeStrong = up.childNodes.length === 1 && up.tagName === 'STRONG';
    const isUpSingleNodeEm = up.childNodes.length === 1 && up.tagName === 'EM';

    if (isUpSingleNodeP
      || (isTwoUpSingleNodeP && isUpSingleNodeStrong)
      || (isTwoUpSingleNodeDiv && isUpSingleNodeP)
      || (isTwoUpSingleNodeP && isUpSingleNodeEm)) {
      disableContentEditable(up, twoup);
    }
  });

  [...block.querySelectorAll('img')].forEach((el) => {
    el.setAttribute('data-library-id', window.crypto.randomUUID());
  });
}

function enableImageDragDrop(body) {
  [...body.querySelectorAll('source')].forEach((el) => {
    el.remove();
  });

  [...body.querySelectorAll('img')].forEach((el) => {
    el.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    el.addEventListener('dragenter', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    el.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.addEventListener('loadend', () => {
        const image = new Image();
        image.src = reader.result;
        image.addEventListener('load', () => {
          el.setAttribute('width', image.width);
          el.setAttribute('height', image.height);
        });
        el.src = reader.result;
      });
    });
  });
}

async function decorateBlock(name, blockData, blockElement) {
  const { origin } = new URL(blockData.path);
  const { default: defaultDecorate } = await import(`${origin}/blocks/${name}/${name}.js`);
  const {
    decorateSections,
    decorateButtons,
    decorateBlock: libFranklinDecorateBlock,
    updateSectionsStatus,
  } = await import(`${origin}/scripts/lib-franklin.js`);

  const main = createTag('main', {}, blockElement);

  // Decorate any buttons
  decorateButtons(main);

  // Prepare the sections
  decorateSections(main);

  // Get the block
  const block = main.querySelector(`.${name}`);

  // Prepare the block for decoration
  libFranklinDecorateBlock(block);

  // Decorate the block
  await defaultDecorate(block);

  // Set block as loaded
  block.dataset.blockStatus = 'loaded';

  // Set section as loaded
  updateSectionsStatus(main);

  return main.querySelector('.section');
}

/**
 * Called when a user tries to load the plugin
 * @param {HTMLElement} container The container to render the plugin in
 * @param {Object} data The data contained in the plugin sheet
 * @param {String} query If search is active, the current search query
 */
export async function decorate(container, data, query) {
  container.dispatchEvent(new CustomEvent('ShowLoader'));

  const content = createTag('div', { class: 'block-library' }, renderScaffolding());
  const menu = content.querySelector('.menu');
  const details = content.querySelector('.details');
  const blockTitle = content.querySelector('.block-title');
  const copyButton = content.querySelector('.copy-button');

  const sideNav = createTag('sp-sidenav', { variant: 'multilevel', 'data-testid': 'blocks' });
  menu.append(sideNav);

  const actionGroup = content.querySelector('sp-action-group');
  actionGroup.selected = 'desktop';

  // Create an array of promises for each block
  const promises = data.map(async (blockData) => {
    const { path: blockPath } = blockData;
    const docPromise = fetchBlock(blockPath); // Store the promise

    try {
      const res = await docPromise;
      if (!res) {
        throw new Error(`An error occurred fetching ${blockData.name}`);
      }

      // Add block parent sidenav item
      const blockParentItem = createSideNavItem(
        blockData.name,
        'sp-icon-file-template',
        true,
        true,
        'sp-icon-preview',
      );
      blockParentItem.addEventListener(APP_EVENTS.ON_ACTION, e => onPreview(e, blockPath));
      sideNav.append(blockParentItem);

      // Get the body container of the block variants
      const { body } = res;

      // Check for default library metadata
      const defaultLibraryMetadata = getDefaultLibraryMetadata(body);

      // Query all variations of the block in the container
      const pageBlocks = [...body.querySelectorAll(':scope > div')];

      pageBlocks.forEach((pageBlock, index) => {
        // Check if the variation has library metadata
        const sectionLibraryMetadata = getLibraryMetadata(pageBlock) ?? {};
        const blockElement = pageBlock.querySelector('div[class]');
        const blockName = getBlockName(blockElement, false);
        const blockNameWithVariant = sectionLibraryMetadata.name ?? getBlockName(blockElement);

        if (!blockName) {
          return;
        }

        // Pull the description for this block,
        // first from sectionLibraryMetadata and fallback to defaultLibraryMetadata
        const { description: sectionDescription } = sectionLibraryMetadata;
        const blockDescription = sectionDescription
          ? parseDescription(sectionDescription)
          : parseDescription(defaultLibraryMetadata.description);

        const blockVariantItem = createSideNavItem(
          blockNameWithVariant,
          'sp-icon-file-code',
          false,
          true,
          'sp-icon-copy',
        );
        blockVariantItem.classList.add('descendant');
        blockVariantItem.setAttribute('data-index', index);
        blockVariantItem.addEventListener(APP_EVENTS.ON_ACTION, (e) => {
          e.preventDefault();
          e.stopPropagation();
          copyBlock(blockElement, blockNameWithVariant, blockPath);

          // Show toast
          container.dispatchEvent(new CustomEvent('Toast', { detail: { message: 'Copied Block' } }));
        });

        // Add child variant to parent
        blockParentItem.append(blockVariantItem);

        const myObserver = new MutationObserver(handleMutations);

        blockVariantItem.addEventListener('click', async () => {
          // Decorate the block with ids
          decorateEditableElements(pageBlock);

          // Clone the block and decorate it
          const blockClone = pageBlock.cloneNode(true);
          const wrappedBlock = await decorateBlock(blockName, blockData, blockClone);

          // Store the active block
          activeBlockElement = blockElement;

          // Set block title
          blockTitle.textContent = blockNameWithVariant;

          // Disable enter key on contenteditable
          [...blockClone.querySelectorAll('p, strong, a, h1, h2, h3, h4, h5, h6')].forEach((el) => {
            el.addEventListener('keydown', (e) => { if (e.keyCode === 13) e.preventDefault(); });
            el.addEventListener('focus', (e) => {
              selectedElement = e.target;
              const trigger = container;
              const boundingRect = e.target.getBoundingClientRect();
              const interaction = 'click';

              activeOverlayContent = createTag('generative-text-popover', {});
              activeOverlayContent.style.top = `${boundingRect.top + boundingRect.height + 115}px`;
              activeOverlayContent.style.left = `${boundingRect.left + boundingRect.width + frame.getBoundingClientRect().left - 36}px`;
              activeOverlayContent.style.position = 'absolute';

              activeOverlayContent.addEventListener('generated', (response) => {
                activeOverlayContent.open = false;
                selectedElement.innerHTML = response.detail.generated;
                activeOverlayContent.remove();
              });

              activeOverlayContent.addEventListener('error', (error) => {
                activeOverlayContent.open = false;
                container.dispatchEvent(new CustomEvent('Toast', { detail: { message: error.detail.message, variant: 'negative' } }));
              });

              if (!activeOverlayContent) return;
              const options = {
                placement: 'none',
              };
              activeOverlayContent.open = true;
              Overlay.open(
                trigger,
                interaction,
                activeOverlayContent,
                options,
              );
            });

            el.addEventListener('focusout', (e) => {
              if (e.relatedTarget) {
                if (activeOverlayContent) {
                  activeOverlayContent.closest('active-overlay').remove();
                }
              } else {
                setTimeout(() => {
                  if (document.activeElement?.tagName !== 'GENERATIVE-TEXT-POPOVER' || document.activeElement?.tagName === 'SIDEKICK-LIBRARY') {
                    if (activeOverlayContent) {
                      activeOverlayContent.closest('active-overlay').remove();
                    }
                  }
                }, 100);
              }
            });
          });

          // Set block description
          details.innerHTML = '';
          if (blockDescription) {
            const description = createTag('p', {}, blockDescription);
            details.append(description);
          }

          const frame = container.querySelector('iframe');
          frame.src = blockPath;
          frame?.addEventListener('load', () => {
            const { body: iframeBody } = frame.contentWindow.document;
            iframeBody.querySelector('header')?.remove();
            iframeBody.querySelector('footer')?.remove();
            iframeBody.querySelector('main')?.replaceChildren(wrappedBlock);

            frame.contentDocument.addEventListener('scroll', () => {
              if (activeOverlayContent) {
                activeOverlayContent.remove();
              }

              if (selectedElement) {
                selectedElement.blur();
              }
            });

            const iframeWindow = frame.contentWindow;
            iframeWindow.addEventListener('focus', () => {
              console.log('iframe focused');
              iframeFocused = true;
              if (activeOverlayContent) {
                activeOverlayContent.remove();
              }
            });
            iframeWindow.addEventListener('blur', () => {
              console.log('iframe blurred');
              iframeFocused = false;
            });

            enableImageDragDrop(iframeBody);

            myObserver.observe(wrappedBlock, {
              subtree: true,
              attributes: true,
              childList: true,
              characterData: true,
              characterDataOldValue: true,
            });

            const { origin } = new URL(blockPath);
            const styleLink = createTag('link', { rel: 'stylesheet', href: `${origin}/blocks/${blockName}/${blockName}.css` });
            frame.contentWindow.document.head.append(styleLink);
            styleLink.onload = () => {
              frame.style.display = 'block';
            };
            styleLink.onerror = (e) => {
              // eslint-disable-next-line no-console
              console.error(e);
            };

            copyButton?.addEventListener('click', () => {
              copyBlock(activeBlockElement, blockNameWithVariant, blockPath);

              // Show toast
              container.dispatchEvent(new CustomEvent('Toast', { detail: { message: 'Copied Block' } }));
            });
          });
        });

        if (query) {
          if (isMatchingBlock(pageBlock, query)) {
            blockParentItem.setAttribute('expanded', true);
          } else {
            blockParentItem.removeChild(blockVariantItem);
          }
        }
      });

      // Is we are searching and no blockVariants matched, remove the block
      if (query && !blockParentItem.getAttribute('expanded')) {
        blockParentItem.remove();
      }

      return docPromise; // Return the promise
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e.message);
      container.dispatchEvent(new CustomEvent('Toast', { detail: { message: e.message, variant: 'negative' } }));
    }
  });

  // Wait for all promises to resolve
  await Promise.all(promises);

  const frameView = content.querySelector('.frame-view');
  const mobileViewButton = content.querySelector('sp-action-button[value="mobile"]');
  mobileViewButton?.addEventListener('click', () => {
    frameView.style.width = '480px';
  });

  const tabletViewButton = content.querySelector('sp-action-button[value="tablet"]');
  tabletViewButton?.addEventListener('click', () => {
    frameView.style.width = '768px';
  });

  const desktopViewButton = content.querySelector('sp-action-button[value="desktop"]');
  desktopViewButton?.addEventListener('click', () => {
    frameView.style.width = '100%';
  });

  // Show blocks and hide loader
  container.append(content);
  container.dispatchEvent(new CustomEvent('HideLoader'));

  if (sideNav.querySelectorAll('sp-sidenav-item').length === 0) {
    container.innerHTML = renderNoResults();
  }
}

export default {
  title: 'Blocks',
  searchEnabled: false,
};
