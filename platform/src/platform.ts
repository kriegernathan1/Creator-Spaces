import express from "express";
import postRouter from "./services/post/postService";
import userRouter from "./services/user/userService";
import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PLATFORM_PORT;

const conString = process.env.DEV_POSTGRESQL_DB_CONN_URL;
const client = new Client(conString);
client.connect();

client.query("SELECT * FROM hellonode").then((res) => {
  console.log(res.rows[0].message);
});

app.use("/user-service", userRouter);
app.use("/post-service", postRouter);

app.listen(PORT, () => {
  console.log(`Lisening on port ${PORT}`);
});
