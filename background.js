let defaultSettings = {
  length: 12,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeSimilarCharacters: false,
  excludeAmbiguousCharacters: false
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get('passwordSettings', (data) => {
    if (!data.passwordSettings) {
      chrome.storage.sync.set({ passwordSettings: defaultSettings });
    }
  });
  
  chrome.contextMenus.create({
    id: "generatePasswordContextMenu",
    title: "Generate Password",
    contexts: ["editable"]
  });
});

function generatePassword(settings) {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const similarChars = 'il1Lo0O';
  const ambiguousChars = '{}[]()/\\\'"`~,;:.<>';

  let validChars = '';
  if (settings.uppercase) validChars += uppercaseChars;
  if (settings.lowercase) validChars += lowercaseChars;
  if (settings.numbers) validChars += numberChars;
  if (settings.symbols) validChars += symbolChars;

  if (settings.excludeSimilarCharacters) {
    validChars = validChars.split('').filter(char => !similarChars.includes(char)).join('');
  }
  if (settings.excludeAmbiguousCharacters) {
    validChars = validChars.split('').filter(char => !ambiguousChars.includes(char)).join('');
  }

  let password = '';
  for (let i = 0; i < settings.length; i++) {
    const randomIndex = Math.floor(Math.random() * validChars.length);
    password += validChars[randomIndex];
  }

  return password;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generatePassword") {
    chrome.storage.sync.get('passwordSettings', (data) => {
      const password = generatePassword(data.passwordSettings || defaultSettings);
      sendResponse({ password: password });
    });
    return true; // Indicates that the response is sent asynchronously
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "generate-password") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.storage.sync.get('passwordSettings', (data) => {
        const password = generatePassword(data.passwordSettings || defaultSettings);
        chrome.tabs.sendMessage(tabs[0].id, {action: "insertPassword", password: password});
      });
    });
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generatePasswordContextMenu") {
    chrome.storage.sync.get('passwordSettings', (data) => {
      const password = generatePassword(data.passwordSettings || defaultSettings);
      chrome.tabs.sendMessage(tab.id, {action: "insertPassword", password: password});
    });
  }
});
