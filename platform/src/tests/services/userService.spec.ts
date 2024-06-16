import { HttpStatusCode } from "../../enums/ResponseCodes";
import { disposeServices } from "../../internal-services/ServiceManager";
import { app } from "../../routing";
import request from "supertest";
import { server } from "../../server";

afterAll(() => {
  server.close();
});

describe("Test login", () => {
  it("should successfully login user", async () => {
    const body = {
      email: "me@email.com",
      password: "password1",
    };
    const req = await request(app)
      .post("/user-service/signin")
      .send(body)
      .set("Accept", "application/json");
    expect(req.statusCode).toEqual(HttpStatusCode.Ok);
  });
});
