// Constants
const CONTEXT_MENU_ID = 'quote-select-text';
const CONTEXT_MENU_TITLE = 'Copy selected text in quote format';
const COMMAND_NAME = 'quote-clipper';
const MESSAGE_GET_SELECTION = 'getSelectionText';

/**
 * Update context menus
 */
const updateContextMenus = async () => {
  try {
    await chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: CONTEXT_MENU_TITLE,
      contexts: ['all']
    });
  } catch (error) {
    console.error('Failed to update context menus:', error);
  }
};

/**
 * Convert selected text to quote format
 * @param {string} text - Original text
 * @returns {string} Quoted text
 */
const toQuoteFormat = (text) => {
  if (!text) return '';
  const replaced = text.replace(/\n/g, '\n> ');
  return '> ' + replaced;
};

/**
 * Copy text to clipboard
 * @param {object} tab - Current tab information
 * @param {string} text - Copied text
 */
const toClipboard = async (tab, text) => {
  const injectedFunction = (text) => {
    return navigator.clipboard.writeText(text)
      .catch(e => console.error('Failed to copy to clipboard:', e));
  };

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injectedFunction,
      args: [text]
    });
  } catch (error) {
    console.error('Failed to execute clipboard script:', error);
  }
};

/**
 * Handle quote clipping
 */
const handleQuoteClipper = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      console.error('No active tab found');
      return;
    }

    // Check if we can access the tab
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => true
      });
    } catch (error) {
      console.error('Cannot access this tab:', error);
      return;
    }

    // Try to get selection text
    const response = await chrome.tabs.sendMessage(tab.id, { message: MESSAGE_GET_SELECTION })
      .catch(async (error) => {
        // If content script is not ready, try reinjecting it
        if (error.message.includes('Could not establish connection')) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['js/content.js']
          });
          // Retry message after reinjection
          return await chrome.tabs.sendMessage(tab.id, { message: MESSAGE_GET_SELECTION });
        }
        throw error;
      });

    const quotedText = toQuoteFormat(response);
    await toClipboard(tab, quotedText);
  } catch (error) {
    console.error('Failed to handle quote clipping:', error);
  }
};

// Event Listeners
chrome.runtime.onInstalled.addListener(updateContextMenus);
chrome.runtime.onStartup.addListener(updateContextMenus);
chrome.tabs.onActivated.addListener(updateContextMenus);
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    updateContextMenus();
  }
});
chrome.contextMenus.onClicked.addListener(() => handleQuoteClipper());
chrome.commands.onCommand.addListener((command) => {
  if (command === COMMAND_NAME) {
    handleQuoteClipper();
  }
});
