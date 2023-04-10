const getKey = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['openai-key'], (result) => {
      if (result['openai-key']) {
        const decodedKey = atob(result['openai-key']);
        resolve(decodedKey);
      }
    });
  });
};

const generate = async (prompt) => {
  const key = await getKey();
  const url = 'https://api.openai.com/v1/completions';
	
  // Call completions endpoint
  const completionResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 1250,
      temperature: 0.7,
    }),
  });
	
  const completion = await completionResponse.json();

  return completion.choices.pop();
}

const generateCompletionAction = async (info) => {
  try {
    const { selectionText } = info;

    const basePromptPrefix = `
      Write me a "T-shaped" study roadmap to become a good software developer focusing on:
    
      Area:
    `;

    const baseCompletion = await generate(`${basePromptPrefix}${selectionText}`);

    const secondPrompt = `
    Take the table of contents and title of the blog post below and generate a blog post. Make it feel like a story. Don't just list the points. Go deep into each one. Explain why.
    
    Title: ${selectionText}
    
    Table of Contents: ${baseCompletion.text}
    
    Blog Post:
    `;

    const secondPromptCompletion = await generate(secondPrompt);

    console.log(secondPromptCompletion.text)	
  } catch (error) {
    console.log(error);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'context-run',
    title: 'Generate T-Shapped Developer Roadmap',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(generateCompletionAction);
