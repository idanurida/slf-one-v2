// server/src/database/connection.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'slf_one_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1); // Exit if database connection fails
  }
};

// Export sequelize early to avoid circular dependency with models
module.exports = sequelize;

// Import models
const User = require('../models/User');
const Project = require('../models/Project');
const Inspection = require('../models/Inspection');
const ChecklistItem = require('../models/ChecklistItem');
const ChecklistResponse = require('../models/ChecklistResponse');
const SimakItem = require('../models/SimakItem');
const SimakResponse = require('../models/SimakResponse');
const Photo = require('../models/Photo');
const Report = require('../models/Report');
const Payment = require('../models/Payment');
const Document = require('../models/Document');
const Approval = require('../models/Approval');
const Notification = require('../models/Notification');

// Define associations
try {
  // User associations
  User.hasMany(Project, { 
    foreignKey: 'project_lead_id', 
    as: 'ledProjects' 
  });
  
  User.hasMany(Project, { 
    foreignKey: 'client_id', 
    as: 'clientProjects' 
  });
  
  User.hasMany(Inspection, { 
    foreignKey: 'inspector_id', 
    as: 'inspectionsAsInspector' 
  });
  
  User.hasMany(Inspection, { 
    foreignKey: 'drafter_id', 
    as: 'inspectionsAsDrafter' 
  });
  
  User.hasMany(Inspection, { 
    foreignKey: 'project_lead_id', 
    as: 'inspectionsAsProjectLead' 
  });
  
  User.hasMany(ChecklistResponse, { 
    foreignKey: 'user_id', 
    as: 'checklistResponses' 
  });
  
  User.hasMany(SimakResponse, { 
    foreignKey: 'user_id', 
    as: 'simakResponses' 
  });
  
  User.hasMany(Photo, { 
    foreignKey: 'uploaded_by', 
    as: 'uploadedPhotos' 
  });
  
  User.hasMany(Report, { 
    foreignKey: 'generated_by', 
    as: 'generatedReports' 
  });
  
  User.hasMany(Report, { 
    foreignKey: 'reviewed_by', 
    as: 'reviewedReports' 
  });
  
  User.hasMany(Payment, { 
    foreignKey: 'verified_by', 
    as: 'verifiedPayments' 
  });
  
  User.hasMany(Document, { 
    foreignKey: 'uploaded_by', 
    as: 'uploadedDocuments' 
  });
  
  User.hasMany(Document, { 
    foreignKey: 'verified_by', 
    as: 'verifiedDocuments' 
  });
  
  User.hasMany(Approval, { 
    foreignKey: 'user_id', 
    as: 'approvals' 
  });
  
  User.hasMany(Notification, { 
    foreignKey: 'user_id', 
    as: 'notifications' 
  });

  // Project associations
  Project.belongsTo(User, { 
    foreignKey: 'project_lead_id', 
    as: 'projectLead' 
  });
  
  Project.belongsTo(User, { 
    foreignKey: 'client_id', 
    as: 'client' 
  });
  
  Project.hasMany(Inspection, { 
    foreignKey: 'project_id', 
    as: 'inspections' 
  });
  
  Project.hasMany(ChecklistResponse, { 
    foreignKey: 'project_id', 
    as: 'checklistResponses' 
  });
  
  Project.hasMany(SimakResponse, { 
    foreignKey: 'project_id', 
    as: 'simakResponses' 
  });
  
  Project.hasMany(Photo, { 
    foreignKey: 'project_id', 
    as: 'photos' 
  });
  
  Project.hasMany(Report, { 
    foreignKey: 'project_id', 
    as: 'reports' 
  });
  
  Project.hasMany(Payment, { 
    foreignKey: 'project_id', 
    as: 'payments' 
  });
  
  Project.hasMany(Document, { 
    foreignKey: 'project_id', 
    as: 'documents' 
  });
  
  Project.hasMany(Approval, { 
    foreignKey: 'project_id', 
    as: 'approvals' 
  });
  
  Project.hasMany(Notification, { 
    foreignKey: 'related_project_id', 
    as: 'projectNotifications' 
  });

  // Inspection associations
  Inspection.belongsTo(Project, { 
    foreignKey: 'project_id', 
    as: 'project' 
  });
  
  Inspection.belongsTo(User, { 
    foreignKey: 'inspector_id', 
    as: 'inspector' 
  });
  
  Inspection.belongsTo(User, { 
    foreignKey: 'drafter_id', 
    as: 'drafter' 
  });
  
  Inspection.belongsTo(User, { 
    foreignKey: 'project_lead_id', 
    as: 'projectLead' 
  });
  
  Inspection.hasMany(ChecklistResponse, { 
    foreignKey: 'inspection_id', 
    as: 'checklistResponses' 
  });
  
  Inspection.hasMany(SimakResponse, { 
    foreignKey: 'inspection_id', 
    as: 'simakResponses' 
  });
  
  Inspection.hasMany(Photo, { 
    foreignKey: 'inspection_id', 
    as: 'photos' 
  });
  
  Inspection.hasMany(Report, { 
    foreignKey: 'inspection_id', 
    as: 'reports' 
  });

  // ChecklistItem associations
  ChecklistItem.hasMany(ChecklistResponse, { 
    foreignKey: 'checklist_item_id', 
    as: 'responses' 
  });

  // ChecklistResponse associations
  ChecklistResponse.belongsTo(Inspection, { 
    foreignKey: 'inspection_id', 
    as: 'inspection' 
  });
  
  ChecklistResponse.belongsTo(ChecklistItem, { 
    foreignKey: 'checklist_item_id', 
    as: 'checklistItem' 
  });
  
  ChecklistResponse.belongsTo(User, { 
    foreignKey: 'user_id', 
    as: 'user' 
  });

  // SimakItem associations
  SimakItem.hasMany(SimakResponse, { 
    foreignKey: 'simak_item_id', 
    as: 'responses' 
  });

  // SimakResponse associations
  SimakResponse.belongsTo(Inspection, { 
    foreignKey: 'inspection_id', 
    as: 'inspection' 
  });
  
  SimakResponse.belongsTo(SimakItem, { 
    foreignKey: 'simak_item_id', 
    as: 'simakItem' 
  });
  
  SimakResponse.belongsTo(User, { 
    foreignKey: 'user_id', 
    as: 'user' 
  });

  // Photo associations
  Photo.belongsTo(Inspection, { 
    foreignKey: 'inspection_id', 
    as: 'inspection' 
  });
  
  Photo.belongsTo(User, { 
    foreignKey: 'uploaded_by', 
    as: 'uploader' 
  });
  
  Photo.belongsTo(Project, { 
    foreignKey: 'project_id', 
    as: 'project' 
  });

  // Report associations
  Report.belongsTo(Project, { 
    foreignKey: 'project_id', 
    as: 'project' 
  });
  
  Report.belongsTo(Inspection, { 
    foreignKey: 'inspection_id', 
    as: 'inspection' 
  });
  
  Report.belongsTo(User, { 
    foreignKey: 'generated_by', 
    as: 'generator' 
  });
  
  Report.belongsTo(User, { 
    foreignKey: 'reviewed_by', 
    as: 'reviewer' 
  });
  
  Report.hasMany(Approval, { 
    foreignKey: 'report_id', 
    as: 'approvals' 
  });

  // Payment associations
  Payment.belongsTo(Project, { 
    foreignKey: 'project_id', 
    as: 'project' 
  });
  
  Payment.belongsTo(User, { 
    foreignKey: 'verified_by', 
    as: 'verifier' 
  });

  // Document associations
  Document.belongsTo(Project, { 
    foreignKey: 'project_id', 
    as: 'project' 
  });
  
  Document.belongsTo(User, { 
    foreignKey: 'uploaded_by', 
    as: 'uploader' 
  });
  
  Document.belongsTo(User, { 
    foreignKey: 'verified_by', 
    as: 'verifier' 
  });

  // Approval associations
  Approval.belongsTo(Report, { 
    foreignKey: 'report_id', 
    as: 'report' 
  });
  
  Approval.belongsTo(User, { 
    foreignKey: 'user_id', 
    as: 'user' 
  });
  
  Approval.belongsTo(Project, { 
    foreignKey: 'project_id', 
    as: 'project' 
  });

  // Notification associations
  Notification.belongsTo(User, { 
    foreignKey: 'user_id', 
    as: 'user' 
  });
  
  Notification.belongsTo(Project, { 
    foreignKey: 'related_project_id', 
    as: 'relatedProject' 
  });

  console.log('✅ Database associations defined successfully');

} catch (error) {
  console.error('❌ Error defining database associations:', error);
  process.exit(1); // Exit if association definition fails
}

// Sync models
const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
  } catch (error) {
    console.error('❌ Error synchronizing database models:', error);
    process.exit(1); // Exit if model sync fails
  }
};
