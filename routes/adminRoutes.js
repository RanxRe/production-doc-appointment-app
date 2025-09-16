const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getAllUsersController,
  getAlldoctorsController,
  changeAccountStatus,
} = require("../controllers/adminController");

const router = express.Router();

//get method || users
router.get("/getAllUsers", authMiddleware, getAllUsersController);
router.get("/getAlldoctors", authMiddleware, getAlldoctorsController);

//POST account status router
router.post("/change-account-status", authMiddleware, changeAccountStatus);

module.exports = router;
