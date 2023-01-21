chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    let selection;

    if(window.getSelection){
      selection = window.getSelection().toString();
    }else{
      selection = '';
    }
    sendResponse(selection);
  });