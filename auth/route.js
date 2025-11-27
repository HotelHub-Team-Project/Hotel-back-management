import { Router } from "express";
import { register, login, me } from "./controller.js";
import { verifyToken } from "../common/authmiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, me);

export default router;
