// server/src/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

/**
 * Get all users (superadmin only)
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getUsers = async (req, res) => {
  try {
    const { role, search, limit = 20, offset = 0 } = req.query;

    // Build where conditions
    const whereConditions = {};
    
    if (role) {
      whereConditions.role = role;
    }
    
    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { company: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where: whereConditions,
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      users: users.rows,
      total: users.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
};

/**
 * Get user by ID (superadmin only)
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Server error while fetching user' });
  }
};

/**
 * Create new user (superadmin only)
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.createUser = async (req, res) => {
  try {
    const { email, password, name, role, phone, company } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      password_hash: hashedPassword,
      name,
      role,
      phone: phone || null,
      company: company || null,
      is_active: true
    });

    // Remove password_hash from response
    const userData = user.toJSON();
    delete userData.password_hash;

    res.status(201).json({
      message: 'User created successfully',
      user: userData
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error while creating user' });
  }
};

/**
 * Update user (superadmin only)
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role, phone, company, is_active } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is being changed and already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Update user
    await user.update({
      email: email || user.email,
      name: name || user.name,
      role: role || user.role,
      phone: phone !== undefined ? phone : user.phone,
      company: company !== undefined ? company : user.company,
      is_active: is_active !== undefined ? is_active : user.is_active
    });

    // Remove password_hash from response
    const userData = user.toJSON();
    delete userData.password_hash;

    res.json({
      message: 'User updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error while updating user' });
  }
};

/**
 * Delete user (superadmin only)
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting superadmin users
    if (user.role === 'superadmin') {
      return res.status(400).json({ error: 'Cannot delete superadmin users' });
    }

    // Delete user
    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error while deleting user' });
  }
};

/**
 * Change password (authenticated users only)
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    // Get user with password
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check current password
    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // Update password
    await user.update({ password_hash: hashedPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error while changing password' });
  }
};

/**
 * Get current user profile
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
};

/**
 * Update current user profile
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.updateMyProfile = async (req, res) => {
  try {
    const { name, phone, company } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update profile
    await user.update({
      name: name || user.name,
      phone: phone !== undefined ? phone : user.phone,
      company: company !== undefined ? company : user.company
    });

    // Remove password_hash from response
    const userData = user.toJSON();
    delete userData.password_hash;

    res.json({
      message: 'Profile updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Update my profile error:', error);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  getMyProfile,
  updateMyProfile
};