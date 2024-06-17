import request from "supertest";
import { z } from "zod";
import { HttpStatusCode } from "../../enums/ResponseCodes";
import {
  JwtPayload,
  SecurityService,
} from "../../internal-services/Security/SecurityService";
import {
  RedactedUser,
  RedactedUserSchema,
  SigninFields,
} from "../../internal-services/User/UserService";
import { DataResponse } from "../../models/Responses/Response";
import { ErrorResponse } from "../../models/Responses/errorResponse";
import { app } from "../../routing";
import { server } from "../../server";
import { Services } from "../../services";
import { getEndpointUrl } from "../helpers/helpers";
import {
  BaseResponseSchema,
  ErrorResponseSchema,
  SuccessfulSigninResponseSchema,
} from "../helpers/responses.schema";

afterAll(() => {
  server.close();
});

const getUrl = (endpointPath: string) => {
  const SERVICE_URL_PREFIX = Services.User.path;
  return getEndpointUrl(SERVICE_URL_PREFIX, endpointPath);
};

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
    it("Should return a new JWT token to a logged in user with valid JWT", async () => {
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

    it("Should reject an expired JWT token", async () => {
      const expiredJWT = new SecurityService({}).generateJwt(
        {
          userId: "1234",
          namespace: "platform",
          role: "platform_admin",
        } as JwtPayload,
        "0",
      );

      const res = await request(app)
        .get("/user-service/user/refreshToken")
        .set("Authorization", `Bearer ${expiredJWT}`);

      expect(ErrorResponseSchema.safeParse(res.body).success).toBeTruthy();
    });

    it("Should reject a missing JWT token", async () => {
      const res = await request(app).get("/user-service/user/refreshToken");

      expect(ErrorResponseSchema.safeParse(res.body).success).toBeTruthy();
    });
  });

  describe("Fetch Users", () => {
    it("Should allow authenticated user with permissions to fetch users", async () => {
      const freshJwt = new SecurityService({}).generateJwt({
        userId: "1234",
        namespace: "platform",
        role: "platform_admin",
      } as JwtPayload);

      const res = await request(app)
        .get("/user-service/users")
        .set("Authorization", `Bearer ${freshJwt}`);

      const dataResponseSchema = BaseResponseSchema.extend({
        data: z.array(RedactedUserSchema),
      });

      expect(dataResponseSchema.safeParse(res.body).success).toBe(true);
      expect((res.body as DataResponse<RedactedUser[]>).data).toBeDefined();
    });
  });
});
