import { Request, Response, Router } from "express";
import { userService } from "../../internal-services/ServiceManager";

const userRouter = Router({ mergeParams: true });

userRouter.post("/signup", async (req: Request, res: Response) => {
  res.json(await userService.signup(req.body));
});

userRouter.post("/signin", async (req: Request, res: Response) => {
  res.json(await userService.signin(req.body));
});

export default userRouter;
