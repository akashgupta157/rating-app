import express from "express";
import { AuthRequest } from "../middlewares";
import { prisma } from "../index";

const router = express.Router();

router.post("/", async (req: AuthRequest, res) => {
  try {
    const { storeId, value } = req.body;

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    if (store.ownerId === req.user!.id) {
      return res.status(400).json({ error: "Cannot rate your own store" });
    }

    const rating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId: req.user!.id,
          storeId,
        },
      },
      update: {
        value,
      },
      create: {
        value,
        userId: req.user!.id,
        storeId,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      message: "Rating submitted successfully",
      rating,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
