// server/index.js

const express = require("express");
const bp = require("body-parser");
const path = require("path");
const dataprep = require("./dataprep.js");
require('env2')('config.env');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.static(path.resolve(__dirname, "../client/build")));

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));


app.get("/get-data", (req, res) => {
    user = req.query.user;
    dataprep.get_inclusions(user).then((result) => {
        res.json({"inclusions": result});
    });
});

app.get("/get-client-id", (req, res) => {
    res.json({"client_id": process.env.CLIENTID})
});

app.post("/inclusion-done", (req, res) => {
    body = req.body;
    inclusion = body.inclusion_name;
    user = body.user;
    console.log("inclusion done", inclusion);
    dataprep.increment_frequency(user, inclusion);
    res.json({"success": true});
});

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});