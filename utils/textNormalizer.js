const toCapitalCase = (str) => {
  if (!str || typeof str !== "string") return "";
  return str.trim().toUpperCase();
};

exports.toCapitalCase = toCapitalCase;
exports.toTitleCase = toCapitalCase;

exports.normalizeEmail = (email) => {
  if (!email || typeof email !== "string") return "";
  return email.trim();
};
