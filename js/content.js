// Constants
const MESSAGE_GET_SELECTION = 'getSelectionText';

/**
 * Get selected text
 * @returns {string} Selected text
 */
const getSelectedText = () => {
  try {
    return window.getSelection()?.toString() || '';
  } catch (error) {
    console.error('Failed to get selection:', error);
    return '';
  }
};

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === MESSAGE_GET_SELECTION) {
    sendResponse(getSelectedText());
  }
});