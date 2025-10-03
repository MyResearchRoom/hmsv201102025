"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable("doctor_time_slots");
    await queryInterface.dropTable("doctor_availability");
    await queryInterface.dropTable("days_of_week");
  },
  async down(queryInterface, Sequelize) {},
};
