const asyncHandler = require("express-async-handler");
const DeviceTask = require("../models/deviceTaskModel");
const Notification = require("../models/notificationModel");

/**
 * @desc    Get all upcoming tasks AND create notifications for overdue tasks
 * @route   GET /api/tasks/upcoming
 * @access  Private
 */
const getUpcomingTasks = asyncHandler(async (req, res) => {
  const tasks = await DeviceTask.find({
    user: req.user._id,
    isComplete: false,
  })
    .sort({ dueDate: 1 })
    .populate("device", "deviceName");

  // --- NEW NOTIFICATION LOGIC ---
  const today = new Date();

  // We do this in parallel so it doesn't slow down the request
  Promise.all(
    tasks.map(async (task) => {
      // Is the task overdue?
      if (task.dueDate < today) {
        try {
          // Check if a notification for this task *already exists*
          const notificationExists = await Notification.findOne({
            user: req.user._id,
            task: task._id,
          });

          // If it doesn't exist, create one!
          if (!notificationExists) {
            await Notification.create({
              user: req.user._id,
              task: task._id,
              message: `Task "${task.taskName}" for your ${task.device.deviceName} is overdue!`,
            });
          }
        } catch (err) {
          // We console.log the error but don't stop the main function
          // This prevents a crash if a duplicate notification tries to create
          console.error("Error creating notification:", err.message);
        }
      }
    })
  );
  // --- END OF NEW LOGIC ---

  res.status(200).json(tasks);
});

/**
 * @desc    Mark a task as complete and create the next one
 * @route   PUT /api/tasks/:id/complete
 * @access  Private
 */
const completeTask = asyncHandler(async (req, res) => {
  const task = await DeviceTask.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  // Check that the task belongs to the logged-in user
  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("User not authorized");
  }

  // 1. Mark the current task as complete
  task.isComplete = true;
  task.completedAt = new Date();
  const updatedTask = await task.save();

  // 2. Create the *next* recurring task
  const newDueDate = new Date(); // Start from today
  newDueDate.setMonth(newDueDate.getMonth() + task.frequencyMonths);

  await DeviceTask.create({
    device: task.device,
    user: task.user,
    taskName: task.taskName,
    dueDate: newDueDate,
    isComplete: false,
    frequencyMonths: task.frequencyMonths,
    deviceCategory: task.deviceCategory,
  });

  res.status(200).json(updatedTask);
});

// ... (at the bottom, before module.exports)

/**
 * @desc    Get all tasks for a single device
 * @route   GET /api/tasks/device/:id
 * @access  Private
 */
const getTasksForDevice = asyncHandler(async (req, res) => {
  const tasks = await DeviceTask.find({
    user: req.user._id,
    device: req.params.id, // Get tasks for this specific device
  }).sort({ dueDate: 1 }); // Sort by due date

  res.status(200).json(tasks);
});

module.exports = {
  getUpcomingTasks,
  completeTask,
  getTasksForDevice,
};
