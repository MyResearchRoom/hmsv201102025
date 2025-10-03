"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("days_of_week", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
    });

    // Insert days of the week
    await queryInterface.bulkInsert("days_of_week", [
      { name: "Monday", id: 1 },
      { name: "Tuesday", id: 2 },
      { name: "Wednesday", id: 3 },
      { name: "Thursday", id: 4 },
      { name: "Friday", id: 5 },
      { name: "Saturday", id: 6 },
      { name: "Sunday", id: 0 },
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("days_of_week");
  },
};
