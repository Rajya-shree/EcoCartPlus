const asyncHandler = require("express-async-handler");
const DeviceTask = require("../models/deviceTaskModel");
const Notification = require("../models/notificationModel");

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
 * @desc    Mark a task as complete, create the next one, AND clean up notifications
 * @route   PUT /api/tasks/:id/complete
 * @access  Private
 */
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

const completeTask = asyncHandler(async (req, res) => {
  const task = await DeviceTask.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  // Verify ownership
  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("User not authorized");
  }

  // 1. Mark current task complete
  task.isComplete = true;
  task.completedAt = new Date();
  const updatedTask = await task.save();

  // 2. Cleanup associated notifications
  // This ensures the red dot in the Header disappears immediately
  await Notification.findOneAndDelete({ task: task._id });

  // 3. Create the next recurring task for Lifecycle Tracking
  if (task.frequencyMonths && task.frequencyMonths > 0) {
    const newDueDate = new Date();
    newDueDate.setMonth(newDueDate.getMonth() + task.frequencyMonths);

    await DeviceTask.create({
      device: task.device,
      user: task.user,
      taskName: task.taskName,
      dueDate: newDueDate,
      isComplete: false,
      frequencyMonths: task.frequencyMonths || 6,
      deviceCategory: task.deviceCategory,
    });
  }

  // 4. Send ONLY ONE response
  res.status(200).json(updatedTask);
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

  res.status(200).json(tasks);
});

module.exports = {
  getUpcomingTasks,
  completeTask,
  getTasksForDevice,
  getAllTasks,
};
