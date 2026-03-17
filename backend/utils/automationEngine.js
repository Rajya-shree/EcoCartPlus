const cron = require("node-cron");
const Device = require("../models/Device"); // Adjust path
const DeviceTask = require("../models/deviceTaskModel"); // Adjust path
const MaintenanceRule = require("../models/MaintenanceRule"); // NEW Rule Model

const runMaintenanceAutomation = async () => {
  console.log("⚙️ [CRON] Starting Dynamic Maintenance Scan...");

  try {
    // 1. Fetch ALL registered devices and ALL active rules from the database
    const allDevices = await Device.find({});
    const activeRules = await MaintenanceRule.find({ isActive: true });

    // 2. Loop through every device a user owns
    for (const device of allDevices) {
      // 🛑 NEW SAFETY CHECK: Skip broken development data
      // If the device has no owner attached to it, ignore it so the server doesn't crash!
      if (!device.user) {
        continue;
      }
      // 3. Check every rule against the specific device
      for (const rule of activeRules) {
        // // --- DYNAMIC MATCHING ENGINE ---
        // // If the rule specifies a model, brand, or category, it MUST match the user's device.
        // // If the rule field is null/empty, it counts as a match (e.g., a Global rule).

        // const matchesCategory = !rule.targetCategory || (device.category && device.category.toLowerCase() === rule.targetCategory.toLowerCase());
        // const matchesBrand = !rule.targetBrand || (device.brand && device.brand.toLowerCase() === rule.targetBrand.toLowerCase());
        // const matchesModel = !rule.targetModel || (device.model && device.model.toLowerCase() === rule.targetModel.toLowerCase());

        // --- DYNAMIC MATCHING ENGINE ---
        // Safely extract strings from the database fields your frontend actually uses
        const userCategory = device.category
          ? device.category.toLowerCase()
          : "";

        // Your frontend saves "Model / Brand" under deviceModel, and the name under deviceName
        const userMakeAndModel =
          `${device.deviceModel || ""} ${device.deviceName || ""}`.toLowerCase();

        // Check if the rule's target exists inside the user's device data
        const matchesCategory =
          !rule.targetCategory ||
          userCategory === rule.targetCategory.toLowerCase();

        // We use .includes() so if a user types "Apple iPhone", it still matches the "Apple" rule
        const matchesBrand =
          !rule.targetBrand ||
          userMakeAndModel.includes(rule.targetBrand.toLowerCase());
        const matchesModel =
          !rule.targetModel ||
          userMakeAndModel.includes(rule.targetModel.toLowerCase());

        // If all specified conditions match, this rule applies to this specific device!
        if (matchesCategory && matchesBrand && matchesModel) {
          // Check if a 'pending' task for this rule already exists so we don't spam the user
          const existingTask = await DeviceTask.findOne({
            device: device._id,
            taskName: rule.taskName,
            // status: "pending",
            // isComplete: false,
          });

          //   if (!existingTask) {
          //     // Create the task dynamically for this user's device
          //     await DeviceTask.create({
          //       userId: device.userId ,
          //       deviceId: device._id,
          //       taskName: rule.taskName,
          //       description: rule.description,
          //       type: rule.type,
          //       urgency: rule.urgency,
          //       status: "pending",
          //       dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
          //     });
          //     console.log(
          //       `✅ [CRON] Task '${rule.taskName}' generated for user's ${device.brand} ${device.model}`,
          //     );

          //     // FUTURE: Here you could also trigger the 'Notification' model to show the red UI badge
          //   }
          if (!existingTask) {
            // Automate the creation of the task (MATCHING YOUR EXACT SCHEMA)
            await DeviceTask.create({
              //   user: device.userId || device.userId, // Matches schema 'user'
              user: device.user,
              device: device._id, // Matches schema 'device'
              taskName: rule.taskName,
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
              isComplete: false, // Matches schema 'isComplete'
              frequencyMonths: rule.frequencyDays
                ? Math.max(1, Math.round(rule.frequencyDays / 30))
                : 0, // Matches schema requirement
              deviceCategory: device.category || "General", // Matches schema requirement
            });
            console.log(
              `✅ [CRON] Task '${rule.taskName}' generated for user's${device.deviceName} ${device.deviceModel}`,
            );
          }
        }
      }
    }
    console.log("🏁 [CRON] Dynamic Scan Complete.");
  } catch (error) {
    console.error("❌ [CRON] Engine Error:", error);
  }
};

const startAutomation = () => {
  // Run every minute for the presentation demo
  cron.schedule("* * * * *", () => {
    runMaintenanceAutomation();
  });
  console.log("🕒 Dynamic Automation Engine Started.");
};

module.exports = { startAutomation };
