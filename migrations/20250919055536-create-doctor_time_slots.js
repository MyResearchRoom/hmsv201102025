"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("doctor_time_slots", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      availabilityId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "doctor_availability",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      startTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      endTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      maxCapacity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      slotDuration: {
        type: Sequelize.INTEGER,
        allowNull: true,
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

    await queryInterface.addIndex("doctor_time_slots", ["availabilityId"]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("doctor_time_slots");
  },
};
