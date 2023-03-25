console.log("Content script running");
// var element = document.querySelector(".mb-4"); 
// console.log(element.textContent);
var deck = ""

// content_script.js

// document.addEventListener('click', function(event) {
//   // Get the selected element
//   var selectedElement = window.getSelection().anchorNode.parentElement;

//   console.log("selectedElement: " + selectedElement.outerHTML);

//   // Send the selected element to the background script
//   chrome.runtime.sendMessage({element: selectedElement.outerHTML});
// });


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

/*********************************************************
 * VENDOR: PRIMELINE
 * 
 * 
********************************************************/
async function getPrimelineProductData() {

  /*
  productId: class="sku"
  */
  var element = document.querySelector('.sku');
  var productId = element ? element.textContent : '';
  // remove new line characters and anything but characters and numbers
  productId = productId.replace(/(\r \t \n)/gm, "");
  productId = productId.replace(/[^a-zA-Z0-9]/g, "");
  console.log("SIP: ", productId)
  var productImage = getPrimelineProductImage();

  // Download the image and convert it to a Blob
  const imageResponse = await fetch(productImage);
  const imageBlob = await imageResponse.blob();
  const reader = new FileReader();
  reader.readAsDataURL(imageBlob);

  // Return a promise that resolves with the product information
  return new Promise((resolve, reject) => {
    reader.onloadend = () => {
      const base64Image = reader.result;

      resolve({
        "productId": productId,
        "productName": getPrimelineProductName(),
        "productDescription": getPrimelineProductDescription(),
        "productImage": base64Image,
        "productNotes": getPrimelineProductNotes(),
        "pricingTable": getPrimelineProductPricingTable(),
      });
    };
  });
}

function getPrimelineProductName() {
  /*
  class="product-name"
  */
  var element = document.querySelector('.product-name');
  var productName = element ? element.textContent : '';
  console.log("SIP: ", productName)
  return productName;
}

function getPrimelineProductDescription() {
  /*
  class="std"
  */
  var element = document.querySelector('.std');
  var productDescription = element ? element.textContent : '';
  console.log("SIP: ", productDescription)
  // temp hack change every "." to a "-" to make it easier to parse
  productDescription = productDescription.replace(/\./g, "-");
  // delete the last "-" from the string
  productDescription = productDescription.substring(0, productDescription.length - 1);

  return productDescription;
}

function getPrimelineProductImage() {
  /*
  class="gallery-image visible"
  */
  var element = document.querySelector('.gallery-image.visible');
  var productImage = element ? element.getAttribute('src') : '';
  console.log("SIP: ", productImage)
  return productImage;
}

function getPrimelineProductNotes() {
  return [""]
}

function getPrimelineProductPricingTable() {
  return ""
}

/*********************************************************
 * VENDOR: HIGHCAlIBER
 *
 *  
********************************************************/
async function getHighCaliberProductData() {
  /*
  productId: class="item-title"
  */
  var element = document.querySelector('.item-title');
  var productId = element ? element.textContent : '';
  productId = productId.replace(/(\r \t \n)/gm, "");
  productId = productId.replace(/[^a-zA-Z0-9]/g, "");
  console.log("SIP: ", productId)
  var productImage = getHighCaliberProductImage();

  // Download the image and convert it to a Blob
  const imageResponse = await fetch(productImage);
  const imageBlob = await imageResponse.blob();
  const reader = new FileReader();
  reader.readAsDataURL(imageBlob);

  // Return a promise that resolves with the product information
  return new Promise((resolve, reject) => {
    reader.onloadend = () => {
      const base64Image = reader.result;

      resolve({
        "productId": productId,
        "productName": getHighCaliberProductName(),
        "productDescription": getHighCaliberProductDescription(),
        "productImage": base64Image,
        "productNotes": getHighCaliberProductNotes(),
        "pricingTable": getHighCaliberProductPricingTable(),
      });
    };
  });
}

function getHighCaliberProductName() {
  /*
  class="product-name product-title"
  */
  var element = document.querySelector('.product-name.product-title');
  /* class itemprop="name" */
  var nameElement = element.querySelector('[itemprop="name"]');
  var productName = nameElement ? nameElement.textContent : '';

  console.log("SIP: ", productName)
  return productName;
}

function getHighCaliberProductDescription() {
  /*
  class="std"
  */
  var element = document.querySelector('.std');
  var productDescription = element ? element.textContent : '';
  console.log("SIP: ", productDescription)
  // temp hack change every "." to a "-" to make it easier to parse
  productDescription = productDescription.replace(/\./g, "-");
  // delete the last "-" from the string
  productDescription = productDescription.substring(0, productDescription.length - 1);

  return productDescription;
}

function getHighCaliberProductImage() {
  /* 
  <li id="slide" class="WEDO_SLIDE lslide active" style="height: 450px; margin-bottom: 0px;" data-thumb="https://highcaliberline.com/media/catalog/product/cache/1/image/100x100/9df78eab33525d08d6e5fb8d27136e95/t/-/t-132-blue-window-break.jpg" data-label="42637">
                    <a data-fancybox="product_images" id="image_42637" href="https://highcaliberline.com/media/catalog/product/cache/1/image/800x800/9df78eab33525d08d6e5fb8d27136e95/t/-/t-132-blue-window-break.jpg" title="" class="videothumb fancybox cloud-zoom-gallery productimages" rel="useZoom:'zoomID',smallImage:'https://highcaliberline.com/media/catalog/product/cache/1/image/800x800/9df78eab33525d08d6e5fb8d27136e95/t/-/t-132-blue-front-blank.jpg'" onclick="javascript:product_color(this);setSelectedImageId('42637','1.008');return false;">
                        <img class="img-responsive" height="500" width="" src="https://highcaliberline.com/media/catalog/product/cache/1/image/800x800/9df78eab33525d08d6e5fb8d27136e95/t/-/t-132-blue-window-break.jpg" alt="">
                    </a>
                </li>
  class="WEDO_SLIDE lslide active"

  */
  var element = document.querySelector('.WEDO_SLIDE.lslide.active');
  // get img tag
  var img = element ? element.querySelector('img') : '';
  var productImage = img ? img.getAttribute('src') : '';
  console.log("SIP: ", productImage)
  return productImage;
}

function getHighCaliberProductNotes() {
  return [""]
}

function getHighCaliberProductPricingTable() {
  return ""
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
        console.log("Sending data back to popup", productData);
        port.postMessage({data: productData});
      } else if (url.includes("https://www.primeline.com/")) {
        getPrimelineProductData().then(function(data) {
          console.log("Sending data back to popup", data);
          port.postMessage({data: data});
        });
      } else if (url.includes("https://highcaliberline.com/")) {
        getHighCaliberProductData().then(function(data) {
          console.log("Sending data back to popup", data);
          port.postMessage({data: data});
        });
      } else {
        getProductData().then(function(data) {
          console.log("Sending data back to popup", data);
          port.postMessage({data: data});
        });
      }

    }
  });
});
