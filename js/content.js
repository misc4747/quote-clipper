(() => {
  if (globalThis.__QUOTE_CLIPPER_CONTENT_LOADED__) return;
  globalThis.__QUOTE_CLIPPER_CONTENT_LOADED__ = true;

  const { MESSAGE_GET_SELECTION } = globalThis.QUOTE_CLIPPER;

  const getSelectedText = () => {
    try {
      return window.getSelection()?.toString() || '';
    } catch (error) {
      console.error('Failed to get selection:', error);
      return '';
    }
  };

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === MESSAGE_GET_SELECTION) {
      sendResponse(getSelectedText());
    }
  });
})();
