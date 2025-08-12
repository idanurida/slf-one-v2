// server/src/seeds/checklistTemplateSeeder.js
const fs = require('fs').promises;
const path = require('path');
const ChecklistItem = require('../models/ChecklistItem');

const seedChecklistTemplates = async () => {
  try {
    console.log('🌱 Seeding checklist templates...');

    // Check if already seeded
    const existingCount = await ChecklistItem.count();
    if (existingCount > 0) {
      console.log(`✅ Already have ${existingCount} checklist items. Skipping seeding.`);
      return;
    }

    // Read template file
    const templatePath = path.join(__dirname, '../data/checklist_templates.json');
    const rawData = await fs.readFile(templatePath, 'utf8');
    const checklistData = JSON.parse(rawData);

    console.log(`📄 Template loaded from ${templatePath}`);
    console.log(`📊 Found ${checklistData.checklist_templates.length} templates`);

    const itemsToCreate = [];

    // Process each template
    for (const template of checklistData.checklist_templates) {
      const { id: template_id, title, category, applicable_for: template_applicable_for, subsections = [], items: direct_items = [] } = template;

      console.log(`📦 Processing template: ${title} (${template_id})`);

      // Process subsections if they exist
      for (const subsection of subsections) {
        const { id: subsection_id, title: subsection_title, applicable_for: subsection_applicable_for, items = [] } = subsection;
        
        const effective_applicable_for = subsection_applicable_for || template_applicable_for || [];
        
        console.log(`  └── Subsection: ${subsection_title} (${subsection_id}), Applicable for: [${effective_applicable_for.join(', ')}]`);

        for (const item of items) {
          const { id, item_name, columns } = item;
          
          if (!id || !item_name || !columns) {
            console.warn(`    ⚠️  Skipping incomplete item:`, item);
            continue;
          }

          itemsToCreate.push({
            code: id,
            category: category,
            description: item_name,
            column_config: columns,
            applicable_for: effective_applicable_for.length > 0 ? effective_applicable_for : null,
            is_active: true
          });
          
          console.log(`    ➕ Adding item: ${id}`);
        }
      }

      // Process direct items (if no subsections)
      if (direct_items.length > 0 && subsections.length === 0) {
        console.log(`  └── Direct items under template, Applicable for: [${(template_applicable_for || []).join(', ')}]`);
        
        for (const item of direct_items) {
          const { id, item_name, columns } = item;
          
          if (!id || !item_name || !columns) {
            console.warn(`    ⚠️  Skipping incomplete item:`, item);
            continue;
          }

          itemsToCreate.push({
            code: id,
            category: category,
            description: item_name,
            column_config: columns,
            applicable_for: template_applicable_for || null,
            is_active: true
          });
          
          console.log(`    ➕ Adding item: ${id}`);
        }
      }
    }

    // Bulk create if items exist
    if (itemsToCreate.length > 0) {
      console.log(`💾 Creating ${itemsToCreate.length} checklist items...`);
      await ChecklistItem.bulkCreate(itemsToCreate);
      console.log(`✅ Checklist templates seeded successfully!`);
    } else {
      console.log('⚠️  No checklist items found to seed.');
    }

  } catch (error) {
    console.error('❌ Error seeding checklist templates:', error);
  }
};

module.exports = seedChecklistTemplates;