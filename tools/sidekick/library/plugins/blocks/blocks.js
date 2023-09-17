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

/* eslint-disable
  no-await-in-loop,
  no-param-reassign,
  consistent-return,
  no-plusplus,
  no-prototype-builtins */

import {
  getBlockName,
  parseDescription,
  copyBlockToClipboard,
  copyPageToClipboard,
  copyDefaultContentToClipboard,
} from './utils.js';
import {
  createTag, removeAllEventListeners, setURLParams,
} from '../../utils/dom.js';
import { sampleRUM } from '../../utils/rum.js';
import { fetchCompletion } from '../../utils/openai.js';

const demoPayload1 = `
<div>
  <div class="aside small">
    <div>
      <div>#eeeeee</div>
    </div>
    <div>
      <div>
        <p>
          <picture>
            <source type="image/webp" srcset="https://gpt--bacom--dylandepass.hlx.live/media_192c436f79f94d0bb8bc8ca4d65055264ef75205b.png?width=2000&amp;format=webply&amp;optimize=medium" media="(min-width: 600px)">
            <source type="image/webp" srcset="https://gpt--bacom--dylandepass.hlx.live/media_192c436f79f94d0bb8bc8ca4d65055264ef75205b.png?width=750&amp;format=webply&amp;optimize=medium">
            <source type="image/png" srcset="https://gpt--bacom--dylandepass.hlx.live/media_192c436f79f94d0bb8bc8ca4d65055264ef75205b.png?width=2000&amp;format=png&amp;optimize=medium" media="(min-width: 600px)">
            <img loading="lazy" alt="Adobe Experience Platform" src="https://gpt--bacom--dylandepass.hlx.live/media_192c436f79f94d0bb8bc8ca4d65055264ef75205b.png?width=750&amp;format=png&amp;optimize=medium" width="154" height="150">
          </picture>
        </p>
        <p><strong>ADOBE EXPERIENCE PLATFORM</strong></p>
        <h2 id="heading-xl-aside-standard-small">Transform Your Customer Experience</h2>
        <p>Adobe Experience Platform is the industry's first open and extensible platform that stitches data across the enterprise, ultimately enabling a single view of the customer. <a href="https://www.adobe.com/">Discover</a> how you can deliver real-time, personalized experiences at scale.</p>
        <p><strong><a href="https://www.adobe.com/">Learn More</a></strong> <strong><em><a href="https://www.adobe.com/">Get Started</a></em></strong></p>
      </div>
      <div>
        <picture>
          <source type="image/webp" srcset="https://gpt--bacom--dylandepass.hlx.live/media_1145814fff2d4ae3b154e723417853e357f1fcff7.jpeg?width=2000&amp;format=webply&amp;optimize=medium" media="(min-width: 600px)">
          <source type="image/webp" srcset="https://gpt--bacom--dylandepass.hlx.live/media_1145814fff2d4ae3b154e723417853e357f1fcff7.jpeg?width=750&amp;format=webply&amp;optimize=medium">
          <source type="image/png" srcset="https://gpt--bacom--dylandepass.hlx.live/media_1145814fff2d4ae3b154e723417853e357f1fcff7.jpeg?width=2000&amp;format=png&amp;optimize=medium" media="(min-width: 600px)">
          <img loading="lazy" alt="Adobe Experience Platform Interface" src="https://gpt--bacom--dylandepass.hlx.live/media_1145814fff2d4ae3b154e723417853e357f1fcff7.jpeg?width=750&amp;format=png&amp;optimize=medium" width="500" height="375">
        </picture>
      </div>
    </div>
  </div>
</div>
`;

