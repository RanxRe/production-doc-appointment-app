const appointmentModel = require("../models/appointmentModels");
const doctorModel = require("../models/doctorModels");
const userModel = require("../models/userModels");
const getDoctorInfoController = async (req, res) => {
  try {
    // Disable cache explicitly
    res.setHeader("Cache-Control", "no-store");
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    res.status(200).send({
      success: true,
      message: "Doctor data fetched successfully",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in fetching doctor details",
      error,
    });
  }
};

const updateDoctorInfoController = async (req, res) => {
  try {
    // Disable cache explicitly
    res.setHeader("Cache-Control", "no-store");
    const doctor = await doctorModel.findOneAndUpdate({ userId: req.body.userId }, req.body);
    res.status(201).send({
      success: true,
      message: "Profile updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in updating doctor details",
      error,
    });
  }
};

//getDoctorByIdController
const getDoctorByIdController = async (req, res) => {
  try {
    // Disable cache explicitly
    res.setHeader("Cache-Control", "no-store");
    const doctor = await doctorModel.findOne({ _id: req.body.doctorId });
    res.status(200).send({
      success: true,
      message: "Single doctor list fetched",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting doctor",
      error,
    });
  }
};

const DoctorAppointmentController = async (req, res) => {
  try {
    // Disable cache explicitly
    res.setHeader("Cache-Control", "no-store");
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    const appointments = await appointmentModel
      .find({ doctorId: doctor._id })
      .populate("userInfo", "name");
    res.status(200).send({
      success: true,
      message: "Doctor appointment fetched",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in doctor appointment controller",
      error,
    });
  }
};

const updateAppointmentStatusController = async (req, res) => {
  try {
    // Disable cache explicitly
    res.setHeader("Cache-Control", "no-store");
    const { appointmentsId, status } = req.body;
    const appointments = await appointmentModel.findByIdAndUpdate(appointmentsId, { status });
    const user = await userModel.findOne({ _id: appointments.userId });
    const notification = user.notification;
    notification.push({
      type: "Status-updated-for-appointment",
      message: `Your appointment has been ${status}`,
      onClickPath: "/dcotor-appointments",
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Appointment status updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in updating appointment status",
      error,
    });
  }
};

module.exports = {
  getDoctorInfoController,
  updateDoctorInfoController,
  getDoctorByIdController,
  DoctorAppointmentController,
  updateAppointmentStatusController,
};
