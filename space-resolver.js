const sqlite3 = require("sqlite3");
const express = require("express");
const app = express();
const port = 3001;

const prebuiltSpaceDstPath = "/prebuilt-space/dist";
app.use(express.static(__dirname + prebuiltSpaceDstPath));

// For prototype we only need to support serving the 'solution-space' that is driven through configuration
app.get("/", (req, res) => {
  res.send(prebuiltSpaceDstPath + "/index.html");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
