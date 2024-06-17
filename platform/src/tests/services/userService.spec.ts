import { HttpStatusCode } from "../../enums/ResponseCodes";
import { disposeServices } from "../../internal-services/ServiceManager";
import { app } from "../../routing";
import request from "supertest";
import { server } from "../../server";
import { SigninFields } from "../../internal-services/User/UserService";

afterAll(() => {
  server.close();
});

describe("User Service", () => {
  describe("Login", () => {
    it("Should login user with correct email and password", async () => {
      const body: SigninFields = {
        email: "me@email.com",
        password: "password1",
      };
      const req = await request(app)
        .post("/user-service/signin")
        .send(body)
        .set("Accept", "application/json");
      expect(req.statusCode).toEqual(HttpStatusCode.Ok);
    });

    it("Should reject login with incorret password", async () => {
      const body: SigninFields = {
        email: "me@email.com",
        password: "incorrectPassword",
      };

      const req = await request(app)
        .post("/user-service/signin")
        .send(body)
        .set("Accept", "application/json");
      expect(req.statusCode).toEqual(HttpStatusCode.Unauthorized);
    });
  });
});
