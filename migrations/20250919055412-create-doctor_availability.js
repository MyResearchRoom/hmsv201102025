"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("doctor_availability", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      doctorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Doctors",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      subDoctorId: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: "sub_doctors",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      dayOfWeekId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "days_of_week",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      isAvailable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add composite unique constraint to prevent duplicate entries
    await queryInterface.addConstraint("doctor_availability", {
      fields: ["doctorId", "subDoctorId", "dayOfWeekId"],
      type: "unique",
      name: "unique_doctor_day_availability",
    });

    // Add indexes for better query performance
    await queryInterface.addIndex("doctor_availability", ["doctorId"]);
    await queryInterface.addIndex("doctor_availability", ["subDoctorId"]);
    await queryInterface.addIndex("doctor_availability", ["dayOfWeekId"]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("doctor_availability");
  },
};
