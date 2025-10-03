const { max_sub_doctor } = require("../config/config");
const { SubDoctor, Doctor, Receptionist, Appointment } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { transformWithMapping } = require("../utils/transformWithMapping");
const { decrypt } = require("../utils/cryptography");
const { validateQueryParams } = require("../utils/validateQueryParams");
const moment = require("moment-timezone");

const generateUniqueDoctorId = async (name) => {
  const nameParts = name.split(" ");
  const initials = nameParts
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  let uniqueId;
  let isUnique = false;

  while (!isUnique) {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    uniqueId = `${initials}${randomDigits}`;

    const existingDoctor = await SubDoctor.findOne({
      where: { id: uniqueId },
    });

    if (!existingDoctor) {
      isUnique = true;
    }
  }

  return uniqueId;
};

exports.createSubDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      mobileNumber,
      alternateMobileNumber,
      gender,
      specialization,
      qualification,
      experience,
      dateOfBirth,
      address,
      city,
      state,
      country,
      pinCode,
      password,
    } = req.body;

    let isExists;
    isExists = await Doctor.findOne({ where: { email } });
    if (!isExists) {
      isExists = await SubDoctor.findOne({
        where: { email },
      });
    }
    if (!isExists) {
      isExists = await Receptionist.findOne({
        where: { email },
      });
    }

    if (isExists) {
      return res
        .status(400)
        .json({ error: "Email is already registered with another user." });
    }

    const subDoctorCount = await SubDoctor.count({
      where: {
        addedBy: req.user.hospitalId,
      },
    });

    if (subDoctorCount >= max_sub_doctor) {
      return res.status(400).json({
        error: `You can't add more than ${max_sub_doctor} sub-doctors.`,
      });
    }

    const files = req.files || {};
    const profile = files.profile
      ? `data:${
          files.profile[0].mimetype
        };base64,${files.profile[0].buffer.toString("base64")}`
      : null;
    const idProof = files.idProof
      ? `data:${
          files.idProof[0].mimetype
        };base64,${files.idProof[0].buffer.toString("base64")}`
      : null;

    const doctor = await Doctor.findOne({
      where: { id: req.user.hospitalId },
      attributes: ["mapping"],
    });

    const nameSearch = transformWithMapping(
      name,
      JSON.parse(decrypt(doctor.mapping)) || {}
    );
    const mobileSearch = transformWithMapping(
      mobileNumber,
      JSON.parse(decrypt(doctor.mapping)) || {}
    );

    const uniqueId = await generateUniqueDoctorId(name);
    const hashedPassword = await bcrypt.hash(password, 10);
    const subDoctor = await SubDoctor.create({
      id: uniqueId,
      addedBy: req.user.id,
      name,
      email,
      mobileNumber,
      alternateMobileNumber,
      gender,
      specialization,
      qualification,
      experience,
      dateOfBirth,
      address,
      city,
      state,
      country,
      pinCode,
      profile,
      idProof,
      nameSearch,
      mobileSearch,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Sub doctor created successfully",
      data: {
        ...subDoctor.toJSON(),
        profile: files.profile
          ? `data:${
              files.profile[0].mimetype
            };base64,${files.profile[0].buffer.toString("base64")}`
          : null,
        idProof: files.idProof
          ? `data:${
              files.idProof[0].mimetype
            };base64,${files.idProof[0].buffer.toString("base64")}`
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error creating sub doctor",
    });
  }
};

