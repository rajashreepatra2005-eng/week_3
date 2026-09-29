import express from "express";
import {
  PrismaClient,
  TransactionStatus,
  TransactionType
} from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Create Transaction
router.post("/", async (req, res) => {
  try {
    const {
      accountId,
      userId,
      type,
      amount,
      currency,
      reference,
      description,
      status,
    } = req.body;

    const transaction = await prisma.transaction.create({
      data: {
        accountId,
        userId,
        type: type as TransactionType,
        amount,
        currency: currency || "INR",
        reference,
        description,
        status: status
          ? (status as TransactionStatus)
          : TransactionStatus.PENDING,
      },
    });

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create transaction",
    });
  }
});

// Get all Transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        account: true,
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
    });
  }
});

// Get Transaction by ID
router.get(":id", async (req, res) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        account: true,
        user: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction",
    });
  }
});

// Update Transaction Status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const transaction = await prisma.transaction.update({
      where: {
        id: req.params.id,
      },
      data: {
        status: status as TransactionStatus,
      },
    });

    res.json({
      success: true,
      message: "Transaction status updated successfully",
      transaction,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update transaction status",
    });
  }
});

// Delete Transaction
router.delete("/:id", async (req, res) => {
  try {
    await prisma.transaction.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete transaction",
    });
  }
});

export default router;