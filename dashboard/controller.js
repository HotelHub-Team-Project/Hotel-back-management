// dashboard/controller.js

import { successResponse, errorResponse } from "../common/response.js";
import { getAdminDashboardSummary, getOwnerDashboardSummary } from "./service.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const data = await getAdminDashboardSummary();

    return res
      .status(200)
      .json(successResponse(data, "ADMIN_DASHBOARD_SUMMARY", 200));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(errorResponse(err.message || "ADMIN_DASHBOARD_FAILED", 500));
  }
};

// ⬇⬇ dashboard/controller.js 맨 아래에 이 블럭 통째로 추가 ⬇⬇
export const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id; // 토큰에서 온 유저 id (owner)

    const data = await getOwnerDashboardSummary(ownerId);

    return res
      .status(200)
      .json(successResponse(data, "OWNER_DASHBOARD_SUMMARY", 200));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(errorResponse(err.message || "OWNER_DASHBOARD_FAILED", 500));
  }
};
// ⬆⬆ dashboard/controller.js 여기에까지 추가 ⬆⬆
