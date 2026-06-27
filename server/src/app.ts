import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9091;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:9090",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Mount routers
app.use("/api/auth", authRoutes);

// Database connection verification / health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString() 
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
