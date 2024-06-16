import { app } from "./routing";

const PORT = process.env.PLATFORM_PORT;

app.listen(PORT, () => {
  console.log(`Lisening on port ${PORT}`);
});
