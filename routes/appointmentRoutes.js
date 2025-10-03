const express = require("express");
const router = express.Router();

const appointmentController = require("../controllers/appointmentController.js");
const { upload } = require("../middlewares/upload.js");
const {
  patientAppointmentRescheduleValidationRule,
} = require("../middlewares/validations.js");
const { authenticate } = require("../middlewares/authentication.js");

router.post(
  "/payment-mode/:id",
  authenticate(["receptionist", "doctor", "subDoctor"]),
  appointmentController.addPaymentMode
);

router.post(
  "/prescription/:id",
  authenticate(["receptionist", "doctor", "subDoctor"]),
  upload.single("prescription"),
  appointmentController.addPrescription
);

router.put(
  "/parameters/:id",
  authenticate(["receptionist", "doctor", "subDoctor"]),
  appointmentController.addParameters
);

router.put(
  "/submit-appointment/:id",
  authenticate(["doctor", "subDoctor"]),
  appointmentController.submitAppointment
);

router.get(
  "/todays-appointments",
  authenticate(["receptionist", "doctor", "subDoctor"]),
  appointmentController.getTodaysAppointments
);

router.get(
  "/patient-appointments/:id",
  authenticate(["receptionist", "doctor", "subDoctor"]),
  appointmentController.getPatientAppointments
);

router.put(
  "/set-current-appointment/:id",
  authenticate(["receptionist", "doctor", "subDoctor"]),
  appointmentController.setAppointmentStatus
);

router.get(
  "/current-appointment",
  authenticate(["receptionist", "doctor", "subDoctor"]),
  appointmentController.getFirstAppointment
);

router.patch(
  "/cancel/:appointmentId",
  authenticate(["receptionist", "doctor", "subDoctor"]),
  appointmentController.cancelAppointment
);

router.patch(
  "/re-schedule/:appointmentId",
  authenticate(["receptionist", "doctor", "subDoctor"]),
  patientAppointmentRescheduleValidationRule,
  appointmentController.reScheduleAppointment
);

module.exports = router;
