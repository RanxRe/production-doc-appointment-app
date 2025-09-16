const express = require("express");
const {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDoctorController,
  bookAppointmentController,
  bookingAvailibilityController,
  userAppointmentController,
  getUserInfoController,
  updateUserInfoController,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

//router object
const router = express.Router();

//routes
//login POST
router.post("/login", loginController);

//register POST
router.post("/register", registerController);

//auth POST
router.post("/getUserData", authMiddleware, authController);

//apply-doctor || POST
router.post("/apply-doctor", authMiddleware, applyDoctorController);

//notification doctor || POST
router.post("/get-all-notification", authMiddleware, getAllNotificationController);

//notification doctor || POST
router.post("/delete-all-notification", authMiddleware, deleteAllNotificationController);

//get-all-doctors || GET
router.get("/get-all-doctor", authMiddleware, getAllDoctorController);

//book-appointment || POST
router.post("/book-appointment", authMiddleware, bookAppointmentController);

//booking availability router || POST
router.post("/booking-availability", authMiddleware, bookingAvailibilityController);

//appointment-list || GET
router.get("/user-appointments", authMiddleware, userAppointmentController);

//get single doctor info || POST
router.post("/get-user-info", authMiddleware, getUserInfoController);

//update profile || POST
router.post("/update-user-info", authMiddleware, updateUserInfoController);

module.exports = router;
