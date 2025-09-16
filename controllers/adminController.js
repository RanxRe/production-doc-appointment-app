const userModel = require("../models/userModels");
const doctorModel = require("../models/doctorModels");

const getAllUsersController = async (req, res) => {
  try {
    console.log("In getAllUsersController");
    // Disable cache explicitly
    res.setHeader("Cache-Control", "no-store");
    const users = await userModel.find({});
    console.log("fetched users", users);
    res.status(200).send({
      success: true,
      message: "Fetched user list sucessfully",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while fetching users",
      error,
    });
  }
};
const getAlldoctorsController = async (req, res) => {
  try {
    // Disable cache explicitly
    res.setHeader("Cache-Control", "no-store");
    const doctors = await doctorModel.find({});
    // console.log("fetched doctors", doctors);
    res.status(200).send({
      success: true,
      message: "Fetched doctors list sucessfully",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while fetching doctors",
      error,
    });
  }
};

//doctor account status
const changeAccountStatus = async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store");
    const { doctorId, status } = req.body;
    const doctor = await doctorModel.findByIdAndUpdate(doctorId, { status });
    const user = await userModel.findOne({ _id: doctor.userId });
    const notification = user.notification.push({
      type: "doctor-account-request-updated",
      message: `Your doctor account request has been ${status}`,
      onClickPath: "/notification",
    });
    user.isDoctor = status === "approved" ? true : false;
    await user.save();
    res.status(201).send({
      success: true,
      message: "Account status updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while changing account status",
      error,
    });
  }
};

module.exports = { getAllUsersController, getAlldoctorsController, changeAccountStatus };
