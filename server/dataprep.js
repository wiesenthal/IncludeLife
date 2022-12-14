const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");
require('env2')('config.env');
const DB_URL = process.env.MONGODB_URI;

const client = new MongoClient(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
// connect to the database, logging success or failure
client.connect(err => {
    if (err) {
        console.log("Error connecting to database", err);
    } else {
        console.log("Connected to database");
    }
});

// get database
const db = client.db("life");
const inclusion_collection = db.collection("inclusions");
const frequencies_collection = db.collection("frequencies");

const frequencies = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, "frequencies.txt"),
    "utf8"
));

async function has_user(user) {
    let result = await inclusion_collection.findOne({"_user":user});
    return result != null;
}

async function load_inclusions(user) {
    let inclusions = await inclusion_collection.findOne({"_user":user}).then((result) => {
        return result.sorted_inclusions;
    });
    return inclusions;
}
async function load_frequencies(user) {
    let frequencies = await frequencies_collection.findOne({"_user":user}).then((result) => {
        if (result == null) {
            return {};
        }
        delete result._id;
        delete result._user;
        return result;
    });
    return frequencies;
}

async function set_inclusions(user, inclusions) {
    inclusion_collection.updateOne({"_user":user}, {$set: {"sorted_inclusions": inclusions}}, {upsert: true});
}

async function get_inclusions(user, alpha=0.9) {
    if (!await has_user(user)) {
        return null;
    }
    let inclusions = await load_inclusions(user);
    let frequencies = await load_frequencies(user);
    
    let inclusionObjects = [];

    total = 0;
    zipfs = [];
    for (let i = 0; i < inclusions.length; i++) {
        let zipf = 1 / (i + 1)**alpha;
        zipfs.push(zipf);
        total += zipf;
    }
    
    expected_proportions = zipfs.map(zipf => zipf / total);

    for (let i = 0; i < inclusions.length; i++) {
        inclusions[i] = inclusions[i].trim();
        inclusionObjects.push({
            name: inclusions[i],
            expected_proportion: expected_proportions[i],
            done_count : inclusions[i] in frequencies ? frequencies[inclusions[i]] : 0,
        });
    }
    return inclusionObjects;
}

async function increment_frequency(user, inclusion) {
    let frequencies = await load_frequencies(user);
    if (inclusion in frequencies) {
        frequencies[inclusion] += 1;
    } else {
        frequencies[inclusion] = 1;
    }
    frequencies_collection.updateOne({"_user":user}, {$set: frequencies}, {upsert: true});

}



module.exports = { get_inclusions, increment_frequency, set_inclusions };