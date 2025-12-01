// dashboard/service.js

import Hotel from "../hotel/model.js";
import Reservation from "../reservation/model.js";
import User from "../user/model.js"; // user 모델 경로가 다르면 여기를 맞춰줘야 함
import Room from "../room/model.js";
// 지난 N일 매출 계산
const getRevenueLastDays = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const result = await Reservation.aggregate([
    {
      $match: {
        status: "completed",
        updatedAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalPrice" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (!result.length) {
    return { total: 0, count: 0 };
  }

  return {
    total: result[0].total,
    count: result[0].count,
  };
};

export const getAdminDashboardSummary = async () => {
  const totalHotels = await Hotel.countDocuments({});
  const pendingHotels = await Hotel.countDocuments({ status: "pending" });
  const approvedHotels = await Hotel.countDocuments({ status: "approved" });
  const rejectedHotels = await Hotel.countDocuments({ status: "rejected" });

  const totalReservations = await Reservation.countDocuments({});
  const pendingReservations = await Reservation.countDocuments({ status: "pending" });
  const confirmedReservations = await Reservation.countDocuments({ status: "confirmed" });
  const cancelledReservations = await Reservation.countDocuments({ status: "cancelled" });
  const completedReservations = await Reservation.countDocuments({ status: "completed" });

  const totalUsers = await User.countDocuments({});
  const adminCount = await User.countDocuments({ role: "admin" });
  const ownerCount = await User.countDocuments({ role: "owner" });
  const normalUserCount = await User.countDocuments({ role: "user" }); // role 명이 다르면 여기만 수정

  const last30DaysRevenue = await getRevenueLastDays(30);

  return {
    hotels: {
      total: totalHotels,
      pending: pendingHotels,
      approved: approvedHotels,
      rejected: rejectedHotels,
    },
    reservations: {
      total: totalReservations,
      pending: pendingReservations,
      confirmed: confirmedReservations,
      cancelled: cancelledReservations,
      completed: completedReservations,
    },
    users: {
      total: totalUsers,
      admin: adminCount,
      owner: ownerCount,
      user: normalUserCount,
    },
    revenue: {
      last30DaysTotal: last30DaysRevenue.total,
      last30DaysCount: last30DaysRevenue.count,
    },
  };
};

// ⬇⬇ dashboard/service.js 맨 아래에 이 블럭 통째로 추가 ⬇⬇
export const getOwnerDashboardSummary = async (ownerId) => {
  // 1) 내가 가진 호텔들 찾기
  const hotels = await Hotel.find({ owner: ownerId }).select("_id status");
  const hotelIds = hotels.map((h) => h._id);

  // 호텔이 하나도 없으면 바로 0 리턴
  if (hotelIds.length === 0) {
    return {
      hotels: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      },
      rooms: {
        total: 0,
        active: 0,
        inactive: 0,
      },
      reservations: {
        total: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        completed: 0,
      },
      revenue: {
        last30DaysTotal: 0,
        last30DaysCount: 0,
      },
    };
  }

  // 2) 호텔 카운트 (상태별)
  const totalHotels = hotels.length;
  const pendingHotels = hotels.filter((h) => h.status === "pending").length;
  const approvedHotels = hotels.filter((h) => h.status === "approved").length;
  const rejectedHotels = hotels.filter((h) => h.status === "rejected").length;

  // 3) 룸 카운트 (내 호텔에 속한 룸들만)
  const [totalRooms, activeRooms, inactiveRooms] = await Promise.all([
    Room.countDocuments({ hotel: { $in: hotelIds } }),
    Room.countDocuments({ hotel: { $in: hotelIds }, status: "active" }),
    Room.countDocuments({ hotel: { $in: hotelIds }, status: "inactive" }),
  ]);

  // 4) 예약 카운트 (내 호텔들에 대한 예약만)
  const [
    totalReservations,
    pendingReservations,
    confirmedReservations,
    cancelledReservations,
    completedReservations,
  ] = await Promise.all([
    Reservation.countDocuments({ hotelId: { $in: hotelIds } }),
    Reservation.countDocuments({
      hotelId: { $in: hotelIds },
      status: "pending",
    }),
    Reservation.countDocuments({
      hotelId: { $in: hotelIds },
      status: "confirmed",
    }),
    Reservation.countDocuments({
      hotelId: { $in: hotelIds },
      status: "cancelled",
    }),
    Reservation.countDocuments({
      hotelId: { $in: hotelIds },
      status: "completed",
    }),
  ]);

  // 5) 최근 30일 매출 (completed 예약만)
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const revenueAgg = await Reservation.aggregate([
    {
      $match: {
        hotelId: { $in: hotelIds },
        status: "completed",
        updatedAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalPrice" },
        count: { $sum: 1 },
      },
    },
  ]);

  const last30DaysTotal = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
  const last30DaysCount = revenueAgg.length > 0 ? revenueAgg[0].count : 0;

  return {
    hotels: {
      total: totalHotels,
      pending: pendingHotels,
      approved: approvedHotels,
      rejected: rejectedHotels,
    },
    rooms: {
      total: totalRooms,
      active: activeRooms,
      inactive: inactiveRooms,
    },
    reservations: {
      total: totalReservations,
      pending: pendingReservations,
      confirmed: confirmedReservations,
      cancelled: cancelledReservations,
      completed: completedReservations,
    },
    revenue: {
      last30DaysTotal,
      last30DaysCount,
    },
  };
};
// ⬆⬆ dashboard/service.js 여기에까지 추가 ⬆⬆

