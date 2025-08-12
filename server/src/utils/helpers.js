// server/src/utils/helpers.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs-extra');
const path = require('path');

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const formatDateISO = (date) => {
  return date ? new Date(date).toISOString() : null;
};

const calculateAge = (dob) => {
  if (!dob) return 0;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const validatePhone = (phone) => {
  const re = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
  return re.test(String(phone).replace(/\s+/g, ''));
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const generateRandomString = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const ensureDirectory = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

const moveFile = async (oldPath, newPath) => {
  await fs.rename(oldPath, newPath);
};

const copyFile = async (sourcePath, destPath) => {
  await fs.copyFile(sourcePath, destPath);
};

const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

const isEmpty = (obj) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const clonedObj = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

const paginateArray = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
     array.slice(startIndex, endIndex),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(array.length / limit),
      totalItems: array.length,
      itemsPerPage: limit
    }
  };
};

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const maskData = (data, type) => {
  if (!data) return '';
  
  switch (type) {
    case 'phone':
      return data.replace(/.(?=.{4})/g, '*');
    case 'email':
      const [name, domain] = data.split('@');
      if (name.length <= 2) {
        return `*${name.slice(-1)}@${domain}`;
      }
      return `${name[0]}***${name.slice(-1)}@${domain}`;
    default:
      return data.replace(/.(?=.{4})/g, '*');
  }
};

module.exports = {
  generateId,
  formatDateISO,
  calculateAge,
  validateEmail,
  validatePhone,
  formatCurrency,
  formatBytes,
  generateRandomString,
  ensureDirectory,
  deleteFile,
  moveFile,
  copyFile,
  getFileExtension,
  isEmpty,
  deepClone,
  paginateArray,
  sleep,
  maskData
};