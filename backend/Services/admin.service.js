// backend/Services/admin.service.js
import Hotel from "../models/Hotel.js";

/**
 * 승인 대기 호텔 목록
 */
export const getPendingHotels = async () => {
  return Hotel.find({ status: "PENDING" })
    .populate("ownerId", "name email") // 필요 없으면 제거해도 됨
    .sort({ createdAt: -1 });
};

/**
 * 호텔 승인
 */
export const approveHotel = async (hotelId) => {
  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    const err = new Error("호텔을 찾을 수 없습니다.");
    err.status = 404;
    throw err;
  }

  hotel.status = "APPROVED";
  hotel.rejectReason = undefined;
  await hotel.save();

  return hotel;
};

/**
 * 호텔 반려
 */
export const rejectHotel = async (hotelId, reason) => {
  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    const err = new Error("호텔을 찾을 수 없습니다.");
    err.status = 404;
    throw err;
  }

  hotel.status = "REJECTED";
  hotel.rejectReason = reason || null;
  await hotel.save();

  return hotel;
};
