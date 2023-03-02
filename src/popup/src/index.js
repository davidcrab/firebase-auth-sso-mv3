import React from 'react'
import ReactDOM from 'react-dom'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth'
import { FIREBASE_CONFIG } from './const'

export const firebase = initializeApp(FIREBASE_CONFIG)
export const auth = getAuth(firebase)

export const App = (props) =>
{
  const [user, setUser] = React.useState(undefined)
  const [deckId, setDeck] = React.useState(undefined)
  const [demoDeckId, setDemoDeck] = React.useState(undefined)

  const QueryDecks = async () => {

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      "userId": user.uid
    });
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };    
  
    const resp = await fetch("https://us-central1-siip-e2ada.cloudfunctions.net/app/userDecks", requestOptions)
      .then(response => {
        return response.text();
      })
      .then(result => {
        let parsedResult = JSON.parse(result);
        console.log(parsedResult);
        const deckSelect = document.getElementById('deckSelect');
  
        for (const deck of parsedResult) {
          const optionElement = document.createElement('option');
          optionElement.value = deck.id;
          optionElement.text = deck.name;
          deckSelect.add(optionElement);
        }
        return parsedResult; // return the parsed result from this function
      })
      .catch(error => console.log('error', error));
  
      // remove loading indicator from dom  
    return resp; // return the response from the fetch call
  };

  // TODO: 1. Add loading indicator 2. reload decks after adding new deck. 3. Add error handling. 4. Add success handling.  
  React.useEffect(() => {
    if (user) {
      QueryDecks();
    }
    // run this code when the value of user changes and is not undefined
  }, [user]);
  
  async function postData(deckId, productName, productImage, descriptions, notes, productId) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
  
    var raw = JSON.stringify({
      "deckId": deckId,
      "productId": productId,
      "productName": productName,
      "productImage": productImage,
      "productDescription": descriptions,
      "productNotes": notes
    });
  
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
  
    // TODO: Update button to show success or failure
    const resp = await fetch("https://us-central1-siip-e2ada.cloudfunctions.net/app/updateDeck", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  
    return true;
  }
  
  const signIn = e =>
  {
    e.preventDefault()

    chrome.identity.getAuthToken({ interactive: true }, token =>
    {
      if ( chrome.runtime.lastError || ! token ) {
        alert(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
        return
      }

      signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
        .then(res =>
        {
          console.log("Result: ", res)
          console.log('signed in!')
        })
        .catch(err =>
        {
          alert(`SSO ended with an error: ${err}`)
        })
    })
  }

  const createDeck = e =>
  {
    e.preventDefault()
    var deckName = "User created deck 3"
    /* replace with user input. <input id="inputName" type="text" placeholder="Deck Name" /> */
    deckName = document.getElementById("inputName").value;

    console.log("Create Deck")
    const newDeckData = {
      deckName: deckName,
      userId: user.uid
    }
    // use firestore to create a deck
    fetch("https://us-central1-siip-e2ada.cloudfunctions.net/app/createDeck", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newDeckData)
    })
    .then(response => response.text())
    .then(result => {
      console.log(result);
    })
    .catch(error => console.log('error', error));
  }

  const addProduct = e =>
  {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'get-data' }, function(response) {
        let postParams = response.data
        if (postParams.deckId == "") {
          console.log("Deck id not set, using selected deck id: " + deckId)
          postParams.deckId = deckId
        }
        console.log("Post deck id: " + postParams.deckId)
        // TODO: update button to show loading
        postData(postParams.deckId, postParams.productName, postParams.productImage, postParams.productDescription, postParams.productNotes, postParams.productId)
          .then(() => {
            console.log("Product added to deck")
          }
        );
      });
    });
  }

  // TODO: 1. clear input after submit 2. add error handling 3. add success handling
  const createDemoDeck = e =>
  {
    e.preventDefault()
    var deckName = "User created deck 3"
    /* replace with user input. <input id="inputName" type="text" placeholder="Deck Name" /> */
    deckName = document.getElementById("demoDeckName").value;

    console.log("Create Deck")
    const newDeckData = {
      deckName: deckName,
      userId: "demo"
    }
    // use firestore to create a deck
    fetch("https://us-central1-siip-e2ada.cloudfunctions.net/app/createDeck", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newDeckData)
    })
    .then(response => response.text())
    .then(result => {
      console.log(result);
    })
    .catch(error => console.log('error', error));
  }

  const QueryDemoDecks = async () => {

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      "userId": "demo"
    });
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };    
  
    const resp = await fetch("https://us-central1-siip-e2ada.cloudfunctions.net/app/userDecks", requestOptions)
      .then(response => {
        return response.text();
      })
      .then(result => {
        let parsedResult = JSON.parse(result);
        console.log(parsedResult);
        const deckSelect = document.getElementById('demoDeckSelect');
  
        for (const deck of parsedResult) {
          const optionElement = document.createElement('option');
          optionElement.value = deck.id;
          optionElement.text = deck.name;
          deckSelect.add(optionElement);
        }
        return parsedResult; // return the parsed result from this function
      })
      .catch(error => console.log('error', error));
  
      // remove loading indicator from dom  
    return resp; // return the response from the fetch call
  };

  React.useEffect(() =>
  {
    auth.onAuthStateChanged(user =>
    {
      setUser(user && user.uid ? user : null)
    })
  }, [])

  // Query demo decks useeffect
  React.useEffect(() => {
    // if use is not signed in, query demo decks
    if ( user !== undefined && user == null ) {
      console.log("Querying demo decks")
      QueryDemoDecks();
    }
  }, [user]);
    

  if ( undefined === user )
    return <h1>Loading...</h1>

  console.log(user)
  if ( user != null) {

    return (
      <div>
        <h1>Signed in as {user.displayName}.</h1>
        <button onClick={auth.signOut.bind(auth)}>Sign Out?</button>
        <form>
          <input id="inputName" type="text" placeholder="Deck Name" />
          <button onClick={createDeck} >Create Deck</button>
        </form>
        {/*add a select option for deck id*/}
        <button onClick={addProduct} >Add Product</button>
        <select id="deckSelect" onChange={e => setDeck(e.target.value)}>
        </select>
      </div>
    )
  }

  return (
    <>
      <h1>Demo Sales Deck Editor</h1>
      <p>Create a Deck. Go to Hit Promo and search products. To add a product to the deck, go to its product detail page and click this extension.</p>
      <form>
        <input id="demoDeckName" type="text" placeholder="Deck Name" />
        <button onClick={createDemoDeck}>Create Deck</button>
      </form>
      <select id="demoDeckSelect" onChange={e => setDeck(e.target.value)}>
        </select>
      <button onClick={signIn}>Sign In with Google</button>
    </>
  )
}

ReactDOM.render(<App/>, document.getElementById('root'))
