const asyncHandler = require("express-async-handler");
const DeviceTask = require("../models/deviceTaskModel");
const Notification = require("../models/notificationModel");

const Device = require("../models/Device");
/**
 * @desc    Simulate an urgent manufacturer update for presentation purposes
 * @route   POST /api/tasks/admin/trigger-update
 * @access  Private
 */
const triggerAdminUpdate = asyncHandler(async (req, res) => {
  const { targetBrand, taskName, description, urgency } = req.body;

  // 1. Find ANY device owned by the logged-in user to attach the task to
  const userDevice = await Device.findOne({ user: req.user._id });

  if (!userDevice) {
    res.status(400);
    throw new Error(
      "You must log at least one device in your inventory first!",
    );
  }

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 1);

  // 2. Create a pending task due TODAY so it triggers an alert immediately
  const newTask = await DeviceTask.create({
    user: req.user._id,
    device: userDevice._id,
    taskName: taskName || "Emergency Firmware Patch",
    dueDate: new Date(), // Due right now
    isComplete: false,
    frequencyMonths: 0,
    deviceCategory: userDevice.category || "General",
    urgency: urgency || "High",
  });

  // 3. Manually trigger the Notification so it pops up instantly
  await Notification.create({
    user: req.user._id,
    task: newTask._id,
    message:
      description ||
      `URGENT: ${taskName} is required for your ${userDevice.deviceName}.`,
  });

  res
    .status(201)
    .json({ message: "Update simulated successfully", task: newTask });
});

// const completeTask = asyncHandler(async (req, res) => {
//   const task = await DeviceTask.findById(req.params.id);

//   if (!task) {
//     res.status(404);
//     throw new Error("Task not found");
//   }
//   // Verify the task belongs to the user
//   if (task.user.toString() !== req.user._id.toString()) {
//     res.status(401);
//     throw new Error("User not authorized");
//   }

//   task.isComplete = true;
//   await task.save();

//   res.status(200).json({ message: "Task marked as complete" });
//   if (task.user.toString() !== req.user._id.toString()) {
//     res.status(401);
//     throw new Error("User not authorized");
//   }

//   // 1. Mark current task complete
//   task.isComplete = true;
//   task.completedAt = new Date();
//   const updatedTask = await task.save();

//   // 🟢 2. NEW: Delete the notification associated with this task
//   // This ensures the red dot updates immediately in the Header
//   await Notification.findOneAndDelete({ task: task._id });

//   // 3. Create the next recurring task
//   const newDueDate = new Date();
//   newDueDate.setMonth(newDueDate.getMonth() + (task.frequencyMonths || 6));

//   await DeviceTask.create({
//     device: task.device,
//     user: task.user,
//     taskName: task.taskName,
//     dueDate: newDueDate,
//     isComplete: false,
//     frequencyMonths: task.frequencyMonths || 6,
//     deviceCategory: task.deviceCategory,
//   });

//   res.status(200).json(updatedTask);
// });

// const completeTask = asyncHandler(async (req, res) => {
//   const task = await DeviceTask.findById(req.params.id);

//   // if (!task) {
//   //   res.status(404);
//   //   throw new Error("Task not found");
//   // }
//   if (!task || task.user.toString() !== req.user._id.toString()) {
//     res.status(401);
//     throw new Error("Task not found or User not authorized");
//   }

//   // // Verify ownership
//   // if (task.user.toString() !== req.user._id.toString()) {
//   //   res.status(401);
//   //   throw new Error("User not authorized");
//   // }

//   // 1. Mark current task complete
//   task.isComplete = true;
//   task.completedAt = new Date();
//   const updatedTask = await task.save();

//   // 2. Cleanup associated notifications
//   // This ensures the red dot in the Header disappears immediately
//   await Notification.findOneAndDelete({ task: task._id });

//   // 3. Create the next recurring task for Lifecycle Tracking
//   if (task.frequencyMonths && task.frequencyMonths > 0) {
//     const newDueDate = new Date();
//     newDueDate.setMonth(newDueDate.getMonth() + task.frequencyMonths);

//     await DeviceTask.create({
//       device: task.device,
//       user: task.user,
//       taskName: task.taskName,
//       dueDate: newDueDate,
//       isComplete: false,
//       frequencyMonths: task.frequencyMonths || 6,
//       deviceCategory: task.deviceCategory,
//     });
//   }

//   // 4. Send ONLY ONE response
//   res.status(200).json(updatedTask);
// });
/**
 * @desc    Mark a task as complete, create the next one, AND clean up notifications
 * @route   PUT /api/tasks/:id/complete
 * @access  Private
 */
