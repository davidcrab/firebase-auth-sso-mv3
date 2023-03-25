console.log("Map product")
var clickCount = 0;
var product = {};

var isKeyPressed = false;

document.addEventListener('keydown', function(event) {
  if (event.key === 'a') {
    isKeyPressed = true;


  }
});

document.addEventListener('click', function(event) {
  if (isKeyPressed) {
    console.log('User clicked and pressed the "A" key at the same time.');
    chrome.runtime.sendMessage({action: "openPopup"});
  
  }
  isKeyPressed = false;
});


/*
Overlay a header on top of the page
*/
function addHeader() {
  let header = document.createElement('div');
  header.id = "sip-header";
  header.style = "position: fixed; top: 0; left: 0; width: 100%; height: 50px; background-color: #000000; color: #ffffff; z-index: 9999; text-align: center; padding-top: 10px; font-size: 20px; font-weight: bold;";
  header.innerText = "Click on the name of the product";
  document.body.appendChild(header);
  
}

/* 
update the header using the parameter text
*/
function updateHeader(text) {
  let header = document.getElementById("sip-header");
  header.innerText = text;

  if (clickCount == 3) {
    console.log("Adding save button")
      
    // add a save prudct button
    let saveButton = document.createElement('button');
    saveButton.id = "saveButton";
    
    // with an event listener that calls the saveProduct function
    saveButton.addEventListener("click", saveProduct);
    saveButton.innerText = "Save Product";
    header.appendChild(saveButton);
  }
}

/*
Save product 
*/
function saveProduct() {
  console.log("Saving product")
  console.log(product)
  // chrome.storage.sync.set({product: product}, function() {
  //   console.log('Value is set to ' + product);
  // });

  chrome.runtime.sendMessage({action: "openPopup"});

}





addHeader();


// Add a click event listener to the document
// document.addEventListener('click', function(event) {

//   if (clickCount == 0) {
//     console.log("First click")
//     product.name = event.target.innerText;
//     clickCount++;
//     updateHeader("Click on the image of the product")
//   } else if (clickCount == 1) {
//     console.log("Second click")
//     product.image = event.target.src;
//     clickCount++;
//     updateHeader("Click on the description of the product")
//   } else if (clickCount == 2) {
//     console.log("Third click")
//     product.description = event.target.innerText;
//     clickCount++;
//     updateHeader("Click on the price of the product")
//   }
    
//   // console.log("Clicked")
//   // let element = event.target;
//   // console.log(element.tagName)
//   // console.log(event)
//   // console.log(event.target.innerText)

//   // async function sendMessageToPopupScript(message) {
//   //   const response = await chrome.runtime.sendMessage({greeting: "hello"});
//   //   // do something with response here, not outside the function
//   //   console.log(response);
//   // }

//   // sendMessageToPopupScript({greeting: "hello"});


// });