// client/src/utils/helpers.js

/**
 * Format currency to IDR
 * @param {number} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format date to Indonesian format
 * @param {string|Date} date 
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID');
};

/**
 * Format datetime to Indonesian format
 * @param {string|Date} datetime 
 * @returns {string}
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return '-';
  return new Date(datetime).toLocaleString('id-ID');
};

/**
 * Capitalize first letter of each word
 * @param {string} str 
 * @returns {string}
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Truncate text with ellipsis
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

/**
 * Generate unique ID
 * @returns {string}
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Validate email format
 * @param {string} email 
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validate phone number (Indonesian format)
 * @param {string} phone 
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
  const re = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
  return re.test(String(phone).replace(/\s+/g, ''));
};

/**
 * Convert status to badge color
 * @param {string} status 
 * @returns {string}
 */
export const getStatusColor = (status) => {
  const colors = {
    draft: 'gray',
    quotation_sent: 'yellow',
    quotation_accepted: 'orange',
    contract_signed: 'purple',
    spk_issued: 'blue',
    spk_accepted: 'teal',
    inspection_scheduled: 'cyan',
    inspection_in_progress: 'orange',
    inspection_done: 'green',
    report_draft: 'yellow',
    report_reviewed: 'orange',
    report_sent_to_client: 'purple',
    waiting_gov_response: 'pink',
    slf_issued: 'green',
    completed: 'green',
    cancelled: 'red',
    pending: 'yellow',
    verified: 'green',
    rejected: 'red',
    approved: 'green',
    in_progress: 'orange',
    scheduled: 'yellow',
    delayed: 'orange'
  };
  
  return colors[status] || 'gray';
};

/**
 * Get file icon based on file type
 * @param {string} fileType 
 * @returns {string}
 */
export const getFileIcon = (fileType) => {
  const icons = {
    'application/pdf': '📄',
    'image/jpeg': '🖼️',
    'image/png': '🖼️',
    'image/gif': '🖼️',
    'application/msword': '📝',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
    'application/vnd.ms-excel': '📊',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
    'text/plain': '📝',
    'default': '📁'
  };
  
  return icons[fileType] || icons.default;
};

/**
 * Calculate progress percentage
 * @param {number} current 
 * @param {number} total 
 * @returns {number}
 */
export const calculateProgress = (current, total) => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

/**
 * Convert bytes to human readable format
 * @param {number} bytes 
 * @param {number} decimals 
 * @returns {string}
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Check if object is empty
 * @param {object} obj 
 * @returns {boolean}
 */
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Deep clone object
 * @param {object} obj 
 * @returns {object}
 */
export const deepClone = (obj) => {
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

/**
 * Paginate array
 * @param {Array} array 
 * @param {number} page 
 * @param {number} limit 
 * @returns {object}
 */
export const paginateArray = (array, page = 1, limit = 10) => {
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

/**
 * Sleep function for async operations
 * @param {number} ms 
 * @returns {Promise}
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Mask sensitive data (e.g., phone number, email)
 * @param {string} data 
 * @param {string} type 
 * @returns {string}
 */
export const maskData = (data, type) => {
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

export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  capitalizeWords,
  truncateText,
  generateId,
  validateEmail,
  validatePhone,
  getStatusColor,
  getFileIcon,
  calculateProgress,
  formatBytes,
  isEmpty,
  deepClone,
  paginateArray,
  sleep,
  maskData
};