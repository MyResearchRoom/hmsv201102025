const express = require("express");
const router = express.Router();

const doctorRouter = require("./doctorRoutes.js");
const receptionistRoutes = require("./receptionistRoutes.js");
const patientRoutes = require("./patientRoutes.js");
const medicineRoutes = require("./medicineRoutes.js");
const appointmentRoutes = require("./appointmentRoutes.js");
const notificationRoutes = require("./notificationRoutes.js");
const auditLogsRoutes = require("./auditLogsRoutes.js");
const subDoctorRoutes = require("./subDoctorRoutes.js");
const doctorTimeSlotRoutes = require("./doctorTimeSlotRoutes.js");

router.use("/test", (req, res) =>
  res.send(`<h1>This is a test API_03102025: ${req.clientIp}</h1>`)
);
router.use("/api/doctors", doctorRouter);
router.use("/api/receptionists", receptionistRoutes);
router.use("/api/patients", patientRoutes);
router.use("/api/medicines", medicineRoutes);
router.use("/api/appointments", appointmentRoutes);
router.use("/api/notifications", notificationRoutes);
router.use("/api/audit-logs", auditLogsRoutes);
router.use("/api/subdoctors", subDoctorRoutes);
router.use("/api/doctor_time_slots", doctorTimeSlotRoutes);

module.exports = router;
