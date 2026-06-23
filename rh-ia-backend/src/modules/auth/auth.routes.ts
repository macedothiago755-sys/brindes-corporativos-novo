import { Router } from "express";
import { authController } from "@/modules/auth/auth.controller";
import { asyncHandler } from "@/shared/utils/asyncHandler";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(authController.register));
authRouter.post("/login", asyncHandler(authController.login));
