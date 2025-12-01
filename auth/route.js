import { Router } from "express";
import { register, login, me } from "./controller.js";
import { verifyToken } from "../common/authmiddleware.js";

const router = Router();

// 회원가입
router.post("/register", register);

// 로그인 (owner / admin / user 모두 사용)
router.post("/login", login);

// 내 정보 조회
router.get("/me", verifyToken, me);

export default router;