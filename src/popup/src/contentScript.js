console.log("Content script running");
var element = document.querySelector(".mb-4"); 
console.log(element.textContent);
var deck = ""

async function getProductData() {
  // get the active image in the carousel: class="primary-carousel carousel-item active"
  // get the image src: class="popupTrigger"
  var element = document.querySelector('.primary-carousel.carousel-item.active');
  var popupTrigger = element ? element.querySelector('.popupTrigger') : '';
  var productImage = popupTrigger ? popupTrigger.getAttribute('src') : '';
  // var element = document.querySelector('.popupTrigger');
  // var productImage = element ? element.getAttribute('src') : '';
  console.log("productImage: " + productImage);
  var productName = document.querySelector('.mb-4').textContent;
  var productImage = "https://www.hitpromo.net" + productImage;

  // Download the image and convert it to a Blob
  const imageResponse = await fetch(productImage);
  const imageBlob = await imageResponse.blob();
  const reader = new FileReader();
  reader.readAsDataURL(imageBlob);

  // Return a promise that resolves with the product information
  return new Promise((resolve, reject) => {
    reader.onloadend = () => {
      const base64Image = reader.result;

      var deckId = deck;
      var descriptions = getProductDescription()
      var notes = getProductNotes()
      var pricing = getPricing()

      notes = pricing.concat(notes)

      var productId = productName.split(' ')[0];

      resolve({
        "deckId": deckId,
        "productId": productId,
        "productName": productName,
        "productImage": base64Image,
        "productDescription": descriptions,
        "productNotes": notes
      });
    };
  });
}


// updated this so the description is not an array. just a string seperated by -
function getProductDescription() {
  console.log("getProductDescription function called");
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
  console.log("getPricing function called");
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
  console.log("getProductNotes function called");
  var element = document.querySelector('#product-details');
  var divs = element.querySelectorAll('div', class_='col-md-12 col-lg-6');
  var notes = [];
  for (var i = 0; i < divs.length; i++) {
    notes.push(divs[i].textContent);
  }
  return notes;
}

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(message) {
    if (message.type === "getData") {
      getProductData().then(function(data) {
        console.log("Prepared data:", data)
        console.log("Sending data back to popup", data);
        port.postMessage({data: data});
      });

    }
  });
});
