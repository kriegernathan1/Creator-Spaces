const express = require("express");
const app = express();
const PORT = 3000;

app.use("/user", require("./services/user/userService"));
app.use("/post", require("./services/post/postService"));

app.listen(PORT, () => {
  console.log(`Lisening on port ${PORT}`);
});
