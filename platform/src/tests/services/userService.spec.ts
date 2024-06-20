import request from "supertest";
import { z } from "zod";
import { HttpStatusCode } from "../../enums/ResponseCodes";
import { DatabaseService } from "../../internal-services/Database/DatabaseService";
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
import { UserRepository } from "../../repositories/UserRepository";
import { app } from "../../routing";
import { server } from "../../server";
import { Services } from "../../services";
import { userServiceEndpoints } from "../../services/user";
import { getEndpointUrl, getGenericUser } from "../helpers/helpers";
import {
  BaseResponseSchema,
  ErrorResponseSchema,
  SuccessfulSigninResponseSchema,
} from "../helpers/responses.schema";
import { NewUser } from "../../internal-services/Database/types";
import {
  setupServices,
  userService,
  userRepository,
  securityService,
  databaseService,
} from "../../internal-services/ServiceManager";

afterAll(() => {
  server.close();
});

const getUrl = (endpointPath: string) => {
  const SERVICE_URL_PREFIX = Services.User.path;
  return getEndpointUrl(SERVICE_URL_PREFIX, endpointPath);
};

const { signin, refreshToken, fetchUsers, fetchUser, createUser, deleteUser } =
  userServiceEndpoints;

describe("User Service", () => {
  let namespace = "platform";

  beforeAll(async () => {
    setupServices();
    await userRepository.clearTable();
  });

  afterAll(async () => {
    await userRepository.clearTable();
    await databaseService.destroyConnectionPool();
  });

  describe("Login", () => {
    it("Should login user with correct credentials and return token", async () => {
      const user = getGenericUser();
      const plainPassword = user.password;
      user.password = await securityService.hashPassword(user.password);
      await userRepository.addUser(user);

      const body: SigninFields = {
        email: user.email,
        password: plainPassword,
      };
      const res = await request(app)
        .post(getUrl(signin.path))
        .send(body)
        .set("Accept", "application/json");
      expect(res.statusCode).toEqual(HttpStatusCode.Ok);
      expect(
        SuccessfulSigninResponseSchema.safeParse(res.body).success,
      ).toBeTruthy();

      await userRepository.deleteUser(user.id!, user.namespace);
    });

    it("Should reject login with incorrect password", async () => {
      const body: SigninFields = {
        email: "me@email.com",
        password: "incorrectPassword",
      };

      const res = await request(app)
        .post(getUrl(signin.path))
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
        .post(getUrl(signin.path))
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
      expect(res.statusCode).toBe(HttpStatusCode.Unauthorized);
    });
  });

  describe("Refresh Token", () => {
    it("Should return a new JWT token to a logged in user with valid JWT", async () => {
      const freshJwt = securityService.generateJwt({
        userId: "1234",
        namespace: "platform",
        role: "platform_admin",
      } as JwtPayload);

      const res = await request(app)
        .get(getUrl(refreshToken.path))
        .set("Authorization", `Bearer ${freshJwt}`);

      expect(
        SuccessfulSigninResponseSchema.safeParse(res.body).success,
      ).toBeTruthy();
    });

    it("Should reject an expired JWT token", async () => {
      const expiredJWT = securityService.generateJwt(
        {
          userId: "1234",
          namespace: "platform",
          role: "platform_admin",
        } as JwtPayload,
        "0",
      );

      const res = await request(app)
        .get(getUrl(refreshToken.path))
        .set("Authorization", `Bearer ${expiredJWT}`);

      expect(ErrorResponseSchema.safeParse(res.body).success).toBeTruthy();
      expect(res.statusCode).toBe(HttpStatusCode.Unauthorized);
    });

    it("Should reject a missing JWT token", async () => {
      const res = await request(app).get(getUrl(refreshToken.path));
      expect(ErrorResponseSchema.safeParse(res.body).success).toBeTruthy();
      expect(res.statusCode).toBe(HttpStatusCode.Unauthorized);
    });
  });

  describe("Fetch Users", () => {
    it("Should allow authenticated user with permissions to fetch users", async () => {
      const user = {
        id: "1234",
        email: "user@email.com",
        first_name: "John",
        last_name: "Doe",
        namespace,
        password: "password",
        role: "platform_admin",
      } satisfies NewUser;
      userRepository.addUser(user);

      const freshJwt = new SecurityService({}).generateJwt({
        userId: user.id,
        namespace: user.namespace,
        role: user.role,
      } as JwtPayload);

      const res = await request(app)
        .get(getUrl(fetchUsers.path))
        .set("Authorization", `Bearer ${freshJwt}`);

      const dataResponseSchema = BaseResponseSchema.extend({
        data: z.array(RedactedUserSchema),
      });

      expect(dataResponseSchema.safeParse(res.body).success).toBe(true);
      expect((res.body as DataResponse<RedactedUser[]>).data).toBeDefined();
      expect(res.statusCode).toBe(HttpStatusCode.Ok);

      userRepository.deleteUser(user.id!, user.namespace);
    });

    it("Should reject unauthenticated user", async () => {
      const res = await request(app).get(getUrl(fetchUsers.path));
      expect(ErrorResponseSchema.safeParse(res.body).success).toBe(true);
      expect(res.statusCode).toBe(HttpStatusCode.Unauthorized);
    });
  });

  describe("Fetch user", () => {
    let baseUserId = "1234";
    let platformAdminUserId = "4321";

    beforeEach(async () => {
      await userRepository.addUser({
        email: "user@email.com",
        first_name: "John",
        last_name: "Doe",
        namespace: namespace,
        password: "fake",
        role: "user",
        id: baseUserId,
      });
      await userRepository.addUser({
        email: "user@email.com",
        first_name: "John",
        last_name: "Doe",
        namespace: "platform",
        password: "test",
        role: "platform_admin",
        id: platformAdminUserId,
      });
    });

    afterEach(async () => {
      await userRepository.deleteUser(baseUserId, namespace);
      await userRepository.deleteUser(platformAdminUserId, namespace);
    });

    it("Should allow authenticated user to fetch self", async () => {
      const payload = {
        userId: baseUserId,
        namespace: "platform",
        role: "user",
      } as JwtPayload;
      const freshJwt = new SecurityService({}).generateJwt(payload);

      const res = await request(app)
        .get(
          getUrl(fetchUser.path).replace(
            ":" + fetchUser.routeParams[0],
            payload.userId,
          ),
        )
        .set("Authorization", `Bearer ${freshJwt}`);

      const dataResponseSchema = BaseResponseSchema.extend({
        data: RedactedUserSchema,
      });

      expect(dataResponseSchema.safeParse(res.body).success).toBe(true);
    });

    it("Should allow roles with proper permissions to fetch any user", async () => {
      const requestingUserId = "1111";
      const requestingUser = getGenericUser(requestingUserId);
      requestingUser.role = "platform_admin";
      userRepository.addUser(requestingUser);

      const fetchedUserId = "1234";
      const fetchedUser = getGenericUser(fetchedUserId);
      userRepository.addUser(fetchedUser);

      const payload = {
        userId: requestingUserId,
        namespace: requestingUser.namespace,
        role: requestingUser.role,
      } as JwtPayload;
      const freshJwt = new SecurityService({}).generateJwt(payload);

      const res = await request(app)
        .get(
          getUrl(fetchUser.path).replace(
            ":" + fetchUser.routeParams[0],
            fetchedUserId,
          ),
        )
        .set("Authorization", `Bearer ${freshJwt}`);

      const dataResponseSchema = BaseResponseSchema.extend({
        data: RedactedUserSchema,
      });

      expect(dataResponseSchema.safeParse(res.body).success).toBe(true);

      userRepository.deleteUser(requestingUser.id!, requestingUser.namespace);
      userRepository.deleteUser(fetchedUserId, fetchedUser.namespace);
    });

    it("Should reject roles without proper permissions to fetch any user other than self", async () => {
      const requestingUserId = "1111";
      const requestingUser = getGenericUser(requestingUserId);
      requestingUser.role = "user";
      userRepository.addUser(requestingUser);

      const fetchedUserId = "1234";
      const fetchedUser = getGenericUser(fetchedUserId);
      userRepository.addUser(fetchedUser);

      const payload = {
        userId: requestingUserId,
        namespace: requestingUser.namespace,
        role: requestingUser.role,
      } as JwtPayload;
      const freshJwt = new SecurityService({}).generateJwt(payload);

      const res = await request(app)
        .get(
          getUrl(fetchUser.path).replace(
            ":" + fetchUser.routeParams[0],
            fetchedUserId,
          ),
        )
        .set("Authorization", `Bearer ${freshJwt}`);

      expect(ErrorResponseSchema.safeParse(res.body).success).toBe(true);

      userRepository.deleteUser(requestingUser.id!, requestingUser.namespace);
      userRepository.deleteUser(fetchedUserId, fetchedUser.namespace);
    });
  });

  describe("Create user", () => {
    it("Should allow users with proper permissions to create user", async () => {
      const newUser: NewUser = getGenericUser("1234");

      const platformAdminJwt = securityService.generateJwt({
        userId: "1111",
        namespace: "platform",
        role: "platform_admin",
      } as JwtPayload);

      const res = await request(app)
        .post(getUrl(createUser.path))
        .send(newUser)
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${platformAdminJwt}`);

      expect(res.statusCode).toEqual(HttpStatusCode.Created);

      const userFromDB = userRepository.getUserBy("id", newUser.id!);
      expect(userFromDB).toBeDefined();

      await userRepository.deleteUser(newUser.id!, newUser.namespace);
    });

    it("Should reject users without permissions to create users", async () => {
      const newUser: NewUser = getGenericUser("1234");

      const platformAdminJwt = securityService.generateJwt({
        userId: "1111",
        namespace: "platform",
        role: "user",
      } as JwtPayload);

      const res = await request(app)
        .post(getUrl(createUser.path))
        .send(newUser)
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${platformAdminJwt}`);

      expect(res.statusCode).toEqual(HttpStatusCode.Forbidden);
    });
  });
});
