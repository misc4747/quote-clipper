const updateContextMenus = async () => {
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    id: "quote-select-text",
    title: "選択範囲を引用形式でコピー",
    contexts: ["all"]
  });
};

chrome.runtime.onInstalled.addListener(updateContextMenus);
chrome.runtime.onStartup.addListener(updateContextMenus);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  handleQuoteClipper();
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'quote-clipper') {
    handleQuoteClipper();
  }
});

const handleQuoteClipper = () => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {message: 'getSelectionText'}, function(response) {
      let text = toQuoteFormat(response);
      toClipboard(tabs[0], text);
    });
  });
};

const toClipboard = (tab, text) => {
  function injectedFunction(text) {
    try {
      navigator.clipboard.writeText(text);
    } catch (e) {}
  }
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: injectedFunction,
    args: [text]
  });
};

const toQuoteFormat = (text) => {
  let replaced = text.replace(/\n/g, '\n> ');
  return '> ' + replaced;
};
