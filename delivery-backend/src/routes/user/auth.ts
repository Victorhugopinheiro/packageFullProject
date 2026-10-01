import { Router } from "express";
import LoginController from "../../controller/user/auth/loginController.js";
import MeController from "../../controller/user/auth/meController.js";
import LogoutController from "../../controller/user/auth/logoutController.js";
import RefreshController from "../../controller/user/auth/refreshController.js";
import RegisterController from "../../controller/user/auth/registerController.js";
import { requireAuth } from "../../middleware/requireAuth.js";

export const authRouter = Router();
const loginController = new LoginController();
const meController = new MeController();
const refreshController = new RefreshController();
const logoutController = new LogoutController();
const registerController = new RegisterController();

authRouter.post("/register", (req, res) => registerController.handle(req, res));
authRouter.post("/login", (req, res) => loginController.handle(req, res));
authRouter.post("/refresh", (req, res) => refreshController.handle(req, res));
authRouter.post("/logout", (req, res) => logoutController.handle(req, res));
authRouter.get("/me", requireAuth, (req, res) => meController.handle(req, res));