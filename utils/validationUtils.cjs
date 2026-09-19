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

function validateNonNegativeNumber(value) {
    return !isNaN(value) && Number(value) >= 0;
}

function validateDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return false;
    }

    return end >= start;
}

module.exports = {
  formatName,
  formatPhone,
  validateEmail,
  validateNonNegativeNumber,
  validateDateRange
};

