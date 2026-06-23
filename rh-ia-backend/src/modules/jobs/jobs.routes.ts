import { Router } from "express";
import { jobsController } from "@/modules/jobs/jobs.controller";
import { resumeUpload } from "@/modules/jobs/upload.middleware";
import { asyncHandler } from "@/shared/utils/asyncHandler";
import { requireRole } from "@/shared/middlewares/requireRole";
import { checkPlanLimits } from "@/shared/middlewares/billing.middleware";

export const jobsRouter = Router();

// Gestão de vagas e currículos é restrita à equipe de RH do tenant.
const hrStaffOnly = requireRole("OWNER", "ADMIN", "RECRUITER");

jobsRouter.post(
  "/",
  hrStaffOnly,
  asyncHandler(checkPlanLimits("JOB_CREATION")),
  asyncHandler(jobsController.create),
);
jobsRouter.get("/", hrStaffOnly, asyncHandler(jobsController.list));
jobsRouter.get("/:id", hrStaffOnly, asyncHandler(jobsController.getById));
jobsRouter.post(
  "/:id/resumes",
  hrStaffOnly,
  resumeUpload.single("resume"),
  asyncHandler(checkPlanLimits("RESUME_ANALYSIS")),
  asyncHandler(jobsController.uploadResume),
);
