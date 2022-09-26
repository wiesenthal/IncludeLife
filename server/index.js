// server/index.js

const express = require("express");
const bp = require("body-parser");
const path = require("path");
const dataprep = require("./dataprep.js");
require('env2')('config.env');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.static(path.resolve(__dirname, "../client/build")));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested, Content-Type, Accept Authorization"
    )
    if (req.header('x-forwarded-proto') !== 'https')
      res.redirect(`https://${req.header('host')}${req.url}`)
    else
      next()
});

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

app.get("/is_logged_in", (req, res) => {
    user = req.query.user;
    dataprep.has_user(user).then((result) => {
        res.json({"logged_in": result});
    });
});

app.get("/get-data", (req, res) => {
    user = req.query.user;
    dataprep.get_inclusions(user).then((result) => {
        res.json({"inclusions": result});
    });
});

app.get("/get-client-id", (req, res) => {
    res.json({"client_id": process.env.CLIENTID})
});

app.post("/set-data", (req, res) => {
    body = req.body;
    inclusions = body.inclusions;
    user = body.user;
    dataprep.set_inclusions(user, inclusions).then(() => {
        res.json({"success": true});
    });
});

app.post("/inclusion-done", (req, res) => {
    body = req.body;
    inclusion = body.inclusion_name;
    user = body.user;
    console.log("inclusion done", inclusion);
    dataprep.increment_frequency(user, inclusion).then(() => {
        res.json({"success": true});
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});