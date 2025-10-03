const { DoctorTimeSlot, Appointment } = require("../models");

exports.checkDoctorAvailability = async (
  doctorId,
  subDoctorId,
  date,
  appointmentTime
) => {
  const appointmentDate = new Date(date);
  const dayOfWeek = appointmentDate.getDay();
  const slot = await DoctorTimeSlot.findOne({
    where: {
      doctorId,
      subDoctorId,
      startTime: appointmentTime.split(" - ")[0],
      endTime: appointmentTime.split(" - ")[1],
    },
  });

  if (!slot) {
    return { available: false, reason: "No matching slot for this time" };
  }

  if (!slot.availabilityIds.includes(dayOfWeek)) {
    return {
      available: false,
      reason: "No matching slot for this time",
    };
  }

  const appointmentCount = await Appointment.count({
    where: {
      doctorId,
      subDoctorId,
      date: appointmentDate,
      appointmentTime,
    },
  });

  if (appointmentCount >= slot.maxCapacity) {
    return { available: false, reason: "Slot capacity full" };
  }

  return {
    available: true,
    slot,
    appointmentCount,
  };
};
