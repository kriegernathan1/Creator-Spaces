import { Request, Response, Router } from "express";

const postRouter = Router({ mergeParams: true });

postRouter.get("/posts", (req: Request, res: Response) => {
  res.send("get all posts");
});

postRouter.get("/post/:id", (req: Request, res: Response) => {
  res.send(`get post id ${req.params.id}`);
});

export default postRouter;
