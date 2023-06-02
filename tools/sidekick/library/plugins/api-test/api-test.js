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

import { PLUGIN_EVENTS } from '../../events/events.js';

export async function decorate(container, data, query) {
  const group = document.createElement('sp-button-group');
  group.setAttribute('vertical', '');

  const positiveToastButton = document.createElement('sp-button');
  positiveToastButton.setAttribute('variant', 'primary');
  positiveToastButton.textContent = 'Positive Toast';
  group.append(positiveToastButton);

  positiveToastButton.addEventListener('click', () => {
    container.dispatchEvent(new CustomEvent(PLUGIN_EVENTS.TOAST, { detail: { message: 'Toast Shown!' } }));
  });

  const negativeToastButton = document.createElement('sp-button');
  negativeToastButton.setAttribute('variant', 'negative');
  negativeToastButton.textContent = 'Negative Toast';
  group.append(negativeToastButton);

  negativeToastButton.addEventListener('click', () => {
    container.dispatchEvent(new CustomEvent(PLUGIN_EVENTS.TOAST, { detail: { message: 'Toast Shown!', variant: 'negative' } }));
  });

  const showLoaderButton = document.createElement('sp-button');
  showLoaderButton.setAttribute('variant', 'primary');
  showLoaderButton.textContent = 'Show Loader';
  group.append(showLoaderButton);

  showLoaderButton.addEventListener('click', () => {
    group.style.display = 'none';
    container.dispatchEvent(new CustomEvent(PLUGIN_EVENTS.SHOW_LOADER));
    setTimeout(() => {
      group.style.display = 'inline-flex';
      container.dispatchEvent(new CustomEvent(PLUGIN_EVENTS.HIDE_LOADER));
    }, 2000);
  });

  container.append(group);
}

export default {
  title: 'API Test',
  searchEnabled: false,
};
