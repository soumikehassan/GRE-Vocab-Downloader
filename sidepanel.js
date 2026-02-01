chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "UPDATE_URL") {
    document.getElementById('cambridgeFrame').src = message.url;
    document.getElementById('status').innerText = `Defining: ${message.word}`;
  }
});
