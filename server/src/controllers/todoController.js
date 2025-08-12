// server/src/controllers/todoController.js
const Todo = require('../models/Todo');
const TodoComment = require('../models/TodoComment');
const User = require('../models/User');
const Project = require('../models/Project');
const Inspection = require('../models/Inspection');
const Notification = require('../models/Notification');
const { Op } = require('sequelize');

/**
 * Get user's todos with filters
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getMyTodos = async (req, res) => {
  try {
    const { status, priority, due_date_from, due_date_to, search } = req.query;
    const userId = req.user.id;

    // Build where conditions
    const whereConditions = { assigned_to: userId };
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (priority) {
      whereConditions.priority = priority;
    }
    
    if (due_date_from || due_date_to) {
      whereConditions.due_date = {};
      if (due_date_from) {
        whereConditions.due_date[Op.gte] = new Date(due_date_from);
      }
      if (due_date_to) {
        whereConditions.due_date[Op.lte] = new Date(due_date_to);
      }
    }
    
    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const todos = await Todo.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'assigner',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'owner_name']
        },
        {
          model: Inspection,
          as: 'inspection',
          attributes: ['id', 'scheduled_date', 'status']
        }
      ],
      order: [
        ['priority', 'DESC'],
        ['due_date', 'ASC'],
        ['created_at', 'DESC']
      ]
    });

    res.json(todos);
  } catch (error) {
    console.error('Get my todos error:', error);
    res.status(500).json({ error: 'Server error while fetching todos' });
  }
};

/**
 * Get todos assigned by current user
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getAssignedTodos = async (req, res) => {
  try {
    const { status, priority, due_date_from, due_date_to, search } = req.query;
    const userId = req.user.id;

    // Build where conditions
    const whereConditions = { assigned_by: userId };
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (priority) {
      whereConditions.priority = priority;
    }
    
    if (due_date_from || due_date_to) {
      whereConditions.due_date = {};
      if (due_date_from) {
        whereConditions.due_date[Op.gte] = new Date(due_date_from);
      }
      if (due_date_to) {
        whereConditions.due_date[Op.lte] = new Date(due_date_to);
      }
    }
    
    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const todos = await Todo.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'assigner',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'owner_name']
        },
        {
          model: Inspection,
          as: 'inspection',
          attributes: ['id', 'scheduled_date', 'status']
        }
      ],
      order: [
        ['priority', 'DESC'],
        ['due_date', 'ASC'],
        ['created_at', 'DESC']
      ]
    });

    res.json(todos);
  } catch (error) {
    console.error('Get assigned todos error:', error);
    res.status(500).json({ error: 'Server error while fetching assigned todos' });
  }
};

/**
 * Create new todo
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.createTodo = async (req, res) => {
  try {
    const { title, description, assigned_to, project_id, inspection_id, due_date, priority, related_type, related_id } = req.body;
    const userId = req.user.id;

    // Validasi input
    if (!title || !assigned_to) {
      return res.status(400).json({ error: 'Title and assigned_to are required' });
    }

    // Cek apakah user yang ditugaskan ada
    const assignee = await User.findByPk(assigned_to);
    if (!assignee) {
      return res.status(404).json({ error: 'Assignee not found' });
    }

    // Buat todo
    const todo = await Todo.create({
      title,
      description: description || null,
      assigned_to: parseInt(assigned_to),
      assigned_by: userId,
      project_id: project_id ? parseInt(project_id) : null,
      inspection_id: inspection_id ? parseInt(inspection_id) : null,
      due_date: due_date ? new Date(due_date) : null,
      priority: priority || 'medium',
      status: 'pending',
      progress: 0,
      related_type: related_type || null,
      related_id: related_id ? parseInt(related_id) : null,
      action_required: true,
      action_url: related_type && related_id 
        ? `/dashboard/${assignee.role}/${related_type}/${related_id}` 
        : null
    });

    // Include related data
    todo.dataValues.assigner = req.user;
    todo.dataValues.assignee = assignee;
    
    if (project_id) {
      const project = await Project.findByPk(project_id);
      todo.dataValues.project = project;
    }
    
    if (inspection_id) {
      const inspection = await Inspection.findByPk(inspection_id);
      todo.dataValues.inspection = inspection;
    }

    // Kirim notifikasi ke assignee
    await Notification.create({
      user_id: assigned_to,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: "${title}" by ${req.user.name}`,
      priority: priority || 'medium',
      action_required: true,
      action_url: `/dashboard/${assignee.role}/todos/${todo.id}`
    });

    res.status(201).json(todo);
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Server error while creating todo' });
  }
};

/**
 * Update todo
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, progress, due_date, priority, cancellation_reason } = req.body;
    const userId = req.user.id;

    const todo = await Todo.findByPk(id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Validasi ownership
    if (todo.assigned_to !== userId && todo.assigned_by !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this todo' });
    }

    // Update todo
    await todo.update({
      title: title || todo.title,
      description: description !== undefined ? description : todo.description,
      status: status || todo.status,
      progress: progress !== undefined ? parseInt(progress) : todo.progress,
      due_date: due_date ? new Date(due_date) : todo.due_date,
      priority: priority || todo.priority,
      cancellation_reason: cancellation_reason || todo.cancellation_reason
    });

    // Jika status completed, update completed_at
    if (status === 'completed' && !todo.completed_at) {
      await todo.update({
        completed_at: new Date()
      });
    }

    // Jika status cancelled, update cancelled_at
    if (status === 'cancelled' && !todo.cancelled_at) {
      await todo.update({
        cancelled_at: new Date()
      });
    }

    // Kirim notifikasi ke assigner jika status berubah
    if (status && status !== todo.status) {
      const assigner = await User.findByPk(todo.assigned_by);
      if (assigner) {
        await Notification.create({
          user_id: todo.assigned_by,
          title: 'Task Status Updated',
          message: `Task "${todo.title}" status changed to ${status} by ${req.user.name}`,
          priority: 'medium',
          action_required: false,
          action_url: `/dashboard/${assigner.role}/todos/${todo.id}`
        });
      }
    }

    res.json(todo);
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Server error while updating todo' });
  }
};

/**
 * Delete todo
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const todo = await Todo.findByPk(id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Validasi ownership
    if (todo.assigned_to !== userId && todo.assigned_by !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this todo' });
    }

    // Hapus todo
    await todo.destroy();

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Server error while deleting todo' });
  }
};

/**
 * Get todo comments
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getTodoComments = async (req, res) => {
  try {
    const { todoId } = req.params;

    const todo = await Todo.findByPk(todoId);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Validasi access
    if (todo.assigned_to !== req.user.id && todo.assigned_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this todo comments' });
    }

    const comments = await TodoComment.findAll({
      where: { todo_id: todoId },
      include: [{
        model: User,
        as: 'commenter',
        attributes: ['id', 'name', 'email', 'role']
      }],
      order: [['created_at', 'ASC']]
    });

    res.json(comments);
  } catch (error) {
    console.error('Get todo comments error:', error);
    res.status(500).json({ error: 'Server error while fetching todo comments' });
  }
};

/**
 * Add todo comment
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.addTodoComment = async (req, res) => {
  try {
    const { todoId } = req.params;
    const { comment, progress_update } = req.body;
    const userId = req.user.id;

    const todo = await Todo.findByPk(todoId);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Validasi access
    if (todo.assigned_to !== userId && todo.assigned_by !== userId) {
      return res.status(403).json({ error: 'Not authorized to comment on this todo' });
    }

    // Buat comment
    const todoComment = await TodoComment.create({
      todo_id: parseInt(todoId),
      user_id: userId,
      comment: comment || '',
      progress_update: progress_update ? parseInt(progress_update) : null
    });

    // Update todo progress jika ada
    if (progress_update !== undefined) {
      await todo.update({
        progress: parseInt(progress_update)
      });
    }

    // Include commenter data
    todoComment.dataValues.commenter = req.user;

    // Kirim notifikasi ke assigner/assignee
    const recipientId = todo.assigned_to === userId ? todo.assigned_by : todo.assigned_to;
    const recipient = await User.findByPk(recipientId);
    
    if (recipient) {
      await Notification.create({
        user_id: recipientId,
        title: 'New Comment on Task',
        message: `${req.user.name} commented on task "${todo.title}": ${comment.substring(0, 50)}...`,
        priority: 'medium',
        action_required: true,
        action_url: `/dashboard/${recipient.role}/todos/${todoId}`
      });
    }

    res.status(201).json(todoComment);
  } catch (error) {
    console.error('Add todo comment error:', error);
    res.status(500).json({ error: 'Server error while adding todo comment' });
  }
};

/**
 * Get todo statistics
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getTodoStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get my todos stats
    const myTodos = await Todo.findAll({
      where: { assigned_to: userId }
    });

    const assignedTodos = await Todo.findAll({
      where: { assigned_by: userId }
    });

    const stats = {
      myTodos: {
        total: myTodos.length,
        pending: myTodos.filter(t => t.status === 'pending').length,
        inProgress: myTodos.filter(t => t.status === 'in_progress').length,
        completed: myTodos.filter(t => t.status === 'completed').length,
        cancelled: myTodos.filter(t => t.status === 'cancelled').length,
        overdue: myTodos.filter(t => 
          t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
        ).length
      },
      assignedTodos: {
        total: assignedTodos.length,
        pending: assignedTodos.filter(t => t.status === 'pending').length,
        inProgress: assignedTodos.filter(t => t.status === 'in_progress').length,
        completed: assignedTodos.filter(t => t.status === 'completed').length,
        cancelled: assignedTodos.filter(t => t.status === 'cancelled').length
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Get todo stats error:', error);
    res.status(500).json({ error: 'Server error while fetching todo statistics' });
  }
};

module.exports = {
  getMyTodos,
  getAssignedTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  getTodoComments,
  addTodoComment,
  getTodoStats
};