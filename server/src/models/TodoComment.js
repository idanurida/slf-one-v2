// server/src/models/TodoComment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const TodoComment = sequelize.define('TodoComment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  todo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'todos',
      key: 'id'
    },
    comment: 'ID todo terkait'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user yang memberikan komentar'
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Isi komentar'
  },
  progress_update: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Update progress (%)'
  },
  file_attachment: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Path file attachment (jika ada)'
  },
  mentioned_users: {
    type: DataTypes.ARRAY(DataTypes.INTEGER) || DataTypes.JSONB || DataTypes.TEXT,
    allowNull: true,
    comment: 'Array user ID yang disebut dalam komentar'
  }
}, {
  timestamps: true,
  tableName: 'todo_comments',
  underscored: true
});

module.exports = TodoComment;