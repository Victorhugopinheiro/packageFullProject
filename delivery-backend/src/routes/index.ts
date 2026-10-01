import { Router } from "express";
import { authRouter } from './user/auth.js';
import workerRouter from './worker/workerApi.js';
const router = Router();

router.use("/user", authRouter);
router.use("/worker", workerRouter);



export default router;