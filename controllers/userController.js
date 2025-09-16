const userModel = require("../models/userModels");
const doctorModel = require("../models/doctorModels");
const appointmentModel = require("../models/appointmentModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { add15MinutestoTime } = require("../utils/timeUtils");

//register callback
const registerController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(200).send({ success: false, message: "User already exists" });
    }
    //password hashing
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //passing the hassed password to user
    req.body.password = hashedPassword;

    //Creating new user
    const newUser = new userModel(req.body);
    await newUser.save();
    res.status(201).send({ success: true, message: "Registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Error: Register Controller ${error.message}`,
    });
  }
};

//login callback
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).send({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(200).send({ success: false, message: "Invalid email or password" });
    }

    //generating token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    const userData = user.toObject();
    delete userData.password;
    res.status(200).send({
      success: true,
      message: "Login Successful",
      token: token,
      data: userData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Error: Login Controller ${error.message}`,
    });
  }
};

const authController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res.status(200).send({
        message: "User not found",
        success: false,
      });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "auth error",
      success: false,
    });
  }
};

//apply doctor controller
const applyDoctorController = async (req, res) => {
  try {
    //geting form data and storing it in DB
    const newDoctor = await doctorModel({ ...req.body, status: "pending" });
    await newDoctor.save();

    //telling admin that we got a new request for doctor
    const adminUser = await userModel.findOne({ isAdmin: true });
    const notification = await adminUser.notification;
    notification.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a Doctor Account`,
      data: {
        doctorId: newDoctor._id,
        name: newDoctor.firstName + " " + newDoctor.lastName,
        onClickPath: "/admin/doctors",
      },
    });

    //awaiting for userModel, find and update
    await userModel.findByIdAndUpdate(adminUser._id, { notification });
    res.status(201).send({
      success: true,
      message: "Doctor account applied successful",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while applying doctor",
    });
  }
};

//getallnotifiation Controller

const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    const seenNotification = user.seenNotification;
    const notification = user.notification;

    seenNotification.push(...notification);
    user.notification = [];
    user.seenNotification = notification;
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "Notification marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in notification",
      success: false,
      error,
    });
  }
};

//delete all notification
const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.notification = [];
    user.seenNotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "All notifications deleted",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in deleting notification",
      error,
    });
  }
};

//getAllDoctorController
const getAllDoctorController = async (req, res) => {
  try {
    // Disable cache explicitly
    res.setHeader("Cache-Control", "no-store");
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "All doctor's list fetched",
      data: doctors,
    });
  } catch (error) {
    console.log(error),
      res.status(500).send({
        success: false,
        message: "Error while fetching all doctors",
        error,
      });
  }
};

const bookAppointmentController = async (req, res) => {
  try {
    // Disable cache explicitly
    res.setHeader("Cache-Control", "no-store");
    req.body.status = "pending";
    const newAppointment = new appointmentModel(req.body);
    await newAppointment.save();
    const user = await userModel.findOne({ _id: req.body.doctorInfo.userId });
    user.notification.push({
      type: "New-appointment-request",
      message: `A new appointment request from ${req.body.userInfo.name}`,
      onClickPath: "/user/appointments",
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Appointment booked successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while booking appointment",
      error,
    });
  }
};

const bookingAvailibilityController = async (req, res) => {
  try {
    // Disable cache explicitly
    res.setHeader("Cache-Control", "no-store");
    const date = req.body.date;
    const doctorId = req.body.doctorId;
    const fromTime = req.body.timing.startTime;
    const toTime = add15MinutestoTime(fromTime);

    const doctor = await doctorModel.findById(doctorId);

    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    // Check if within doctor's timing
    if (fromTime < doctor.timing.startTime || toTime > doctor.timing.endTime) {
      return res.status(200).send({
        success: false,
        message: "Appointment time is outside of doctor's working hours",
      });
    }

    // Check if slot already booked
    const appointments = await appointmentModel.find({
      doctorId,
      date,
      "timing.startTime": fromTime,
    });
    // console.log("Checking from:", fromTime, "to:", toTime);

    if (appointments.length > 0) {
      return res.status(200).send({
        success: false,
        message: "This time slot has been booked already. Please select another time slot",
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Appointment available",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while checking booking",
      error,
    });
  }
};

const userAppointmentController = async (req, res) => {
  try {
    // Disable cache explicitly
    res.setHeader("Cache-Control", "no-store");
    const appointments = await appointmentModel
      .find({ userId: req.body.userId })
      .populate("doctorInfo", "firstName lastName specialization feePerConsultation");
    res.status(200).send({
      success: true,
      message: "User-appointment-list fetched",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while showing user-appointments",
      error,
    });
  }
};

const getUserInfoController = async (req, res) => {
  try {
    // Disable cache explicitly
    res.setHeader("Cache-Control", "no-store");
    const user = await userModel.findById(req.body.userId);
    res.status(200).send({
      success: true,
      message: "User data fetched successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error while fetching user info",
      error,
    });
  }
};

const updateUserInfoController = async (req, res) => {
  try {
    // Disable cache explicitly
    res.setHeader("Cache-Control", "no-store");
    const user = await userModel.findByIdAndUpdate(req.body.userId, req.body);
    res.status(201).send({
      success: true,
      message: "Profile updated",
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error while updating info",
      error,
    });
  }
};

module.exports = {
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
};
