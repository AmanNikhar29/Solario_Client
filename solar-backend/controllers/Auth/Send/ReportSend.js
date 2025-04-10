const axios = require('axios');
const db = require('../../../config/db');

const sendRequirementReport = async (req, res) => {
  let customerId, sellerId;

  try {
    ({ customerId, sellerId } = req.body);

    if (!customerId || !sellerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Customer ID and Seller ID are required' 
      });
    }

    const [customer] = await db.query('SELECT * FROM customer WHERE id = ?', [customerId]);
    if (!customer || customer.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    const [requirements] = await db.query(
      'SELECT * FROM requirements_report WHERE customer_id = ? ORDER BY submitted_at DESC LIMIT 1', 
      [customerId]
    );
    
    if (!requirements || requirements.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No requirements found for this customer' 
      });
    }

    const requirementData = requirements[0];
    const customerData = customer[0];

    const payload = {
      customer_id: customerId,
      seller_id: sellerId,
      name: requirementData.name || `${customerData.first_name} ${customerData.last_name}`,
      email: customerData.email,
      phone: requirementData.phone || customerData.phone,
      budget: requirementData.budget,
      site_category: requirementData.site_category,
      area_size: requirementData.area_size,
      location: requirementData.location,
      preferred_response_time: requirementData.preferred_response_time,
      additional_requirements: requirementData.additional_requirements || '',
      customer_name: `${customerData.first_name} ${customerData.last_name}`
    };
    

    const sellerEndpoint = (process.env.SELLER_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    const url = `${sellerEndpoint}/api/seller/receive-requirements`;


    const config = {
      headers: {
        'Content-Type': 'application/json',
        
      },
      timeout: 5000,
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      }
    };

    const response = await axios.post(url, payload, config);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Seller API returned unsuccessful response');
    }

    await db.query(
      'INSERT INTO requirement_transmissions (customer_id, seller_id, transmitted_at, status) VALUES (?, ?, NOW(), ?)',
      [customerId, sellerId, 'success']
      
    );
   

    return res.status(200).json({
      success: true,
      message: 'Requirements successfully sent to seller',
      data: response.data
      
    });

  } catch (error) {
    console.error('Error sending requirements report:', error);

    if (customerId && sellerId) {
      try {
        await db.query(
          'INSERT INTO requirement_transmissions (customer_id, seller_id, transmitted_at, status, error_message) VALUES (?, ?, NOW(), ?, ?)',
          [customerId, sellerId, 'failed', error.message?.substring(0, 255) || 'Unknown error']
        );
      } catch (dbError) {
        console.error('Failed to log transmission error:', dbError);
      }
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        message: 'Seller server request timeout',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.message || 'Error from seller server',
        ...(process.env.NODE_ENV === 'development' && { 
          details: error.response.data,
          stack: error.stack 
        })
      });
    }

    if (error.request) {
      return res.status(503).json({
        success: false,
        message: 'Seller server is not responding',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        stack: error.stack 
      })
    });
  }
};

module.exports = { sendRequirementReport };