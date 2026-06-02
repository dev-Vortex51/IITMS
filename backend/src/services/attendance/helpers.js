const { toZonedTime } = require("date-fns-tz");

const DEFAULT_TIMEZONE = "Africa/Lagos";

const getDayBounds = (date = new Date(), timezone = DEFAULT_TIMEZONE) => {
  const zonedTime = toZonedTime(date, timezone);
  const year = zonedTime.getFullYear();
  const month = zonedTime.getMonth();
  const day = zonedTime.getDate();

  const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

  return { startOfDay, endOfDay, zonedTime };
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

const getLagosDayBounds = (date = new Date()) => getDayBounds(date, DEFAULT_TIMEZONE);

module.exports = {
  DEFAULT_TIMEZONE,
  getDayBounds,
  getLagosDayBounds,
  isDateWithinPlacementWindow,
};
