// client/src/App.js

import React from "react";
import logo from "./logo.svg";
import "./App.css";

import jwtDecode from 'jwt-decode';

// import { googleAuthenticator } from './auth.js';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function Item(props) {
  const [checked, setChecked] = React.useState(false);
  function check() {
    if (!checked) {
      fetch("/inclusion-done", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({inclusion_name: props.text, user: props.user})
      }).then(() => {
        props.update();
        setTimeout(() => setChecked(false), 500);
      });
    }
    setChecked(!checked);
  }
  return <div class="flex">
      <input type="checkbox" checked={checked} onChange={check}/>
      <span style={{fontWeight: "bold"}}>{props.text}</span>
      {props.show_count? <span style={{color: "grey"}}>: {props.done_count}</span> : null}
    </div>
}

function App() {
  const [data, setData] = React.useState(null);
  const [updateCount, setUpdateCount] = React.useState(0);
  const [showCount, setShowCount] = React.useState(false);
  const [user, setUser] = React.useState(getWindowEmail());
  const [clientId, setClientId] = React.useState(null);

  function getWindowEmail() {
    return window.localStorage.getItem('user');
  }
  
  function setWindowEmail(email) {
    window.localStorage.setItem('user', email);
    setUser(email);
  }

  function getTotalDoneCount() {
    return data.reduce((total, inclusion) => total + inclusion.done_count, 0);
  }
  function calcProportionDifference(inclusion) {
    let actualProportion = inclusion.done_count / getTotalDoneCount();
    return actualProportion - inclusion.expected_proportion;
  }
  function getOrder() {
    let d = [...data].sort((a, b) => calcProportionDifference(a) - calcProportionDifference(b));
    return d.map(inclusion => inclusion.name);
  }
  function signIn(credentialResponse) {
    let user = jwtDecode(credentialResponse.credential);
    setWindowEmail(user.email);
  }

  React.useEffect(() => {
    if (user) {
      fetch(`/get-data?user=${user}`)
          .then((res) => res.json())
          .then((data) => {
            setData(data.inclusions)
          });
    }
  }, [user, updateCount]);

  React.useEffect(() => {
    fetch("/get-client-id").then((res) => res.json()).then((data) => {
      setClientId(data.client_id);
    });
    window.addEventListener('message', (event) => {
      fetch('/set-data', {
          method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({inclusions: event.data, user: user})
      }).then(() => {
        setUpdateCount(updateCount + 1);
      });

    });
  }, []);

  if (!clientId) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return (
      <GoogleOAuthProvider
      clientId={clientId}
      >
        <GoogleLogin
          onSuccess={signIn}
          onError={error => console.log(error)}
          useOneTap
          auto_select
        />
      </GoogleOAuthProvider>)
    }
  
  return (
    <GoogleOAuthProvider
    clientId={clientId}
    >
    <div className="App">
    {data ? 
    <div>
    <div id="list">
      {getOrder().map(inclusion => 
        <Item 
        key={inclusion}
        text={inclusion}
        done_count={data.find(inclusionObj => inclusionObj.name === inclusion).done_count}
        show_count = {showCount}
        update={() => setUpdateCount(updateCount + 1)}
        user={user}/>
      )}
    </div>
    <button onClick={() => setShowCount(!showCount)}>Toggle Count Visibility</button>
    </div> 
    :
    <iframe src='./subjectiveSort/index.html' />
    }
    </div>
    </GoogleOAuthProvider>
  );
}

export default App;