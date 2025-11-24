// backend/Services/owner.service.js
import Hotel from "../models/Hotel.js";

/**
 * 내 호텔 목록 조회
 */
export const getHotelsByOwner = async (ownerId) => {
  return Hotel.find({ ownerId }).sort({ createdAt: -1 });
};

/**
 * 호텔 생성 (기본 상태는 PENDING)
 */
export const createHotel = async (ownerId, payload) => {
  const { name, description, address } = payload;

  if (!name) {
    const err = new Error("호텔 이름은 필수입니다.");
    err.status = 400;
    throw err;
  }

  const hotel = await Hotel.create({
    name,
    description,
    address,
    ownerId,
    status: "PENDING",
    rejectReason: undefined,
  });

  return hotel;
};

/**
 * 호텔 수정 (본인 소유 호텔만 가능)
 */
export const updateHotel = async (ownerId, hotelId, payload) => {
  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    const err = new Error("호텔을 찾을 수 없습니다.");
    err.status = 404;
    throw err;
  }

  if (hotel.ownerId.toString() !== ownerId.toString()) {
    const err = new Error("본인 소유 호텔만 수정할 수 있습니다.");
    err.status = 403;
    throw err;
  }

  // 수정 가능한 필드만 골라서 업데이트
  const updatableFields = ["name", "description", "address"];
  updatableFields.forEach((field) => {
    if (payload[field] !== undefined) {
      hotel[field] = payload[field];
    }
  });

  // 만약 REJECTED 상태였는데 수정하면 다시 심사요청으로 돌리고 싶다면:
  if (hotel.status === "REJECTED") {
    hotel.status = "PENDING";
    hotel.rejectReason = undefined;
  }

  await hotel.save();
  return hotel;
};
