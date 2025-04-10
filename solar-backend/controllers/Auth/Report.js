const db = require('../../config/db');

const submitRequirements = async (req, res) => {
  try {
    const {
      customer_id,
      name,
      email,
      phone,
      budget,
      siteCategory,
      areaSize,
      location,
      preferredResponseTime,
      additionalRequirements,
      agreeTerms
      
    } = req.body;

    const query = `
      INSERT INTO requirements_report (
        customer_id, name, email, phone, budget, site_category, area_size, location,
        preferred_response_time, additional_requirements, agree_terms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      customer_id,
      name,
      email,
      phone,
      budget,
      siteCategory,
      areaSize,
      location,
      preferredResponseTime,
      additionalRequirements,
      agreeTerms
    ];

    // Assuming db.query returns a promise (if not, you'll need to promisify it)
    const result = await db.query(query, values);
    
    res.status(201).json({ 
      message: 'Report submitted successfully', 
      id: result.insertId 
    });

  } catch (err) {
    console.error('Error inserting report:', err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
};

module.exports = { submitRequirements };