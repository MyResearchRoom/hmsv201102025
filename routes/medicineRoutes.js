const express = require("express");
const router = express.Router();

const medicineController = require("../controllers/medicineController.js");

const {
  validate,
  medicineValidationRule,
} = require("../middlewares/validations.js");
const { upload } = require("../middlewares/upload.js");
const { authenticate } = require("../middlewares/authentication.js");

router.post(
  "/add",
  authenticate(["receptionist", "doctor", "subDoctor"]),
  medicineValidationRule,
  validate,
  medicineController.addMedicine
);

router.get(
  "/",
  authenticate(["receptionist", "doctor", "subDoctor"]),
  medicineController.getAllMedicines
);

router.put(
  "/:id",
  authenticate(["receptionist", "doctor", "subDoctor"]),
  medicineController.editMedicine
);

router.delete(
  "/:id",
  authenticate(["receptionist", "doctor", "subDoctor"]),
  medicineController.deleteMedicine
);

router.post(
  "/addBulkMedicines",
  authenticate(["receptionist", "doctor", "subDoctor"]),
  upload.single("excelFile"),
  medicineController.addBulkMedicinesFromExcel
);

module.exports = router;
