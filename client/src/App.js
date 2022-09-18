// client/src/App.js

import React from "react";
import logo from "./logo.svg";
import "./App.css";

function Item(props) {
  const [checked, setChecked] = React.useState(false);
  function check() {
    console.log("checked", checked);
    if (!checked) {
      fetch("/inclusion-done", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({inclusion_name: props.text})
      }).then(() => {
        props.update();
        setTimeout(() => {setChecked(false)}, 1000);
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
  React.useEffect(() => {
    fetch("/get-data")
        .then((res) => res.json())
        .then((data) => {
          setData(data.inclusions)
        });
  }, [updateCount]);
  if (!data) {
    return <div>Loading...</div>;
  }
  console.log(data);

  return (
    <div className="App">
      <div id="list">
        {getOrder().map(inclusion => 
          <Item 
          key={inclusion}
          text={inclusion}
          done_count={data.find(inclusionObj => inclusionObj.name === inclusion).done_count}
          show_count = {showCount}
          update={() => setUpdateCount(updateCount + 1)}/>
        )}
      </div>
      <button onClick={() => setShowCount(!showCount)}>Toggle Count Visibility</button>
    </div>
  );
}

export default App;