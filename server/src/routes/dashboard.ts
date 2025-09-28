import express from "express";
import { prisma } from "../index";
import { AuthRequest } from "../middlewares";

const router = express.Router();

router.get("/stats", async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied" });
    }
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    res.json({
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/store-owner", async (req: AuthRequest, res, next) => {
  try {
    if (req.user?.role !== "STORE_OWNER") {
      return res.status(403).json({ error: "Access denied" });
    }
    const store = await prisma.store.findUnique({
      where: { ownerId: req.user!.id },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            ratings: true,
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({ error: "No store found for this user" });
    }

    const averageRating =
      store.ratings.length > 0
        ? store.ratings.reduce((sum, rating) => sum + rating.value, 0) /
          store.ratings.length
        : 0;

    res.json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: store._count.ratings,
      },
      recentRatings: store.ratings.slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
