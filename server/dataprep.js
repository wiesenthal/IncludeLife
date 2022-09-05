const fs = require("fs");
const path = require("path");

const inclusions = fs.readFileSync(
    path.resolve(__dirname, "inclusions.txt"),
    "utf8"
).split("\n");
const frequencies = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, "frequencies.txt"),
    "utf8"
));

function get_inclusions() {
    let inclusionObjects = [];

    alpha = 0.8;

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

function save_frequencies(inclusionObjects) {
    let freqs = {};
    for (let i = 0; i < inclusionObjects.length; i++) {
        freqs[inclusionObjects[i].name]=inclusionObjects[i].done_count;
    }
    fs.writeFileSync(
        path.resolve(__dirname, "frequencies.txt"),
        JSON.stringify(freqs)
    );
}


module.exports = { get_inclusions, save_frequencies };