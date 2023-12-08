const sqlite3 = require("sqlite3");
const express = require("express");
const app = express();

app.use(express.static(__dirname));

const port = 3000;

const db = new sqlite3.Database("spaces.db", sqlite3.OPEN_READWRITE);

const subdomainToFeMap = new Map();
(function createMapping() {
  {
    db.all("SELECT * FROM spaces", [], (err, rows) => {
      rows.forEach((row) =>
        subdomainToFeMap.set(row.subdomain, row.feEntryPoint)
      );
    });
  }
})();

/**
 *
 * @param {URL} url
 */
function getSubdomain(url) {
  return url.host.split(".")[0];
}

app.get("/", (req, res) => {
  const fullUrl = new URL(
    req.protocol + "://" + req.get("host") + req.originalUrl
  );
  const subdomain = getSubdomain(fullUrl);
  const entryPoint = subdomainToFeMap.get(subdomain);

  if (entryPoint) {
    const path = __dirname + entryPoint;
    res.sendFile(path);
  } else {
    res.send("Unable to resolve subdomain");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
