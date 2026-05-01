importScripts('constants.js');

const {
  COMMAND_NAME,
  CONTEXT_MENU_ID,
  CONTEXT_MENU_TITLE,
  MESSAGE_GET_SELECTION
} = globalThis.QUOTE_CLIPPER;

const createContextMenu = async () => {
  try {
    await chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: CONTEXT_MENU_TITLE,
      contexts: ['selection']
    });
  } catch (error) {
    console.error('Failed to create context menu:', error);
  }
};

const toQuoteFormat = (text) => {
  return text ? `> ${text.replace(/\n/g, '\n> ')}` : '';
};

const getActiveTab = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
};

const canAccessTab = async (tabId) => {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => true
    });
    return true;
  } catch (error) {
    console.error('Cannot access this tab:', error);
    return false;
  }
};

const getSelectionFromTab = async (tabId) => {
  try {
    return await chrome.tabs.sendMessage(tabId, { message: MESSAGE_GET_SELECTION });
  } catch (error) {
    if (!error.message?.includes('Could not establish connection')) {
      throw error;
    }

    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['js/constants.js', 'js/content.js']
    });
    return chrome.tabs.sendMessage(tabId, { message: MESSAGE_GET_SELECTION });
  }
};

const copyToClipboard = async (tabId, text) => {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (value) => navigator.clipboard.writeText(value),
    args: [text]
  });
};

const handleQuoteClipper = async () => {
  try {
    const tab = await getActiveTab();
    if (!tab?.id) {
      console.error('No active tab found');
      return;
    }

    if (!await canAccessTab(tab.id)) return;

    const text = await getSelectionFromTab(tab.id);
    const quotedText = toQuoteFormat(text);
    await copyToClipboard(tab.id, quotedText);
  } catch (error) {
    console.error('Failed to handle quote clipping:', error);
  }
};

chrome.runtime.onInstalled.addListener(createContextMenu);
chrome.runtime.onStartup.addListener(createContextMenu);
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === CONTEXT_MENU_ID) {
    handleQuoteClipper();
  }
});
chrome.commands.onCommand.addListener((command) => {
  if (command === COMMAND_NAME) {
    handleQuoteClipper();
  }
});
