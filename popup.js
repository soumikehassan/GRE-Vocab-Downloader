// Display the list
chrome.storage.local.get("greList", (data) => {
  const div = document.getElementById("list");
  if (!data.greList || data.greList.length === 0) {
    div.innerHTML = "<p>No words saved yet.</p>";
    return;
  }
  data.greList.reverse().forEach(item => {
    div.innerHTML += `<div class="word-item"><b>${item.word}</b><br><small>${item.definition}</small></div>`;
  });
});

// Download logic
document.getElementById('downloadBtn').addEventListener('click', () => {
  chrome.storage.local.get("greList", (data) => {
    let text = "MY GRE VOCABULARY LIST\n\n";
    data.greList.forEach(item => {
      text += `${item.word.toUpperCase()}: ${item.definition} (${item.date})\n\n`;
    });
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GRE_Vocab_List.txt';
    a.click();
  });
});