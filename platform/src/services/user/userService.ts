import { Request, Response, Router } from "express";
import { userService } from "../../internal-services/ServiceManager";

const userRouter = Router({ mergeParams: true });

userRouter.post("/signup", async (req: Request, res: Response) => {
  const signupRes = await userService.signup(req.body);
  res.json(signupRes);
});

export default userRouter;
