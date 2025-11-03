// This function calculates the difference in months
function getMonthDifference(startDate, endDate) {
  return (
    endDate.getMonth() -
    startDate.getMonth() +
    12 * (endDate.getFullYear() - startDate.getFullYear())
  );
}

// This is our main logic function
export const generateMaintenanceReminders = (purchaseDateString) => {
  if (!purchaseDateString) {
    return []; // No date, no reminders
  }

  const reminders = [];
  const today = new Date();
  const purchaseDate = new Date(purchaseDateString);

  const monthsElapsed = getMonthDifference(purchaseDate, today);

  // --- You can customize all your logic here ---

  // After 6 months
  if (monthsElapsed >= 6) {
    reminders.push("After 6 Months: Clean laptop fans and check for dust.");
  }

  // After 12 months (1 year)
  if (monthsElapsed >= 12) {
    reminders.push("After 1 Year: Check battery health.");
  }

  // After 24 months (2 years)
  if (monthsElapsed >= 24) {
    reminders.push("After 2 Years: Consider re-applying thermal paste.");
  }

  // After 36 months (3 years)
  if (monthsElapsed >= 36) {
    reminders.push("After 3 Years: Check storage health (SSD/HDD).");
  }

  if (reminders.length === 0) {
    reminders.push("No maintenance needed yet. Looking good!");
  }

  return reminders;
};
