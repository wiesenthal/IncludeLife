// server/index.js

const express = require("express");
const bp = require("body-parser");
const path = require("path");
const dataprep = require("./dataprep.js");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.static(path.resolve(__dirname, "../client/build")));

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));


app.get("/get-data", (req, res) => {
    dataprep.get_inclusions().then((result) => {
        res.json({"inclusions": result});
    });
});

app.post("/inclusion-done", (req, res) => {
    inclusion = req.body.inclusion_name;
    console.log("inclusion done", inclusion);
    dataprep.increment_frequency(inclusion);
    /*
    inclusionObjects.find(inclusionObject => inclusionObject.name === inclusion).done_count += 1;
    dataprep.save_frequencies(inclusionObjects);
    */
    res.json({"success": true});
});

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});