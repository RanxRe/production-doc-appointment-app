const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getDoctorInfoController,
  updateDoctorInfoController,
  getDoctorByIdController,
  DoctorAppointmentController,
  updateAppointmentStatusController,
} = require("../controllers/doctorController");
const router = express.Router();

//get single doctor info || POST
router.post("/get-doctor-info", authMiddleware, getDoctorInfoController);

//update profile || POST
router.post("/update-doctor-info", authMiddleware, updateDoctorInfoController);

//get single doc-info appointment || POST
router.post("/get-doctor-by-id", authMiddleware, getDoctorByIdController);

//doctor-appointments || GET
router.get("/doctor-appointments", authMiddleware, DoctorAppointmentController);

// update-status || POST
router.post("/update-appointment-status", authMiddleware, updateAppointmentStatusController);

module.exports = router;
