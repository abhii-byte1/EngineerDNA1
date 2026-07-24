import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import githubDnaRouter from "./github-dna";
import resumeDnaRouter from "./resume-dna";
import roadmapRouter from "./roadmap";
import goalsRouter from "./goals";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/github-dna", githubDnaRouter);
router.use("/resume-dna", resumeDnaRouter);
router.use("/roadmap", roadmapRouter);
router.use("/goals", goalsRouter);
router.use("/dashboard", dashboardRouter);

export default router;
