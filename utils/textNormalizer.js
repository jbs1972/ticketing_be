/**
 * Title Case rule applied to every name-based field
 * (user name, company, project, status, priority).
 * e.g. "john doe" -> "John Doe", "SOLVED" -> "Solved", "dell" -> "Dell"
 * Emails and passwords are never passed through this helper.
 */
const toTitleCase = (str) => {
  if (!str || typeof str !== "string") return "";
  return str
    .trim()
    .toLowerCase()
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
};

exports.toTitleCase = toTitleCase;
// Alias kept so any older import keeps working with the same Title Case rule
exports.toCapitalCase = toTitleCase;

/**
 * Emails are stored exactly as the user provided them.
 * Only trims surrounding whitespace; casing is never changed.
 */
exports.normalizeEmail = (email) => {
  if (!email || typeof email !== "string") return "";
  return email.trim();
};