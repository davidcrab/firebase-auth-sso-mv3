console.log("Content script running");
var element = document.querySelector(".mb-4"); 
console.log(element.textContent);
var deck = ""

function getProductData() {
  var element = document.querySelector('.popupTrigger');
  var productImage = element ? element.getAttribute('src') : '';
  var productName = document.querySelector('.mb-4').textContent;
  var productImage = "https://www.hitpromo.net" + productImage;

  // Download the image and convert it to a Blob
  // const imageResponse = await fetch(productImage);
  // const imageBlob = await imageResponse.blob();

  var deckId = deck;
  var descriptions = getProductDescription()
  var notes = getProductNotes()
  var pricing = getPricing()

  notes = pricing.concat(notes)

  var productId = productName.split(' ')[0];
  return {
    "deckId": deckId,
    "productId": productId,
    "productName": productName,
    "productImage": productImage,
    "productDescription": descriptions,
    "productNotes": notes
  }
}

// updated this so the description is not an array. just a string seperated by -
function getProductDescription() {
  var element = document.querySelector('#product-details');
  // get the li elements 
  var lis = element.querySelectorAll('li');
  var descriptions = [];
  var descriptionString = "";
  for (var i = 0; i < lis.length; i++) {
    // add the text content to the the description array with "-" infront 
    descriptionString += "-" + lis[i].textContent;
    descriptions.push(lis[i].textContent);
  }
  console.log(descriptionString);
  return descriptionString;
}

function getPricing() {
  var element = document.querySelector('#pricingTable');
  var trs = element.querySelectorAll('tr');
  pricing = element.textContent;
  pricingArray = []
  var index = pricing.indexOf("$");
  var split = pricing.split("$", 1); // returns an array with the first $ and the rest of the string
  pricingArray.push(("Quantity: " + split[0]));
  pricing = pricing.substring(index);
  pricingArray.push(("Pricing: " + pricing));
  
  return pricingArray;
}

function getProductNotes() {
  var element = document.querySelector('#product-details');
  var divs = element.querySelectorAll('div', class_='col-md-12 col-lg-6');
  var notes = [];
  for (var i = 0; i < divs.length; i++) {
    notes.push(divs[i].textContent);
  }
  return notes;
}
           
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Running first listener")
  if (request.action === 'get-data') {
    console.log("Get Data is running from content.js")
    data = getProductData()
    console.log("Prepared data:", data)
    sendResponse({ data: data })
  }
  
  // Check if the message contains a deckId property
  if (request.deckId) {
    // Modify the content of the currently active tab using the selected deck ID
    const deckId = request.deckId;
    console.log(`You selected deck with ID: ${deckId}`)
    deck = deckId;
    // const contentDiv = document.querySelector('#content');
    // contentDiv.textContent = `You selected deck with ID: ${deckId}`;
  }
});