exports.getAllSubDoctors = async (req, res) => {
  try {
    const { page, limit, offset, searchTerm } = validateQueryParams({
      ...req.query,
    });
    const { isActive } = req.query;
    let whereClause = { addedBy: req.user.id };

    if (searchTerm && searchTerm.length > 0) {
      const doctor = await Doctor.findOne({
        where: { id: req.user.hospitalId },
        attributes: ["mapping"],
      });

      const transformSearchTerm = transformWithMapping(
        searchTerm,
        JSON.parse(decrypt(doctor.mapping)) || {}
      );

      whereClause[Op.or] = [
        { nameSearch: { [Op.like]: `%${transformSearchTerm}%` } },
        { mobileSearch: { [Op.like]: `%${transformSearchTerm}%` } },
      ];
    }

    if (isActive === "true" || isActive === "false") {
      whereClause.isActive = isActive === "true";
    }

    const subDoctors = await SubDoctor.findAndCountAll({
      where: whereClause,
      attributes: [
        "id",
        "name",
        "email",
        "mobileNumber",
        "specialization",
        "qualification",
        "isActive",
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: subDoctors.rows,
      pagination: {
        totalRecords: subDoctors.count,
        totalPages: Math.ceil(subDoctors.count / limit),
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error fetching sub doctors",
    });
  }
};

exports.getSubDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const subDoctor = await SubDoctor.findByPk(id);

    if (!subDoctor) {
      return res.status(404).json({
        success: false,
        error: "Sub doctor not found",
      });
    }

    if (subDoctor.addedBy !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    res.status(200).json({
      success: true,
      data: subDoctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error fetching sub doctor",
    });
  }
};

exports.updateSubDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      mobileNumber,
      alternateMobileNumber,
      gender,
      specialization,
      qualification,
      experience,
      dateOfBirth,
      address,
      city,
      state,
      country,
      pinCode,
    } = req.body;

    const subDoctor = await SubDoctor.findByPk(id);
    if (!subDoctor) {
      return res.status(404).json({
        success: false,
        error: "Sub doctor not found",
      });
    }

    if (subDoctor.addedBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to update this sub doctor",
      });
    }

    if (email && email !== subDoctor.email) {
      const existingSubDoctor = await SubDoctor.findOne({ where: { email } });
      if (existingSubDoctor) {
        return res.status(409).json({
          success: false,
          error: "Sub doctor with this email already exists",
        });
      }
    }

    if (mobileNumber && mobileNumber !== subDoctor.mobileNumber) {
      const existingSubDoctor = await SubDoctor.findOne({
        where: { mobileNumber },
      });
      if (existingSubDoctor) {
        return res.status(409).json({
          success: false,
          error: "Sub doctor with this mobile number already exists",
        });
      }
    }

    const doctor = await Doctor.findOne({
      where: { id: req.user.hospitalId },
      attributes: ["mapping"],
    });

    const nameSearch = transformWithMapping(
      name,
      JSON.parse(decrypt(doctor.mapping)) || {}
    );
    const mobileSearch = transformWithMapping(
      mobileNumber,
      JSON.parse(decrypt(doctor.mapping)) || {}
    );

    const files = req.files || {};
    const updateData = {
      name,
      nameSearch,
      email,
      mobileNumber,
      mobileSearch,
      alternateMobileNumber,
      gender,
      specialization,
      qualification,
      experience,
      dateOfBirth,
      address,
      city,
      state,
      country,
      pinCode,
    };

    if (files.profile)
      updateData.profile = `data:${
        files.profile[0].mimetype
      };base64,${files.profile[0].buffer.toString("base64")}`;
    if (files.idProof)
      updateData.idProof = `data:${
        files.idProof[0].mimetype
      };base64,${files.idProof[0].buffer.toString("base64")}`;

    await subDoctor.update(updateData);

    res.status(200).json({
      success: true,
      error: "Sub doctor updated successfully",
      data: {
        ...subDoctor.toJSON(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error updating sub doctor",
    });
  }
};

exports.deleteSubDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const subDoctor = await SubDoctor.findByPk(id);
    if (!subDoctor) {
      return res.status(404).json({
        success: false,
        error: "Sub doctor not found",
      });
    }

    if (subDoctor.addedBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to delete this sub doctor",
      });
    }

    await subDoctor.destroy();

    res.json({
      success: true,
      error: "Sub doctor deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error deleting sub doctor",
    });
  }
};

exports.toggleSubDoctorStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const subDoctor = await SubDoctor.findByPk(id, {
      attributes: ["id", "isActive", "addedBy"],
    });
    if (!subDoctor) {
      return res.status(404).json({
        success: false,
        error: "Sub doctor not found",
      });
    }

    if (subDoctor.addedBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to toggle the status of this sub doctor",
      });
    }

    await subDoctor.update({ isActive: !subDoctor.isActive });

    res.status(200).json({
      success: true,
      error: `Sub doctor ${
        subDoctor.isActive ? "activated" : "deactivated"
      } successfully`,
      data: { isActive: subDoctor.isActive },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error toggling sub doctor status",
    });
  }
};

exports.addSignature = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file provided" });
  }

  try {
    const doctor = await SubDoctor.findByPk(req.user.id, {
      attributes: ["id", "signature"],
    });

    doctor.signature = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Signature added successfully",
      signature: `data:${req.file.mimetype};base64,${req.file.buffer.toString(
        "base64"
      )}`,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to upload signature" });
  }
};

exports.stats = async (req, res) => {
  try {
    const [
      totalDoctorsCount,
      activeDoctorsCount,
      patientCount,
      specializationCount,
    ] = await Promise.all([
      SubDoctor.count({
        where: {
          addedBy: req.user.hospitalId,
        },
      }),
      SubDoctor.count({
        where: {
          isActive: true,
          addedBy: req.user.hospitalId,
        },
      }),
      Appointment.count({
        where: {
          status: "out",
          subDoctorId: {
            [Op.not]: null,
          },
          date: {
            [Op.between]: [
              moment().tz("Asia/Kolkata").startOf("day").toDate(),
              moment().tz("Asia/Kolkata").endOf("day").toDate(),
            ],
          },
        },
      }),
      SubDoctor.count({
        where: {
          addedBy: req.user.hospitalId,
        },
        col: "specialization",
        unique: true,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDoctorsCount,
        activeDoctorsCount,
        patientCount,
        specializationCount,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, error: "Failed to get stats" });
  }
};
