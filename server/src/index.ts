import cors from "cors";
import helmet from "helmet";
import { authenticate } from "./middlewares";
import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";
import { withAccelerate } from "@prisma/extension-accelerate";

const app = express();

export const prisma = new PrismaClient().$extends(withAccelerate());

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  return res.send("Express Typescript on Vercel");
});

app.use("/auth", require("./routes/auth").default);
app.use("/user", authenticate, require("./routes/user").default);
app.use("/stores", authenticate, require("./routes/stores").default);
app.use("/ratings", authenticate, require("./routes/ratings").default);
app.use("/dashboard", authenticate, require("./routes/dashboard").default);

app.listen(process.env.PORT || 3000, () => {
  return console.log(`Server is listening on 3000`);
});
