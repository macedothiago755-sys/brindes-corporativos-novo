import { Router } from "express";
import { jobsController } from "@/modules/jobs/jobs.controller";
import { resumeUpload } from "@/modules/jobs/upload.middleware";
import { asyncHandler } from "@/shared/utils/asyncHandler";

export const jobsRouter = Router();

jobsRouter.post("/", asyncHandler(jobsController.create));
jobsRouter.get("/", asyncHandler(jobsController.list));
jobsRouter.get("/:id", asyncHandler(jobsController.getById));
jobsRouter.post(
  "/:id/resumes",
  resumeUpload.single("resume"),
  asyncHandler(jobsController.uploadResume),
);
