import { z } from "zod";
import { disposeServices } from "./internal-services/ServiceManager";
import { app } from "./routing";

const PORT =
  process.env.ENV === "DEV"
    ? process.env.PLATFORM_PORT
    : process.env.TESTING_PORT;

export const server = app.listen(PORT, () => {
  console.log(`Lisening on port ${PORT}`);
});

server.on("close", () => {
  disposeServices();
});
