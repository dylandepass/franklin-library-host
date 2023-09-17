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

export async function fetchCompletion(prompt) {
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  const requestBody = {
    model: 'gpt-4',
    temperature: 0.2, // Controls the randomness of the generated text
    n: 1, // Number of completions to generate
    frequency_penalty: 0,
    presence_penalty: 0,
    messages: [{ role: 'user', content: prompt }],
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('open-ai-key')}`,
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();
  if (response.ok) {
    const completion = data.choices[0].message.content;
    return completion;
  }

  throw new Error(`${data.error.message}: ${data.error.code}`);
}
