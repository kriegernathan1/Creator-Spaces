import { Request, Response, Router } from "express";

const userRouter = Router({ mergeParams: true });

userRouter.get("/users", (req: Request, res: Response) => {
  res.send("get all users");
});

userRouter.get("/:id", (req: Request, res: Response) => {
  res.send(`get user id ${req.params.id}`);
});

userRouter.get("*", (req: Request, res: Response) => {
  res.send("got to user fallback route");
});

export default userRouter;
