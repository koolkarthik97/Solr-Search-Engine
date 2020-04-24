const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const request = require("request");
const lodash = require("lodash");
const readline = require("readline");
const fs = require("fs");
const rfs = fs.readFileSync;
var SolrNode = require("solr-node");

const PORT = 8081;
const app = express();

let corpus = {};
let N = -1;
let ALPHABETS = "abcdefghijklmnopqrstuvwxyz".split("");
const tokenize = (text) => text.toLowerCase().match(/[a-z]+/g);
const frequencinize = (freqs, token) => {
  freqs[token] = (freqs[token] || 0) + 1;
  return freqs;
};
const load = (text) => {
  corpus = tokenize(text).reduce(frequencinize, {});
  N = Object.keys(corpus).reduce((sum, word) => (sum += corpus[word]), 0);
};
const loadFile = (filepath) =>
  load(rfs(filepath, { encoding: "utf-8" }).toString());

console.log("loading file");
loadFile("/Users/karthik/Desktop/React_csci571/solr-client/src/big.txt");

require("log4js").getLogger("solr-node").level = "DEBUG";
var client = new SolrNode({
  host: "localhost",
  port: "8983",
  core: "myexample",
  protocol: "http",
});

app.use(bodyParser.json());

app.use(cors());

function loadCsv(id) {
  readInterface.on("line", function (line) {
    var parts = line.split(",");
    var key =
      "/Users/karthik/Downloads/solr-7.7.2/solr/LATIMES/latimes/" + parts[0];
    if (key == id) return parts[1];
  });
  return "";
}
app.get("/search", function (req, res) {
  const engine = req.query.engine;
  const query = req.query.query;

  var data = [];

  console.log(engine, query);

  let search_query;
  if (engine == "lucene")
    search_query = client
      .query()
      .q(query.toLowerCase())
      .addParams({
        wt: "json",
        indent: true,
      })
      .start(0)
      .rows(10);
  else
    search_query = client
      .query()
      .q(query.toLowerCase())
      .addParams({
        wt: "json",
        indent: true,
      })
      .sort({ pageRankFile: "desc" })
      .start(0)
      .rows(10);

  client.search(search_query, function (err, result) {
    if (err) {
      console.log(err);
      return;
    }
    var arr = result.response.docs;

    arr.forEach((element) => {
      var obj = {
        id: lodash.get(element, "id"),
        description: "",
        url: "",
        title: lodash.get(element, "title.0"),
      };
      obj.description = element.og_description
        ? element.og_description[0]
        : "N/A";
      obj.url = element.og_url ? element.og_url[0] : "";
      if (obj.url.length === 0) {
        obj.url = loadCsv(obj.id);
      }
      data.push(obj);
    });
    //console.log(data);
    res.send(data);
  });
});

app.get("/correct", function (req, res) {
  let inp = req.query.input;
  const clean = () => {
    corpus = {};
    N = -1;
  };

  const corpusSize = () => N;

  const pairify = (w, i) => [w.slice(0, i), w.slice(i)];
  const splitter = (word) =>
    Array(word.length + 1)
      .fill(word)
      .map(pairify);
  const inFreqSet = (freqs, word) => !!freqs[word];

  const _byLength = (len) => ([a, b]) => b.length > len;

  const edit1 = (word) => {
    let pairs = splitter(word);

    let deletes = pairs.filter(_byLength(0)).map(([a, b]) => a + b.slice(1));

    let transposes = pairs
      .filter(_byLength(1))
      .map(([a, b]) => a + b[1] + b[0] + b.slice(2));

    let replaces = flatten(
      pairs.map(([a, b]) => ALPHABETS.map((c) => a + c + b.slice(1)))
    );

    let inserts = flatten(
      pairs.map(([a, b]) => ALPHABETS.map((c) => a + c + b))
    );
    return Array.from(
      new Set(deletes.concat(transposes).concat(replaces).concat(inserts))
    );
  };

  const edit2 = (word) =>
    Array.from(
      new Set(flatten(edit1(word).map((e1) => edit1(e1).map((e2) => e2))))
    );

  const known = (words) =>
    Array.from(new Set(words.filter(curry(inFreqSet, corpus))));

  const candidates = (word) => {
    let c = known([word]);
    if (c.length > 0) return c;

    c = known(edit1(word));
    if (c.length > 0) return c;

    c = known(edit2(word));
    if (c.length > 0) return c;

    return [word];
  };

  const smoothers = {
    additive: (word) => (corpus[word] + 1) / (N + 1),
  };

  const _suggest = (word, smoother) =>
    candidates(word)
      .map((s) => ({ suggestion: s, count: corpus[s], P: smoother(s) }))
      .sort((a, b) => b.P - a.P);

  const suggest = (word, opts) => {
    opts = opts || {};
    opts.top = opts.top || 1;
    opts.includeProb =
      opts.includeProb === undefined ? false : opts.includeProb;
    opts.smoother = opts.smoother || smoothers.additive;

    let answers = _suggest(word, opts.smoother);
    if (!opts.includeProb) answers = answers.map((a) => a.suggestion);
    return answers.slice(0, opts.top);
  };

  const flatten = (ary) => Array.prototype.concat(...ary);

  const curry = (fn, ...args) => (...nArgs) => {
    if (fn.length <= args.length + nArgs.length)
      return fn.apply(this, [...args, ...nArgs]);
    return curry(fn, ...[...args, ...nArgs]);
  };

  const datum = suggest(inp, { top: 1 });
  console.log(datum);
  res.send(datum[0]);
});

app.listen(PORT, function () {});
