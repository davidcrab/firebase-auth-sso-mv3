console.log("Content script running");
// var element = document.querySelector(".mb-4"); 
// console.log(element.textContent);
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
      var pricingTable = getPricingTable()

      notes = pricing.concat(notes)

      var productId = productName.split(' ')[0];

      resolve({
        "deckId": deckId,
        "productId": productId,
        "productName": productName,
        "productImage": base64Image,
        "productDescription": descriptions,
        "productNotes": notes,
        "pricingTable": pricingTable
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

function getPricingTable() {
  /* Get the entire html table for pricing
  <table id="pricingTable" class="table table-pricing">
  */

  var element = document.querySelector('#pricingTable');
  var pricingTable = element.outerHTML;
  console.log("Pricing Table", pricingTable)
  return pricingTable;
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

/*********************************************************
  VENDOR: PCNA
********************************************************/
function getPCNAProductData() {
  /*
  productId: id="pdp-sku"
  */
  var element = document.querySelector('#pdp-sku');
  var productId = element ? element.textContent : '';
  console.log("SIP: ", productId)

  let productData = {
    "productId": productId,
    "productName": getPCNAProductName(),
    "productDescription": getPCNAProductDescription(),
    "productImage": getPCNAProductImage(),
    "productNotes": getPCNAProductNotes(),
    "pricingTable": getPCNAProductPricingTable(),
  }
  return productData;
}

function getPCNAProductNotes() {
  return [""]
}

function getPCNAProductPricingTable() {
  return ""
}

function getPCNAProductName() {
  /*
  bold-24 spacer-xs text-gray1 product-name
  */
  var element = document.querySelector('.bold-24.spacer-xs.text-gray1.product-name');
  var productName = element ? element.textContent : '';
  console.log("SIP: ", productName)
  return productName;
}

function getPCNAProductDescription() {
  /*
  id="overview-tab-description"
  */
  var element = document.querySelector('#overview-tab-description');
  var productDescription = element ? element.textContent : '';
  console.log("SIP: ", productDescription)
  // temp hack change every "." to a "-" to make it easier to parse
  productDescription = productDescription.replace(/\./g, "-");
  // delete the last "-" from the string
  productDescription = productDescription.substring(0, productDescription.length - 1);
  return productDescription;
}

function getPCNAProductImage() {
  /*
  id="main-pdp-img"
  */
  var element = document.querySelector('#main-pdp-img');
  var productImage = element ? element.getAttribute('src') : '';
  console.log("SIP: ", productImage)
  return productImage;
}

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(message) {
    /* 
      if the message type is getData and the tab url is https://www.pcna.com/en-us/product/* then 
    */

    /* 
      if the message type is getData and default tab url
    */
    if (message.type === "getData") {

      // get the current url
      var url = window.location.href;
      
      // if https://www.pcna.com/en-us/product/ is in the url then get the product data
      if (url.includes("https://www.pcna.com/en-us/product/")) {
        console.log("Different process")
        var productData = getPCNAProductData();
        console.log("Prepared data:", productData)
        console.log("Sending data back to popup", productData);
        port.postMessage({data: productData});

      } else {
        getProductData().then(function(data) {
          console.log("Prepared data:", data)
          console.log("Sending data back to popup", data);
          port.postMessage({data: data});
        });
      }

    }
  });
});
