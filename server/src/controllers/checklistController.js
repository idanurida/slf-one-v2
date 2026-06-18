// server/src/controllers/checklistController.js
const ChecklistItem = require('../models/ChecklistItem');
const ChecklistResponse = require('../models/ChecklistResponse');
const Inspection = require('../models/Inspection');

/**
 * Get checklist items with optional filtering
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getChecklistItems = async (req, res) => {
  try {
    const { category, applicable_for } = req.query;

    const whereConditions = { is_active: true };
    if (category) {
      whereConditions.category = category;
    }

    let items;
    if (applicable_for) {
      const allItems = await ChecklistItem.findAll({
        where: whereConditions,
        order: [['code', 'ASC']]
      });
      
      items = allItems.filter(item => {
        if (!item.applicable_for || item.applicable_for.length === 0) {
          return true;
        }
        return item.applicable_for.includes(applicable_for);
      });
    } else {
      items = await ChecklistItem.findAll({
        where: whereConditions,
        order: [['code', 'ASC']]
      });
    }

    res.json(items);
  } catch (error) {
    console.error('Get checklist items error:', error);
    res.status(500).json({ error: 'Server error while fetching checklist items' });
  }
};

/**
 * Get checklist item by ID
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getChecklistItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await ChecklistItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get checklist item error:', error);
    res.status(500).json({ error: 'Server error while fetching checklist item' });
  }
};

/**
 * Add checklist response for inspection
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.addChecklistResponse = async (req, res) => {
  try {
    const { inspectionId } = req.params;
    const { checklist_item_id, sample_number, response_data } = req.body;

    // Verify inspection exists
    const inspection = await Inspection.findByPk(inspectionId);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    // Verify checklist item exists
    const checklistItem = await ChecklistItem.findByPk(checklist_item_id);
    if (!checklistItem) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }

    // Check if response already exists
    const existingResponse = await ChecklistResponse.findOne({
      where: {
        inspection_id: inspectionId,
        checklist_item_id: checklist_item_id,
        sample_number: sample_number || null
      }
    });

    if (existingResponse) {
      return res.status(400).json({ error: 'Checklist response already exists for this item and sample' });
    }

    // Create checklist response
    const response = await ChecklistResponse.create({
      inspection_id: parseInt(inspectionId),
      checklist_item_id: checklist_item_id,
      sample_number: sample_number || null,
      response_data: response_data || {}
    });

    res.status(201).json(response);
  } catch (error) {
    console.error('Add checklist response error:', error);
    res.status(500).json({ error: 'Server error while adding checklist response' });
  }
};

/**
 * Get checklist responses for inspection
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getChecklistResponses = async (req, res) => {
  try {
    const { inspectionId } = req.params;

    const inspection = await Inspection.findByPk(inspectionId);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    const responses = await ChecklistResponse.findAll({
      where: { inspection_id: inspectionId },
      include: [{
        model: ChecklistItem,
        as: 'checklistItem',
        attributes: ['id', 'code', 'category', 'description', 'column_config']
      }],
      order: [['created_at', 'ASC']]
    });

    res.json(responses);
  } catch (error) {
    console.error('Get checklist responses error:', error);
    res.status(500).json({ error: 'Server error while fetching checklist responses' });
  }
};

// All functions exported via exports.XXX = pattern above