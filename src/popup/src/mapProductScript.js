console.log("Map Product Script Called");

var html = document.querySelector("body").innerHTML
var url = window.location.href
chrome.runtime.sendMessage({ action: "testPassData", html: html, url: url }, function(response) {
  console.log("Send messages")
  if (response && response.received) {
    console.log("Popup received HTML content");
  }
});