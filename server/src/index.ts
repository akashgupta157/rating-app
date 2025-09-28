import cors from "cors";
import helmet from "helmet";
import { authenticate } from "./middlewares";
import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";
import { withAccelerate } from "@prisma/extension-accelerate";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import storesRoutes from "./routes/stores";
import ratingsRoutes from "./routes/ratings";
import dashboardRoutes from "./routes/dashboard";

const app = express();

export const prisma = new PrismaClient().$extends(withAccelerate());

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  return res.send("Express Typescript on Vercel");
});

app.use("/auth", authRoutes);
app.use("/user", authenticate, userRoutes);
app.use("/stores", authenticate, storesRoutes);
app.use("/ratings", authenticate, ratingsRoutes);
app.use("/dashboard", authenticate, dashboardRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
