import { Router } from "express";
import multer from "multer";
import AddWorkerController from "../../controller/worker/addWorkerController.js";
import AddWorkerDeliveryController from "../../controller/worker/addWorkerDeliveryController.js";
import GetEmployeesController from "../../controller/worker/getEmployeesController.js";
import ListWorkerDeliveriesController from "../../controller/worker/listWorkerDeliveriesController.js";
import UpdateEmployeeController from "../../controller/worker/updateEmployeeController.js";
import { requireAuth } from "../../middleware/requireAuth.js";
import { requireRole } from "../../middleware/requireRole.js";
import FilterEmployeesDeliveryController from "../../controller/worker/filterEmployeesDeliveryController.js";
import FilterMyDeliveriesController from "../../controller/worker/filterMyDeliveriesController.js";

const workerRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });
const addWorkerController = new AddWorkerController();
const addWorkerDeliveryController = new AddWorkerDeliveryController();
const getEmployeesController = new GetEmployeesController();
const listWorkerDeliveriesController = new ListWorkerDeliveriesController();
const updateEmployeeController = new UpdateEmployeeController();
const filterEmployeesDeliveryController = new FilterEmployeesDeliveryController();
const filterMyDeliveriesController = new FilterMyDeliveriesController();

workerRouter.post(
    "/addWorker",
    requireAuth,
    requireRole("ADMIN"),
    upload.single("image"),
    (req, res) => addWorkerController.handle(req, res),
);

workerRouter.post(
    "/addDelivery",
    requireAuth,
    requireRole("ADMIN"),
    (req, res) => addWorkerDeliveryController.handle(req, res),
);

workerRouter.get(
    "/employees",
    requireAuth,
    requireRole("ADMIN"),
    (req, res) => getEmployeesController.handle(req, res),
);

workerRouter.get(
    "/workerDelivery",
    requireAuth,
    requireRole("ADMIN"),
    (req, res) => listWorkerDeliveriesController.handle(req, res),
);

workerRouter.get(
    "/employeesDelivery",
    requireAuth,
    requireRole("ADMIN"),
    (req, res) => filterEmployeesDeliveryController.handle(req, res),
)

workerRouter.get(
    "/myDelivery",
    requireAuth,
    requireRole("WORKER"),
    (req, res) => filterMyDeliveriesController.handle(req, res),
)

workerRouter.patch(
    "/updateEmployee",
    requireAuth,
    requireRole("ADMIN"),
    upload.single("image"),
    (req, res) => updateEmployeeController.handle(req, res),
);

export default workerRouter;