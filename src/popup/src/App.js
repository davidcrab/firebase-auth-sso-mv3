import React from 'react'
import ReactDOM from 'react-dom'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth'
import { FIREBASE_CONFIG } from './const'
import { Button, Heading, Input, VStack, Select, Divider, FormControl, Box,
Tabs, TabList, Tab, TabPanel, TabPanels, Text, HStack, Link, Spacer, Spinner } from '@chakra-ui/react'

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
  
  async function postData(deckId, productName, productImage, descriptions, notes, productId, pricingTable) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
  
    var raw = JSON.stringify({
      "deckId": deckId,
      "productId": productId,
      "productName": productName,
      "productImage": productImage,
      "productDescription": descriptions,
      "productNotes": notes,
      "pricingTable": pricingTable
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
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var port = chrome.tabs.connect(tabs[0].id);
      port.postMessage({type: "getData"});
      port.onMessage.addListener(function(response) {
        console.log("Response", response);
        console.log("Response data", response.data);
        let postParams = response.data
        postData(deckId, postParams.productName, postParams.productImage, postParams.productDescription, postParams.productNotes, postParams.productId, postParams.pricingTable)
        .then(() => {
          console.log("Product added to deck")
        })
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

    /*
    Add loading indicator
    use <Spinner />
    */
    let loadingIndicator = document.createElement('div');
    loadingIndicator.classList.add('loading-indicator');
    loadingIndicator.innerHTML = 'Loading...';
    document.body.appendChild(loadingIndicator);

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

        // set the first deck as the default
        setDemoDeck(parsedResult[0].id)
  
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
      loadingIndicator.remove();

    return resp; // return the response from the fetch call
  };

  const addDemoProduct = e =>
  {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var port = chrome.tabs.connect(tabs[0].id);
      port.postMessage({type: "getData"});
      port.onMessage.addListener(function(response) {
        console.log("Response", response);
        console.log("Response data", response.data);
        let postParams = response.data
        postData(demoDeckId, postParams.productName, postParams.productImage, postParams.productDescription, postParams.productNotes, postParams.productId, postParams.pricingTable)
        .then(() => {
          console.log("Product added to deck")
        })
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

  // Query demo decks useeffect
  React.useEffect(() => {
    // if use is not signed in, query demo decks
    if ( user !== undefined && user == null ) {
      console.log("Querying demo decks")
      QueryDemoDecks();
    }
  }, [user]);

  if ( undefined === user )
    return <Text>Loading...</Text>

  console.log(user)
  if ( user != null) {

    return (
      <VStack m="5">
        <Tabs align='center' isFitted>
          <TabList w="full">
            <Tab>Update Deck</Tab>
            <Tab>New Deck</Tab>
          </TabList>

          <TabPanels w="full">
            <TabPanel w="350px">
              <FormControl w="full">
                <Select id="deckSelect" onChange={e => setDeck(e.target.value)}>
                </Select>
                <Button mt={4} onClick={addProduct} >Add Product</Button>
              </FormControl>
            </TabPanel>
            <TabPanel>
              <FormControl>
                <Input id="inputName" type="text" placeholder="Deck Name" />
                <Button mt={4} onClick={createDeck}>Create Deck</Button>
              </FormControl>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Divider />
        <Box w="full">
          <HStack>
            <Link href="https://www.hitpromo.net" isExternal>Hit Promo</Link>
            <Spacer />
            <Button size={"sm"} onClick={auth.signOut.bind(auth)}>Sign Out?</Button>
          </HStack>
        </Box>

      </VStack>
    )
  }

  return (
    <VStack m="5">
      <Heading>Demo Sales Deck Editor - Test Change</Heading>
      <Text>Create a Deck. Go to Hit Promo and search products. To add a product to the deck, go to the product's detail page and click this extension.</Text>
      <FormControl>
        <Input id="demoDeckName" type="text" placeholder="Deck Name" />
        <Button mt="4" onClick={createDemoDeck}>Create Deck</Button>
      </FormControl>
      <FormControl>
        <Select id="demoDeckSelect" onChange={e => setDemoDeck(e.target.value)}>
        </Select>
        <Button mt={4} onClick={addDemoProduct} >Add Product</Button>
      </FormControl>
      <Divider />
        <Box w="full">
          <HStack>
            <Link href="https://hitpromo.net" isExternal>Hit Promo</Link>
            <Spacer />
            <Button size="sm" onClick={signIn}>Sign In with Google</Button>
          </HStack>
        </Box>
    </VStack>
  )
}

export default App;