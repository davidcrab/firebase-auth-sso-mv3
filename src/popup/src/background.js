// console.log("Extension installed");

// chrome.runtime.onInstalled.addListener(function(details) {
//   console.log("Extension updated to version " + chrome.runtime.getManifest().version);
// });

// chrome.runtime.onMessage.addListener((message) => {
//   if (message.action === "openPopup") {
//     // Get the ID of the current window
//    // Get the ID of the current tab in the current window
//   //  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//   //   const currentTabId = tabs[0].id;

//   //   // Update the URL of the current tab to the extension's popup URL
//   //   chrome.tabs.update(currentTabId, {
//   //     url: chrome.runtime.getURL("./src/popup/public/index.html"),
//   //     type: "popup",
//   //   });
//   // });

//   chrome.windows.create({
//     url: chrome.runtime.getURL("./src/popup/public/index.html"),
//     type: "popup",
//     width: 400,
//     height: 400,
//   });
// }
// });