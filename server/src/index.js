// server/src/index.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sequelize = require('./database/connection');
const routes = require('./routes/index');

const app = express();

// Security middleware
app.use(helmet());

// CORS
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin, credentials: true }));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parser
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'SLF One Manager API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Setup database and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Load all models (this registers them with sequelize)
    require('./models/User');
    require('./models/Project');
    require('./models/Inspection');
    require('./models/ChecklistItem');
    require('./models/ChecklistResponse');
    require('./models/SimakItem');
    require('./models/SimakResponse');
    require('./models/Photo');
    require('./models/Report');
    require('./models/Payment');
    require('./models/Document');
    require('./models/Approval');
    require('./models/Notification');
    require('./models/Todo');
    require('./models/TodoComment');

    // Set up associations
    setupAssociations();

    // Sync database
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database models synchronized');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

function setupAssociations() {
  const User = sequelize.model('User');
  const Project = sequelize.model('Project');
  const Inspection = sequelize.model('Inspection');
  const ChecklistItem = sequelize.model('ChecklistItem');
  const ChecklistResponse = sequelize.model('ChecklistResponse');
  const SimakItem = sequelize.model('SimakItem');
  const SimakResponse = sequelize.model('SimakResponse');
  const Photo = sequelize.model('Photo');
  const Report = sequelize.model('Report');
  const Payment = sequelize.model('Payment');
  const Document = sequelize.model('Document');
  const Approval = sequelize.model('Approval');
  const Notification = sequelize.model('Notification');
  const Todo = sequelize.model('Todo');
  const TodoComment = sequelize.model('TodoComment');

  // User associations
  User.hasMany(Project, { foreignKey: 'project_lead_id', as: 'ledProjects' });
  User.hasMany(Project, { foreignKey: 'client_id', as: 'clientProjects' });
  User.hasMany(Inspection, { foreignKey: 'inspector_id', as: 'inspectionsAsInspector' });
  User.hasMany(Inspection, { foreignKey: 'drafter_id', as: 'inspectionsAsDrafter' });
  User.hasMany(Inspection, { foreignKey: 'project_lead_id', as: 'inspectionsAsProjectLead' });
  User.hasMany(ChecklistResponse, { foreignKey: 'user_id', as: 'checklistResponses' });
  User.hasMany(SimakResponse, { foreignKey: 'user_id', as: 'simakResponses' });
  User.hasMany(Photo, { foreignKey: 'uploaded_by', as: 'uploadedPhotos' });
  User.hasMany(Report, { foreignKey: 'generated_by', as: 'generatedReports' });
  User.hasMany(Report, { foreignKey: 'reviewed_by', as: 'reviewedReports' });
  User.hasMany(Payment, { foreignKey: 'verified_by', as: 'verifiedPayments' });
  User.hasMany(Document, { foreignKey: 'uploaded_by', as: 'uploadedDocuments' });
  User.hasMany(Document, { foreignKey: 'verified_by', as: 'verifiedDocuments' });
  User.hasMany(Approval, { foreignKey: 'user_id', as: 'approvals' });
  User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
  User.hasMany(Todo, { foreignKey: 'assigned_to', as: 'assignedTodos' });
  User.hasMany(Todo, { foreignKey: 'assigned_by', as: 'createdTodos' });

  // Project associations
  Project.belongsTo(User, { foreignKey: 'project_lead_id', as: 'projectLead' });
  Project.belongsTo(User, { foreignKey: 'client_id', as: 'client' });
  Project.hasMany(Inspection, { foreignKey: 'project_id', as: 'inspections' });
  Project.hasMany(ChecklistResponse, { foreignKey: 'project_id', as: 'checklistResponses' });
  Project.hasMany(SimakResponse, { foreignKey: 'project_id', as: 'simakResponses' });
  Project.hasMany(Photo, { foreignKey: 'project_id', as: 'photos' });
  Project.hasMany(Report, { foreignKey: 'project_id', as: 'reports' });
  Project.hasMany(Payment, { foreignKey: 'project_id', as: 'payments' });
  Project.hasMany(Document, { foreignKey: 'project_id', as: 'documents' });
  Project.hasMany(Approval, { foreignKey: 'project_id', as: 'approvals' });
  Project.hasMany(Notification, { foreignKey: 'related_project_id', as: 'projectNotifications' });
  Project.hasMany(Todo, { foreignKey: 'project_id', as: 'todos' });

  // Inspection associations
  Inspection.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
  Inspection.belongsTo(User, { foreignKey: 'inspector_id', as: 'inspector' });
  Inspection.belongsTo(User, { foreignKey: 'drafter_id', as: 'drafter' });
  Inspection.belongsTo(User, { foreignKey: 'project_lead_id', as: 'projectLead' });
  Inspection.hasMany(ChecklistResponse, { foreignKey: 'inspection_id', as: 'checklistResponses' });
  Inspection.hasMany(SimakResponse, { foreignKey: 'inspection_id', as: 'simakResponses' });
  Inspection.hasMany(Photo, { foreignKey: 'inspection_id', as: 'photos' });
  Inspection.hasMany(Report, { foreignKey: 'inspection_id', as: 'reports' });
  Inspection.hasMany(Todo, { foreignKey: 'inspection_id', as: 'todos' });

  // ChecklistItem associations
  ChecklistItem.hasMany(ChecklistResponse, { foreignKey: 'checklist_item_id', as: 'responses' });

  // ChecklistResponse associations
  ChecklistResponse.belongsTo(Inspection, { foreignKey: 'inspection_id', as: 'inspection' });
  ChecklistResponse.belongsTo(ChecklistItem, { foreignKey: 'checklist_item_id', as: 'checklistItem' });
  ChecklistResponse.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // SimakItem associations
  SimakItem.hasMany(SimakResponse, { foreignKey: 'simak_item_id', as: 'responses' });

  // SimakResponse associations
  SimakResponse.belongsTo(Inspection, { foreignKey: 'inspection_id', as: 'inspection' });
  SimakResponse.belongsTo(SimakItem, { foreignKey: 'simak_item_id', as: 'simakItem' });
  SimakResponse.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Photo associations
  Photo.belongsTo(Inspection, { foreignKey: 'inspection_id', as: 'inspection' });
  Photo.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });
  Photo.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

  // Report associations
  Report.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
  Report.belongsTo(Inspection, { foreignKey: 'inspection_id', as: 'inspection' });
  Report.belongsTo(User, { foreignKey: 'generated_by', as: 'generator' });
  Report.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });
  Report.hasMany(Approval, { foreignKey: 'report_id', as: 'approvals' });

  // Payment associations
  Payment.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
  Payment.belongsTo(User, { foreignKey: 'verified_by', as: 'verifier' });

  // Document associations
  Document.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
  Document.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });
  Document.belongsTo(User, { foreignKey: 'verified_by', as: 'verifier' });

  // Approval associations
  Approval.belongsTo(Report, { foreignKey: 'report_id', as: 'report' });
  Approval.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Approval.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

  // Notification associations
  Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Notification.belongsTo(Project, { foreignKey: 'related_project_id', as: 'relatedProject' });

  // Todo associations
  Todo.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });
  Todo.belongsTo(User, { foreignKey: 'assigned_by', as: 'assigner' });
  Todo.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
  Todo.belongsTo(Inspection, { foreignKey: 'inspection_id', as: 'inspection' });
  Todo.hasMany(TodoComment, { foreignKey: 'todo_id', as: 'comments' });

  // TodoComment associations
  TodoComment.belongsTo(Todo, { foreignKey: 'todo_id', as: 'todo' });
  TodoComment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  console.log('✅ Database associations defined successfully');
}

startServer();

module.exports = app;