const demoPayload2 = `
      <div>
        <div class="aside split medium">
          <div>
            <div data-valign="middle"><strong>#f9f9f9</strong></div>
          </div>
          <div>
            <div data-valign="middle">
              <p>Delivery Edge</p>
              <h3 id="web-content-management-with-aem-delivery-edge">Web Content Management with AEM Delivery Edge</h3>
              <p>Experience the future of web content management with AEM Delivery Edge, the cutting-edge platform designed to streamline your digital content delivery. Our platform leverages the power of edge computing, bringing you closer to your users and providing faster, more reliable content delivery.</p>
              <p><a href="https://adobe.com">Learn More</a></p>
            </div>
            <div data-valign="middle">
              <picture>
                <source type="image/webp" srcset="./media_126796bc11a4aa928b6f6025fbe8e14a97e6fb76a.jpeg?width=2000&#x26;format=webply&#x26;optimize=medium" media="(min-width: 600px)">
                <source type="image/webp" srcset="./media_126796bc11a4aa928b6f6025fbe8e14a97e6fb76a.jpeg?width=750&#x26;format=webply&#x26;optimize=medium">
                <source type="image/jpeg" srcset="./media_126796bc11a4aa928b6f6025fbe8e14a97e6fb76a.jpeg?width=2000&#x26;format=jpeg&#x26;optimize=medium" media="(min-width: 600px)">
                <img loading="lazy" alt="" src="./media_126796bc11a4aa928b6f6025fbe8e14a97e6fb76a.jpeg?width=750&#x26;format=jpeg&#x26;optimize=medium" width="1792" height="1024">
              </picture>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="text full-width s-spacing-bottom">
          <div>
            <div data-valign="middle">
              <h3 id="revolutionizing-experiences-at-the-edge-the-future-of-content-delivery">Revolutionizing Experiences at the Edge: The Future of Content Delivery</h3>
              <p>Great experiences are all about reducing latency, improving speed, and delivering real-time web content updates with unprecedented efficiency. Delivery Edge stands at the forefront of this transformation, enabling businesses to harness the power of edge computing in their content delivery. Delivery Edge ensures faster website load times, more relevant content tailoring, and a seamless user experience by processing data and content at the edge, closer to the user.</p>
            </div>
          </div>
        </div>
        <div class="section-metadata">
          <div>
            <div data-valign="middle">style</div>
            <div data-valign="middle">xl-spacing</div>
          </div>
        </div>
      </div>
      <div>
        <div class="text full-width large no-spacing-bottom">
          <div>
            <div data-valign="middle">
              <h3 id="heres-how-aem-edge-delivery-sets-you-up-for-success">Here’s how AEM Edge Delivery sets you up for success.</h3>
            </div>
          </div>
        </div>
        <div class="media large light">
          <div>
            <div data-valign="middle"></div>
          </div>
          <div>
            <div data-valign="middle">
              <picture>
                <source type="image/webp" srcset="./media_1bc139e2d913f27a22ee647b9286ccbfcb17041b0.jpeg?width=2000&#x26;format=webply&#x26;optimize=medium" media="(min-width: 600px)">
                <source type="image/webp" srcset="./media_1bc139e2d913f27a22ee647b9286ccbfcb17041b0.jpeg?width=750&#x26;format=webply&#x26;optimize=medium">
                <source type="image/jpeg" srcset="./media_1bc139e2d913f27a22ee647b9286ccbfcb17041b0.jpeg?width=2000&#x26;format=jpeg&#x26;optimize=medium" media="(min-width: 600px)">
                <img loading="lazy" alt="" src="./media_1bc139e2d913f27a22ee647b9286ccbfcb17041b0.jpeg?width=750&#x26;format=jpeg&#x26;optimize=medium" width="1792" height="1024">
              </picture>
            </div>
            <div data-valign="middle">
              <h3 id="reduced-latency--faster-load-times">Reduced Latency &#x26; Faster Load Times</h3>
              <p>Edge computing processes data closer to the end user, circumventing the need to retrieve data from centralized servers. This significantly reduces the time it takes to load web content, leading to an instantaneous and more responsive user experience.</p>
            </div>
          </div>
        </div>
        <div class="media large light">
          <div>
            <div data-valign="middle"></div>
          </div>
          <div>
            <div data-valign="middle">
              <h3 id="scalability-on-demand">Scalability on Demand</h3>
              <p>Edge computing decentralizes the workload, distributing content requests across numerous nodes. This reduces the strain on a single central server and allows the system to effectively handle traffic spikes, ensuring consistent performance even during high-demand periods.</p>
            </div>
            <div data-valign="middle">
              <picture>
                <source type="image/webp" srcset="./media_1a16ef5f373b66001a362df8e1396ca74d0142a68.jpeg?width=2000&#x26;format=webply&#x26;optimize=medium" media="(min-width: 600px)">
                <source type="image/webp" srcset="./media_1a16ef5f373b66001a362df8e1396ca74d0142a68.jpeg?width=750&#x26;format=webply&#x26;optimize=medium">
                <source type="image/jpeg" srcset="./media_1a16ef5f373b66001a362df8e1396ca74d0142a68.jpeg?width=2000&#x26;format=jpeg&#x26;optimize=medium" media="(min-width: 600px)">
                <img loading="lazy" alt="" src="./media_1a16ef5f373b66001a362df8e1396ca74d0142a68.jpeg?width=750&#x26;format=jpeg&#x26;optimize=medium" width="1792" height="1024">
              </picture>
            </div>
          </div>
        </div>
        <div class="media large light">
          <div>
            <div data-valign="middle"></div>
          </div>
          <div>
            <div data-valign="middle">
              <picture>
                <source type="image/webp" srcset="./media_1b75d758293fc825f3d456c2dcb0ef999ca599286.jpeg?width=2000&#x26;format=webply&#x26;optimize=medium" media="(min-width: 600px)">
                <source type="image/webp" srcset="./media_1b75d758293fc825f3d456c2dcb0ef999ca599286.jpeg?width=750&#x26;format=webply&#x26;optimize=medium">
                <source type="image/jpeg" srcset="./media_1b75d758293fc825f3d456c2dcb0ef999ca599286.jpeg?width=2000&#x26;format=jpeg&#x26;optimize=medium" media="(min-width: 600px)">
                <img loading="lazy" alt="" src="./media_1b75d758293fc825f3d456c2dcb0ef999ca599286.jpeg?width=750&#x26;format=jpeg&#x26;optimize=medium" width="1792" height="1024">
              </picture>
            </div>
            <div data-valign="middle">
              <h3 id="increased-resilience--uptime">Increased Resilience &#x26; Uptime</h3>
              <p>Distributing content processing and delivery across multiple edge locations means there's no single point of failure. This decentralized approach ensures that even if one edge node faces issues, others can seamlessly take over, ensuring uninterrupted content delivery and higher uptime percentages.</p>
            </div>
          </div>
        </div>
        <div class="media large light">
          <div>
            <div data-valign="middle"></div>
          </div>
          <div>
            <div data-valign="middle">
              <h3 id="enhanced-personalization--real-time-updates">Enhanced Personalization &#x26; Real-time Updates</h3>
              <p>By processing data at the edge, web content management platforms can adapt content in real-time based on user interactions, location, device type, and other contextual factors. This allows for a highly tailored user experience that's both relevant and engaging.</p>
            </div>
            <div data-valign="middle">
              <picture>
                <source type="image/webp" srcset="./media_121af0d9b9a4fa585f2022da86503b53c75c035bf.jpeg?width=2000&#x26;format=webply&#x26;optimize=medium" media="(min-width: 600px)">
                <source type="image/webp" srcset="./media_121af0d9b9a4fa585f2022da86503b53c75c035bf.jpeg?width=750&#x26;format=webply&#x26;optimize=medium">
                <source type="image/jpeg" srcset="./media_121af0d9b9a4fa585f2022da86503b53c75c035bf.jpeg?width=2000&#x26;format=jpeg&#x26;optimize=medium" media="(min-width: 600px)">
                <img loading="lazy" alt="" src="./media_121af0d9b9a4fa585f2022da86503b53c75c035bf.jpeg?width=750&#x26;format=jpeg&#x26;optimize=medium" width="1792" height="1024">
              </picture>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="aside medium">
          <div>
            <div data-valign="middle">
              <picture>
                <source type="image/webp" srcset="./media_15a09699209e0ce6971c6052a04cbfa535ce0e8ec.png?width=2000&#x26;format=webply&#x26;optimize=medium" media="(min-width: 600px)">
                <source type="image/webp" srcset="./media_15a09699209e0ce6971c6052a04cbfa535ce0e8ec.png?width=750&#x26;format=webply&#x26;optimize=medium">
                <source type="image/png" srcset="./media_15a09699209e0ce6971c6052a04cbfa535ce0e8ec.png?width=2000&#x26;format=png&#x26;optimize=medium" media="(min-width: 600px)">
                <img loading="lazy" alt="" src="./media_15a09699209e0ce6971c6052a04cbfa535ce0e8ec.png?width=750&#x26;format=png&#x26;optimize=medium" width="599" height="168">
              </picture>
            </div>
          </div>
          <div>
            <div data-valign="middle">
              <picture>
                <source type="image/webp" srcset="./media_1695d88cb0bb3b3dddfa820e2951516819189716e.jpeg?width=2000&#x26;format=webply&#x26;optimize=medium" media="(min-width: 600px)">
                <source type="image/webp" srcset="./media_1695d88cb0bb3b3dddfa820e2951516819189716e.jpeg?width=750&#x26;format=webply&#x26;optimize=medium">
                <source type="image/jpeg" srcset="./media_1695d88cb0bb3b3dddfa820e2951516819189716e.jpeg?width=2000&#x26;format=jpeg&#x26;optimize=medium" media="(min-width: 600px)">
                <img loading="lazy" alt="" src="./media_1695d88cb0bb3b3dddfa820e2951516819189716e.jpeg?width=750&#x26;format=jpeg&#x26;optimize=medium" width="1792" height="1024">
              </picture>
            </div>
            <div data-valign="middle">
              <h3 id="more-power-with-generative-ai">More power with generative AI.</h3>
              <p>Artificial Intelligence is ushering in a transformative era for web content management.</p>
              <ul>
                <li>AI analyzes user behavior and preferences, tailoring content delivery to individual needs, ensuring each visitor receives a unique and relevant experience.</li>
                <li>Leveraging image recognition and natural language processing, AI can automatically categorize and tag content, streamlining organization and accessibility.</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="section-metadata">
          <div>
            <div data-valign="middle">style</div>
            <div data-valign="middle">xl-spacing</div>
          </div>
        </div>
      </div>
      <div>
        <div class="text center no-spacing">
          <div>
            <div data-valign="middle">
              <h3 id="questions-we-have-answers">Questions? We have answers.</h3>
            </div>
          </div>
        </div>
        <div class="accordion">
          <div>
            <div data-valign="middle">What is edge computing in the context of web content management?</div>
          </div>
          <div>
            <div data-valign="middle">Edge computing refers to the practice of processing and delivering web content closer to the location of the user, typically using a network of distributed servers or nodes. This decentralizes content management and delivery, reducing the reliance on a central server.</div>
          </div>
          <div>
            <div data-valign="middle"><strong>How does edge computing enhance web content delivery?</strong></div>
          </div>
          <div>
            <div data-valign="middle">By processing and delivering content closer to the end user, edge computing significantly reduces latency, ensuring faster website load times, real-time updates, and a more responsive overall user experience.</div>
          </div>
          <div>
            <div data-valign="middle"><strong>Is edge computing more secure than traditional centralized content management?</strong></div>
          </div>
          <div>
            <div data-valign="middle">Edge computing can offer enhanced security measures, as data processing occurs closer to the source. This reduces the exposure of data during long transits. However, the distributed nature also means security protocols must be consistently enforced across all nodes.</div>
          </div>
          <div>
            <div data-valign="middle">How does edge computing impact content personalization?</div>
          </div>
          <div>
            <div data-valign="middle">Edge computing allows for real-time content adjustments based on user behavior, location, device type, and other contextual factors. This means content can be tailored instantly to provide a highly relevant and personalized user experience.</div>
          </div>
          <div>
            <div data-valign="middle">How does edge computing interact with content caching?</div>
          </div>
          <div>
            <div data-valign="middle">Edge computing often leverages content caching to store frequently accessed content at edge nodes. This ensures that popular content can be delivered to users without constantly fetching it from the central server, further reducing latency and enhancing user experience.</div>
          </div>
        </div>
        <div class="section-metadata">
          <div>
            <div data-valign="middle">style</div>
            <div data-valign="middle">xl-spacing</div>
          </div>
        </div>
      </div>
`;

