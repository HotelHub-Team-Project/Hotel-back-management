// dashboard/route.js

import { Router } from "express";
import { verifyToken } from "../common/authmiddleware.js";
import requireRole from "../common/rolemiddleware.js";
import { getAdminDashboard, getOwnerDashboard } from "./controller.js";

const router = Router();

// 관리자 대시보드 요약
router.get(
  "/admin",
  verifyToken,
  requireRole("admin"),
  getAdminDashboard
);

router.get(
  "/owner",
  verifyToken,
  requireRole("owner"),
  getOwnerDashboard
);

export default router;
