const { toZonedTime } = require("date-fns-tz");

const TIMEZONE = "Africa/Lagos";

const getLagosDayBounds = (date = new Date()) => {
  const lagosTime = toZonedTime(date, TIMEZONE);
  const year = lagosTime.getFullYear();
  const month = (lagosTime.getMonth() + 1).toString().padStart(2, "0");
  const day = lagosTime.getDate().toString().padStart(2, "0");

  const startOfDay = new Date(`${year}-${month}-${day}T00:00:00.000+01:00`);
  const endOfDay = new Date(`${year}-${month}-${day}T23:59:59.999+01:00`);

  return { startOfDay, endOfDay, lagosTime };
};

const normalizeDayStart = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const normalizeDayEnd = (date) => {
  const normalized = new Date(date);
  normalized.setHours(23, 59, 59, 999);
  return normalized;
};

const isDateWithinPlacementWindow = (date, placement) => {
  if (!placement?.startDate || !placement?.endDate) return false;
  const target = normalizeDayStart(date).getTime();
  const start = normalizeDayStart(placement.startDate).getTime();
  const end = normalizeDayEnd(placement.endDate).getTime();
  return target >= start && target <= end;
};

module.exports = {
  TIMEZONE,
  getLagosDayBounds,
  isDateWithinPlacementWindow,
};
