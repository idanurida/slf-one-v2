// server/src/routes/todos.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMyTodos,
  getAssignedTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  getTodoComments,
  addTodoComment,
  getTodoStats
} = require('../controllers/todoController');

// Get todos
router.get('/my-todos', protect, getMyTodos);
router.get('/assigned-todos', protect, getAssignedTodos);

// Todo management
router.post('/', protect, createTodo);
router.put('/:id', protect, updateTodo);
router.delete('/:id', protect, deleteTodo);

// Todo comments
router.get('/:todoId/comments', protect, getTodoComments);
router.post('/:todoId/comments', protect, addTodoComment);

// Todo statistics
router.get('/stats', protect, getTodoStats);

module.exports = router;