chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "getDefinition",
    title: "Define & Save '%s'",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "getDefinition") {
    const word = info.selectionText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim().toLowerCase();

    chrome.tts.speak(word, { rate: 0.8 });

    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      .then(response => {
        if (!response.ok) throw new Error("Not found");
        return response.json();
      })
      .then(data => {
        let allDefinitions = [];
        data[0].meanings.forEach(meaning => {
          meaning.definitions.forEach((defObj, index) => {
            if (index < 2) { 
              allDefinitions.push(`(${meaning.partOfSpeech}) ${defObj.definition}`);
            }
          });
        });

        const fullDefString = allDefinitions.join("\n\n");
        
        // --- NEW LOGIC TO PREVENT DUPLICATES ---
        chrome.storage.local.get({ greList: [] }, (result) => {
          let list = result.greList;
          
          // Check if the word is already in the list
          const alreadyExists = list.some(item => item.word === word);

          if (!alreadyExists) {
            list.push({ 
              word: word, 
              definition: fullDefString, 
              date: new Date().toLocaleDateString() 
            });
            chrome.storage.local.set({ greList: list });
            
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: (w, d) => { alert(`${w.toUpperCase()}:\n\n${d}\n\n(Saved to your list!)`); },
              args: [word, fullDefString]
            });
          } else {
            // If it exists, just show the definition without saving again
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: (w, d) => { alert(`${w.toUpperCase()} (Already in list):\n\n${d}`); },
              args: [word, fullDefString]
            });
          }
        });
      })
      .catch(() => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (w) => { alert(`Definition not found for: ${w}`); },
          args: [word]
        });
      });
  }
});