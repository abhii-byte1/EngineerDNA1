import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import githubDnaRouter from "./github-dna";
import resumeDnaRouter from "./resume-dna";
import roadmapRouter from "./roadmap";
import goalsRouter from "./goals";
import dashboardRouter from "./dashboard";
import publicRouter from "./public";
import roastRouter from "./roast";
import badgeRouter from "./badge";
import leaderboardRouter from "./leaderboard";
import interviewSimulatorRouter from "./interview-simulator";
import ogRouter from "./og";
import compareRouter from "./compare";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/github-dna", githubDnaRouter);
router.use("/resume-dna", resumeDnaRouter);
router.use("/roadmap", roadmapRouter);
router.use("/goals", goalsRouter);
router.use("/dashboard", dashboardRouter);

// Growth Engine Unauthenticated Public Routes
router.use("/public", publicRouter);
router.use("/roast", roastRouter);
router.use("/badge", badgeRouter);
router.use("/leaderboard", leaderboardRouter);
router.use("/og", ogRouter);
router.use("/compare", compareRouter);

// Bounded AI Interview Simulator
router.use("/interview-simulator", interviewSimulatorRouter);

export default router;
