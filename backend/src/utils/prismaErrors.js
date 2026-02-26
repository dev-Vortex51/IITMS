const logger = require("./logger");

const PRISMA_ERROR_CODES = {
  P1000: "Authentication failed",
  P1001: "Can't reach database server",
  P1002: "Database timeout",
  P1003: "Database not found",
  P1008: "Operations timed out",
  P1009: "Database already exists",
  P1010: "User was denied access",
  P1011: "Error opening a connection",
  P1012: "Schema validation error",
  P1013: "The provided database string is invalid",
  P1014: "The underlying error changed",
  P1015: "Prisma schema parsing error",
  P1016: "Interpreting error from database",
  P1017: "Server closed connection",
  P2000: "Value too long for column",
  P2001: "Record not found",
  P2002: "Unique constraint violated",
  P2003: "Foreign key constraint failed",
  P2004: "A constraint failed on the database",
  P2005: "Invalid value for column type",
  P2006: "Invalid value provided to prisma client",
  P2007: "Data validation error",
  P2008: "Failed to parse query",
  P2009: "Failed to validate query",
  P2010: "Query raw failed",
  P2011: "Null constraint violation",
  P2012: "Missing required value",
  P2013: "Missing required argument",
  P2014: "Required relation violation",
  P2015: "Related records not found",
  P2016: "Query interpretation error",
  P2017: "Records not connected",
  P2018: "Required connected records not found",
  P2019: "Input error",
  P2020: "Value out of range",
  P2021: "Table does not exist",
  P2022: "Column does not exist",
  P2023: "Inconsistent column data",
  P2024: "Timed out fetching a new connection",
  P2025: "Record to update not found",
  P2026: "The database has a null value",
  P2027: "Multiple errors in query",
  P2028: "Transaction API error",
  P2030: "Cannot find schema",
  P2033: "Missing unique identifier",
};

class PrismaErrorHandler extends Error {
  constructor(statusCode, message, code, originalError) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.originalError = originalError;
    this.name = "PrismaError";
  }
}

const handlePrismaError = (error) => {
  const code = error.code;

  switch (code) {
    // Authentication & Connection Errors (4xx)
    case "P1000":
    case "P1010":
      return new PrismaErrorHandler(
        401,
        "Database authentication failed",
        code,
        error,
      );

    case "P1001":
    case "P1002":
    case "P1011":
    case "P1017":
    case "P2024":
      return new PrismaErrorHandler(
        503,
        "Database connection temporarily unavailable",
        code,
        error,
      );

    case "P1003":
      return new PrismaErrorHandler(404, "Database not found", code, error);

    // Validation & Schema Errors (4xx)
    case "P1012":
    case "P1013":
    case "P1015":
    case "P2008":
    case "P2009":
      return new PrismaErrorHandler(400, "Invalid request", code, error);

    // Unique Constraint Violations (4xx)
    case "P2002": {
      const uniqueFields = error.meta?.target || [];
      return new PrismaErrorHandler(
        409,
        `Record with this ${uniqueFields.join(", ")} already exists`,
        code,
        error,
      );
    }

    // Foreign Key & Relation Errors (4xx)
    case "P2003":
    case "P2014":
    case "P2017":
      return new PrismaErrorHandler(
        400,
        "Invalid or missing related record",
        code,
        error,
      );

    case "P2015":
    case "P2018":
      return new PrismaErrorHandler(
        404,
        "Related record not found",
        code,
        error,
      );

    // Not Found Errors (4xx)
    case "P2001":
    case "P2025":
      return new PrismaErrorHandler(404, "Record not found", code, error);

    // Value & Type Errors (4xx)
    case "P2000":
    case "P2005":
    case "P2006":
    case "P2007":
    case "P2011":
    case "P2012":
    case "P2013":
    case "P2020":
    case "P2026":
      return new PrismaErrorHandler(400, "Invalid value provided", code, error);

    case "P2021":
      return new PrismaErrorHandler(
        500,
        "Database schema mismatch",
        code,
        error,
      );

    case "P2022":
      return new PrismaErrorHandler(
        500,
        "Database column not found",
        code,
        error,
      );

    // Query Errors (5xx)
    case "P2010":
    case "P2016":
    case "P2019":
    case "P2023":
    case "P2027":
    case "P2028":
    case "P2030":
    case "P2033":
      return new PrismaErrorHandler(
        500,
        "Internal database error",
        code,
        error,
      );

    // Default error handling
    default:
      logger.warn(`Unhandled Prisma error code: ${code}`);
      return new PrismaErrorHandler(
        500,
        error.message || "Database operation failed",
        code || "UNKNOWN",
        error,
      );
  }
};

const logPrismaError = (error, context = "") => {
  const handled = handlePrismaError(error);

  const logData = {
    code: error.code,
    message: error.message,
    context,
    statusCode: handled.statusCode,
  };

  if (error.meta) {
    logData.meta = error.meta;
  }

  if (process.env.NODE_ENV === "development") {
    logger.error(`Prisma Error [${context}]:`, logData);
    if (error.stack) {
      logger.error("Stack trace:", error.stack);
    }
  } else {
    logger.error(`Prisma Error [${context}]: ${error.message}`);
  }
};

module.exports = {
  handlePrismaError,
  logPrismaError,
  PrismaErrorHandler,
  PRISMA_ERROR_CODES,
};
