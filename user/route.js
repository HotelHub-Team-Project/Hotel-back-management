import { Router } from "express";
import { verifyToken } from "../common/authmiddleware.js";

const router = Router();

// 필요한 user 관련 라우트를 여기에 추가하세요
router.get("/", verifyToken, (req, res) => {
  res.json({ success: true, message: "User routes" });
});

export default router;
