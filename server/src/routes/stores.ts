import express from "express";
import { prisma } from "../index";
import { AuthRequest } from "../middlewares";

const router = express.Router();

router.get("/", async (req: AuthRequest, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { address: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            ratings: true,
          },
        },
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: "desc" },
    });

    // Calculate average ratings and include user's rating
    const storesWithRatings = stores.map((store) => {
      const ratings = store.ratings;
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating.value, 0) /
            ratings.length
          : 0;

      const userRating = req.user
        ? ratings.find((r) => r.userId === req.user!.id)
        : null;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner: store.owner,
        overallRating: Math.round(averageRating * 10) / 10,
        totalRatings: store._count.ratings,
        userRating: userRating ? userRating.value : null,
        createdAt: store.createdAt,
      };
    });

    const total = await prisma.store.count({ where });

    res.json({
      stores: storesWithRatings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { name, email, address, ownerId } = req.body;

    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!owner) {
      return res.status(404).json({ error: "Owner not found" });
    }

    if (owner.role !== "STORE_OWNER") {
      return res
        .status(403)
        .json({ error: "Only store owners can create stores" });
    }

    const existingStore = await prisma.store.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingStore) {
      return res.status(400).json({ error: "Store email already exists" });
    }

    const existingOwnerStore = await prisma.store.findUnique({
      where: { ownerId },
    });

    if (existingOwnerStore) {
      return res.status(400).json({ error: "Owner already has a store" });
    }

    const store = await prisma.store.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        address: address.trim(),
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Store created successfully",
      store,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
