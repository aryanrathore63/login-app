import "dotenv/config";
import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth";
import checkoutRoutes from "./routes/checkout";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", authRoutes);
app.use("/api", checkoutRoutes);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => console.log(`API listening on :${port}`));
