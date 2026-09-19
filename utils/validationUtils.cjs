//script to help with data validation

//format names
function formatName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
}

function formatPhone(phone) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length !== 10) {
    throw new Error("Phone number must contain 10 digits.");
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = {
  formatName,
  formatPhone,
  validateEmail
};

