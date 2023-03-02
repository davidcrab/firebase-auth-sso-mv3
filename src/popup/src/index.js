import React from 'react'
import ReactDOM from 'react-dom'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth'
import { FIREBASE_CONFIG } from './const'

export const firebase = initializeApp(FIREBASE_CONFIG)
export const auth = getAuth(firebase)
const deckId = "User created deck 2"

export const App = (props) =>
{
  const [user, setUser] = React.useState(undefined)
  
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
    var deckName = "User created deck 2"
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

  const addProdict = e =>
  {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'get-data' }, function(response) {
        let postParams = response.data
        if (postParams.deckId == "") {
          postParams.deckId = deckId
        }
        // TODO: update button to show loading
        button.innerHTML = "Loading..."
        postData(postParams.deckId, postParams.productName, postParams.productImage, postParams.productDescription, postParams.productNotes, postParams.productId)
          .then(() => {
            button.innerHTML = "Add to Deck"
          }
        );
      });
    });
  }
  

  React.useEffect(() =>
  {
    auth.onAuthStateChanged(user =>
    {
      setUser(user && user.uid ? user : null)
    })
  }, [])

  if ( undefined === user )
    return <h1>Loading...</h1>

  console.log(user)
  if ( user != null) {
    console.log(user)
    console.log(JSON.stringify(user))
    return (
      <div>
        <h1>Signed in as {user.displayName}.</h1>
        <button onClick={auth.signOut.bind(auth)}>Sign Out?</button>
        <button onClick={createDeck} >Create Deck</button>
        {/*add a select option for deck id*/}
        <button onClick={addProdict} >Add Product</button>
      </div>
    )
  }

  return (
    <button onClick={signIn}>Sign In with Google</button>
  )
}

ReactDOM.render(<App/>, document.getElementById('root'))
