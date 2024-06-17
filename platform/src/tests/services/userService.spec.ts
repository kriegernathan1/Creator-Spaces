import { HttpStatusCode } from "../../enums/ResponseCodes";
import { disposeServices } from "../../internal-services/ServiceManager";
import { app } from "../../routing";
import request from "supertest";
import { server } from "../../server";
import { SigninFields } from "../../internal-services/User/UserService";
import {
  ErrorResponseSchema,
  SuccessfulSigninResponseSchema,
} from "../helpers/responses.schema";
import { ErrorResponse } from "../../models/Responses/errorResponse";
import {
  JwtPayload,
  JwtToken,
  SecurityService,
} from "../../internal-services/Security/SecurityService";
import {
  SigninResponse,
  SuccessfulSigninResponse,
} from "../../models/Responses/UserResponses";

afterAll(() => {
  server.close();
});

describe("User Service", () => {
  describe("Login", () => {
    it("Should login user with correct credentials and return token", async () => {
      const body: SigninFields = {
        email: "me@email.com",
        password: "password1",
      };
      const res = await request(app)
        .post("/user-service/signin")
        .send(body)
        .set("Accept", "application/json");
      expect(res.statusCode).toEqual(HttpStatusCode.Ok);
      expect(
        SuccessfulSigninResponseSchema.safeParse(res.body).success,
      ).toBeTruthy();
    });

    it("Should reject login with incorret password", async () => {
      const body: SigninFields = {
        email: "me@email.com",
        password: "incorrectPassword",
      };

      const res = await request(app)
        .post("/user-service/signin")
        .send(body)
        .set("Accept", "application/json");
      expect(res.statusCode).toEqual(HttpStatusCode.Unauthorized);
    });

    it("Should not reveal if user identifier exists or not", async () => {
      const body: SigninFields = {
        email: "incorrectEmail@email.com",
        password: "password1",
      };

      const res = await request(app)
        .post("/user-service/signin")
        .send(body)
        .set("Accept", "application/json");

      // Purposely duplicated from Response messages to ensure any change will
      // be reviewed with this test requirement
      const duplicatedSecureMessage =
        "Unable to login with that email and password combination";

      expect(ErrorResponseSchema.safeParse(res.body).success).toBeTruthy();
      expect((res.body as ErrorResponse).error.message).toEqual(
        duplicatedSecureMessage,
      );
    });
  });

  describe("Refresh Token", () => {
    it("should return a new JWT token to a logged in user with valid JWT", async () => {
      const freshJwt = new SecurityService({}).generateJwt({
        userId: "1234",
        namespace: "platform",
        role: "platform_admin",
      } as JwtPayload);

      const res = await request(app)
        .get("/user-service/user/refreshToken")
        .set("Authorization", `Bearer ${freshJwt}`);

      expect(
        SuccessfulSigninResponseSchema.safeParse(res.body).success,
      ).toBeTruthy();
    });
  });
});