const completeTask = asyncHandler(async (req, res) => {
  const task = await DeviceTask.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  // 1. Mark current task complete and SAVE it
  task.isComplete = true;
  task.completedAt = new Date();
  const savedTask = await task.save(); //

  // 2. Cleanup associated notifications
  await Notification.findOneAndDelete({ task: task._id }); //

  // 3. SUCCESS LOGIC: Reduce "Screen Time" tasks if user is succeeding
  // (In a real app, you could add a 'mastery' field to the Device model)
  if (task.taskName.includes("Screen Time")) {
    console.log("Screen time task tracked for mastery.");
  }

  // 4. Send the response
  res.status(200).json(savedTask);
});

/**
 * @desc    Get all upcoming tasks AND create notifications for overdue tasks
 * @route   GET /api/tasks/upcoming
 * @access  Private
 */
const getUpcomingTasks = asyncHandler(async (req, res) => {
  // 🟢 1. Only fetch tasks that are NOT complete
  const tasks = await DeviceTask.find({
    user: req.user._id,
    isComplete: false,
  })
    .sort({ dueDate: 1 })
    .populate("device", "deviceName");

  const today = new Date();

  // 🟢 2. Handle Notifications for overdue tasks
  // Using Promise.all ensures we don't send the response until logic is checked
  await Promise.all(
    tasks.map(async (task) => {
      if (new Date(task.dueDate) < today) {
        try {
          const notificationExists = await Notification.findOne({
            user: req.user._id,
            task: task._id,
          });

          if (!notificationExists) {
            await Notification.create({
              user: req.user._id,
              task: task._id,
              message: `Task "${task.taskName}" for your ${task.device.deviceName} is overdue!`,
            });
          }
        } catch (err) {
          console.error("Notification Error:", err.message);
        }
      }
    }),
  );

  res.status(200).json(tasks);
});

/**
 * @desc    Get all tasks for a single device
 * @route   GET /api/tasks/device/:id
 * @access  Private
 */
const getTasksForDevice = asyncHandler(async (req, res) => {
  const tasks = await DeviceTask.find({
    user: req.user._id,
    device: req.params.id,
  }).sort({ dueDate: 1 });

  res.status(200).json(tasks);
});

/**
 * @desc    Get ALL tasks for the logged in user (pending and complete)
 * @route   GET /api/tasks
 * @access  Private
 */
const getAllTasks = asyncHandler(async (req, res) => {
  const tasks = await DeviceTask.find({ user: req.user._id })
    .sort({ dueDate: 1 })
    .populate("device", "deviceName");

  const today = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(today.getDate() + 3);

  // 🟢 Generate notifications for any task that is currently overdue
  await Promise.all(
    tasks.map(async (task) => {
      // Only notify if the task is NOT complete AND the due date is in the past
      // if (!task.isComplete && new Date(task.dueDate) < today) {
      if (!task.isComplete && new Date(task.dueDate) <= threeDaysFromNow) {
        try {
          const notificationExists = await Notification.findOne({
            user: req.user._id,
            task: task._id,
          });

          if (!notificationExists) {
            const isOverdue = new Date(task.dueDate) < today;
            await Notification.create({
              user: req.user._id,
              task: task._id,
              //message: `Task "${task.taskName}" for your ${task.device?.deviceName || "device"} is overdue!`,
              message: isOverdue
                ? `URGENT: Task "${task.taskName}" for your ${task.device?.deviceName || "device"} is overdue!`
                : `Upcoming: Task "${task.taskName}" for your ${task.device?.deviceName || "device"} is due soon.`,
            });
          }
        } catch (err) {
          console.error("Notification Error:", err.message);
        }
      }
    }),
  );

  res.status(200).json(tasks);
});

/**
 * @desc    Snooze a task (Push due date forward 4 days to exit the 3-day alert window)
 * @route   PUT /api/tasks/:id/snooze
 * @access  Private
 */
const snoozeTask = asyncHandler(async (req, res) => {
  const task = await DeviceTask.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  // 1. Push the due date forward by 4 days
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 4);
  task.dueDate = futureDate;
  await task.save();

  // 2. Delete the active notification so it disappears from the feed
  await Notification.findOneAndDelete({ task: task._id });

  res.status(200).json({ message: "Task snoozed for 24 hours", task });
});



module.exports = {
  getUpcomingTasks,
  completeTask,
  getTasksForDevice,
  getAllTasks,
  triggerAdminUpdate,
  snoozeTask,
};