/**
 * Renders the scaffolding for the block plugin
 * @returns {String} HTML string
 */
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
        <div class="list-container">
        </div>
      </div>
      <div class="content">
      </div>
    </sp-split-view>
  `;
}

let demoCount = 0;

/**
 * Renders the preview frame including the top action bar, frame view and details container
 * @param {HTMLElement} container
 */
function renderFrame(container) {
  if (!isFrameLoaded(container)) {
    const contentContainer = container.querySelector('.content');
    contentContainer.innerHTML = /* html */`
      <sp-split-view
        vertical
        resizable
        primary-size="2600"
        secondary-min="200"
        splitter-pos="250"
      >
        <div class="view">
          <div class="action-bar">
            <sp-action-group compact selects="single" selected="desktop">
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
            <block-renderer></block-renderer>
          </div>
        </div>
        <div class="bottom-container">
          <generative-text-popover></generative-text-popover>
          <div class="details-container">
            <div class="action-bar">
              <h3 class="title"></h3>
              <div class="actions">
                  <sp-button class="copy-button">Copy</sp-button>
              </div>
            </div>
            <sp-divider size="s"></sp-divider>
            <div class="details"></div>
          </div>
        </div>
      </sp-split-view>
    `;

    const actionGroup = container.querySelector('sp-action-group');
    actionGroup.selected = 'desktop';

    // Setup listeners for the top action bar
    const frameView = container.querySelector('.frame-view');
    const mobileViewButton = removeAllEventListeners(container.querySelector('sp-action-button[value="mobile"]'));
    mobileViewButton?.addEventListener('click', () => {
      frameView.style.width = '480px';
    });

    const tabletViewButton = removeAllEventListeners(container.querySelector('sp-action-button[value="tablet"]'));
    tabletViewButton?.addEventListener('click', () => {
      frameView.style.width = '768px';
    });

    const desktopViewButton = removeAllEventListeners(container.querySelector('sp-action-button[value="desktop"]'));
    desktopViewButton?.addEventListener('click', () => {
      frameView.style.width = '100%';
    });

    const generativeTextPopover = contentContainer.querySelector('generative-text-popover');
    generativeTextPopover.addEventListener('generate', async (e) => {
      const renderer = container.querySelector('block-renderer');
      const selection = renderer.iframe.value.contentWindow.getSelection();
      let res;
      if (selection && selection.focusNode && demoCount === 1) {
        const parent = selection.focusNode.parentElement;
        res = await fetchCompletion(`${e.detail.generate}`);
        parent.textContent = res.trim().replace(/"/g, '');
        generativeTextPopover.complete();
        demoCount = 2;
      } else if (localStorage.getItem('demo-mode') === 'true') {
        if (demoCount === 0) {
          setTimeout(() => {
            renderer.loadBlock(
              renderer.blockName,
              renderer.blockData,
              createTag('div', {}, demoPayload1).querySelector(':first-child'),
              renderer.defaultLibraryMetadata,
              container,
            );
            generativeTextPopover.complete();
            demoCount = 1;
          }, 3000);
        } else if (demoCount === 2) {
          setTimeout(() => {
            renderer.loadBlock(
              renderer.blockName,
              renderer.blockData,
              createTag('body', {}, demoPayload2),
              renderer.defaultLibraryMetadata,
              container,
            );
            generativeTextPopover.complete();
            demoCount = 3;
          }, 6000);
        } else if (demoCount === 3) {
          await fetch('https://hook.app.workfrontfusion.com/o8rgysbrmvj78wdc516q4yi69mqkjxo8');
          setTimeout(() => {
            container.dispatchEvent(new CustomEvent('Toast', { detail: { message: 'Generation and Upload Complete', variant: 'positive' } }));
            generativeTextPopover.complete();
          }, 5000);
        }
      } else {
        res = await fetchCompletion(`${e.detail.generate}. Put the response in the following structure {${renderer.blockWrapperClone.outerHTML}}, make sure to change all text to be something relavent.`);
        renderer.loadBlock(
          renderer.blockName,
          renderer.blockData,
          createTag('div', {}, res).querySelector(':first-child'),
          renderer.defaultLibraryMetadata,
          container,
        );
        generativeTextPopover.complete();
      }

      //      console.log(renderer.iframe.value.contentWindow.getSelection());
      // if (renderer.selectedContentEditable) {
      //   res = await fetchCompletion(`${e.detail.generate}`);
      //   renderer.selectedContentEditable.textContent = res.trim();
      //   generativeTextPopover.complete();
      // } else {
      //   res = await fetchCompletion(`${e.detail.generate}. Put the response in the following structure {${renderer.blockWrapperClone.outerHTML}}, make sure to change all text to be something relavent.`);
      //   renderer.loadBlock(
      //     renderer.blockName,
      //     renderer.blockData,
      //     createTag('div', {}, res).querySelector(':first-child'),
      //     renderer.defaultLibraryMetadata,
      //     container,
      //   );
      //   generativeTextPopover.complete();
      // }
    });
  }
}

/**
 * Checks if the preview frame has been loaded yet
 * @param {HTMLElement} container The container that hosts the preview frame
 * @returns {Boolean} True if the frame has been loaded, false otherwise
 */
function isFrameLoaded(container) {
  return container.querySelector('.details-container') !== null;
}

/**
 * Updates the details container with the block title and description
 * @param {HTMLElement} container The container containing the details container
 * @param {String} title The title of the block
 * @param {String} description The description of the block
 */
function updateDetailsContainer(container, title, description) {
  // Set block title
  const blockTitle = container.querySelector('.action-bar .title');
  blockTitle.textContent = title;

  // Set block description
  const details = container.querySelector('.details');
  details.innerHTML = '';
  if (description) {
    const descriptionElement = createTag('p', {}, description);
    details.append(descriptionElement);
  }
}

/**
 * Attaches an event listener to the copy button in the preview UI
 * @param {HTMLElement} container The container containing the copy button
 * @param {HTMLElement} blockRenderer The block renderer
 * @param {Object} defaultLibraryMetadata The default library metadata
 * @param {Object} pageMetadata The page metadata
 */
function attachCopyButtonEventListener(
  container,
  blockRenderer,
  defaultLibraryMetadata,
  pageMetadata,
) {
  const copyButton = removeAllEventListeners(container.querySelector('.content .copy-button'));
  copyButton.addEventListener('click', () => {
    const copyElement = blockRenderer.getBlockElement();
    const copyWrapper = blockRenderer.getBlockWrapper();
    const copyBlockData = blockRenderer.getBlockData();

    // Return the copied DOM in the toast message so it can be tested
    // Cannot read or write clipboard in tests
    let copiedDOM;

    // Are we trying to copy a block, a page or default content?
    // The copy operation is slightly different depending on which
    if (defaultLibraryMetadata.type === 'template' || defaultLibraryMetadata.multiSectionBlock || defaultLibraryMetadata.compoundBlock) {
      copiedDOM = copyPageToClipboard(copyWrapper, copyBlockData.url, pageMetadata);
    } else if (blockRenderer.isBlock) {
      copiedDOM = copyBlockToClipboard(
        copyWrapper,
        getBlockName(copyElement, true),
        copyBlockData.url,
      );
    } else {
      copiedDOM = copyDefaultContentToClipboard(copyWrapper, copyBlockData.url);
    }

    container.dispatchEvent(new CustomEvent('Toast', { detail: { message: 'Copied Block', result: copiedDOM } }));
  });
}

function onBlockListCopyButtonClicked(event, container) {
  const {
    blockWrapper: wrapper,
    blockNameWithVariant: name,
    blockURL,
    defaultLibraryMetadata,
    pageMetadata,
  } = event.detail;

  // Return the copied DOM in the toast message so it can be tested
  // Cannot read or write clipboard in tests
  let copiedDOM;

  // We may not have rendered the block yet, so we need to check for a block to know if
  // we are dealing with a block or default content
  const block = wrapper.querySelector(':scope > div:not(.section-metadata)');
  if (defaultLibraryMetadata && (defaultLibraryMetadata.type === 'template' || defaultLibraryMetadata.multiSectionBlock || defaultLibraryMetadata.compoundBlock)) {
    copiedDOM = copyPageToClipboard(wrapper, blockURL, pageMetadata);
  } else if (block) {
    copiedDOM = copyBlockToClipboard(wrapper, name, blockURL);
  } else {
    copiedDOM = copyDefaultContentToClipboard(wrapper, blockURL);
  }
  container.dispatchEvent(new CustomEvent('Toast', { detail: { message: 'Copied Block', target: wrapper, result: copiedDOM } }));
}

function loadBlock(event, container) {
  const content = container.querySelector('.block-library');
  const {
    blockWrapper,
    blockData,
    sectionLibraryMetadata,
    defaultLibraryMetadata,
  } = event.detail;
  // Block element (first child of the wrapper)
  const blockElement = blockWrapper.querySelector('div[class]');

  // The name of the block (first column of the table)
  const blockName = getBlockName(blockElement, false);

  // Render the preview frame if we haven't already
  renderFrame(container);

  // For blocks we pull the block name from section metadata or the name given to the block
  const authoredBlockName = sectionLibraryMetadata.name ?? getBlockName(blockElement);

  // Pull the description for this block,
  // first from sectionLibraryMetadata and fallback to defaultLibraryMetadata
  const { description: sectionDescription } = sectionLibraryMetadata;
  const blockDescription = sectionDescription
    ? parseDescription(sectionDescription)
    : parseDescription(defaultLibraryMetadata.description);

  // Set block title & description in UI
  updateDetailsContainer(content, authoredBlockName, blockDescription);

  const blockRenderer = content.querySelector('block-renderer');

  // If the block element exists, load the block
  blockRenderer.loadBlock(
    blockName,
    blockData,
    blockWrapper,
    defaultLibraryMetadata,
    container,
  );

  // Append the path and index of the current block to the url params
  setURLParams([['path', blockData.path], ['index', event.detail.index]]);

  // Attach copy button event listener
  attachCopyButtonEventListener(container, blockRenderer, defaultLibraryMetadata, undefined);

  // Track block view
  sampleRUM('library:blockviewed', { target: blockData.url });
}

function loadTemplate(event, container) {
  const content = container.querySelector('.block-library');
  const {
    blockWrapper,
    blockData,
    defaultLibraryMetadata,
    pageMetadata,
  } = event.detail;

  // Render the preview frame if we haven't already
  renderFrame(content);

  // For templates we pull the template name from default library metadata
  // or the name given to the document in the library sheet.
  const authoredTemplateName = defaultLibraryMetadata.name ?? blockData.name;

  // Pull the description for this page from default metadata.
  const templateDescription = parseDescription(defaultLibraryMetadata.description);

  // Set template title & description in UI
  updateDetailsContainer(content, authoredTemplateName, templateDescription);

  const blockRenderer = content.querySelector('block-renderer');

  // If the block element exists, load the block
  blockRenderer.loadBlock(
    '',
    blockData,
    blockWrapper,
    defaultLibraryMetadata,
    container,
  );

  // Append the path and index of the current block to the url params
  setURLParams([['path', blockData.path]], ['index']);

  // Attach copy button event listener
  attachCopyButtonEventListener(container, blockRenderer, defaultLibraryMetadata, pageMetadata);

  // Track block view
  sampleRUM('library:blockviewed', { target: blockData.url });
}

/**
 * Called when a user tries to load the plugin
 * @param {HTMLElement} container The container to render the plugin in
 * @param {Object} data The data contained in the plugin sheet
 */
export async function decorate(container, data) {
  container.dispatchEvent(new CustomEvent('ShowLoader'));

  const content = createTag('div', { class: 'block-library' }, renderScaffolding());
  container.append(content);
  const listContainer = content.querySelector('.list-container');

  const blockList = createTag('block-list');
  listContainer.append(blockList);

  blockList.addEventListener('PreviewBlock', (e) => {
    window.open(e.details.path, '_blockpreview');
  });

  // Handle LoadTemplate events
  blockList.addEventListener('LoadTemplate', loadPageEvent => loadTemplate(loadPageEvent, container));

  // Handle LoadBlock events
  blockList.addEventListener('LoadBlock', loadBlockEvent => loadBlock(loadBlockEvent, container));

  // Handle CopyBlock events from the block list
  blockList.addEventListener('CopyBlock', blockListCopyEvent => onBlockListCopyButtonClicked(blockListCopyEvent, container));

  const search = content.querySelector('sp-search');
  search.addEventListener('input', (e) => {
    blockList.filterBlocks(e.target.value);
  });

  await blockList.loadBlocks(data, container);

  // Show blocks and hide loader
  container.dispatchEvent(new CustomEvent('HideLoader'));
}

export default {
  title: 'Blocks',
  searchEnabled: false,
};
