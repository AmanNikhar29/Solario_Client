import React, { useState, useEffect } from 'react';
import './Report.css';

const RequirementsReportPage = () => {
  const [formData, setFormData] = useState({
    customer_id: '',
    name: '',
    email: '',
    phone: '',
    budget: '5000-10000',
    site_category: 'ecommerce',
    area_size: 'medium',
    location: '',
    preferred_response_time: '48',
    additional_requirements: '',
    agree_terms: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);

  useEffect(() => {
    // Load customer data from localStorage
    const loadCustomerData = () => {
      const storedCustomer = localStorage.getItem('customer');
      if (storedCustomer) {
        try {
          const customer = JSON.parse(storedCustomer);
          setCustomerDetails(customer);
          setFormData(prev => ({
            ...prev,
            customer_id: customer.id || customer._id || '',
            name: customer.name || '',
            email: customer.email || '',
            phone: customer.phone || ''
          }));
        } catch (error) {
          console.error("Error parsing customer data:", error);
        }
      }
    };

    loadCustomerData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.match(/^[0-9]{10,15}$/)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.agree_terms) {
      newErrors.agree_terms = 'You must agree to the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmationModal(true);
    }
  };

  const confirmSubmission = async () => {
    setShowConfirmationModal(false);
    setIsSubmitting(true);
  
    try {
      const response = await fetch('http://localhost:5001/api/report/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
  
      const result = await response.json();
  
      if (response.ok) {
        setIsSubmitted(true);
        console.log('Form submitted successfully:', result);
      } else {
        console.error('Submission error:', result);
        alert(`Error: ${result.message || 'Something went wrong. Please try again.'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="requirements-container">
      <div className="requirements-header">
        <h1>Project Requirements</h1>
        <p>Fill out this form to get a customized quote for your project</p>
        {customerDetails && (
          <div className="customer-badge">
            <i className="fas fa-user-circle"></i>
            <span>{customerDetails.name} (ID: {formData.customer_id})</span>
          </div>
        )}
      </div>
      
      <div className="requirements-content">
        <div className="requirements-form-container">
          <form onSubmit={handleSubmit} className="requirements-form">
            <div className="form-section">
              <h3><i className="fas fa-user"></i> Personal Information</h3>
              
              <div className="form-group">
                <label htmlFor="name">Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Smith"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email <span className="required">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone <span className="required">*</span></label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="1234567890"
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h3><i className="fas fa-cog"></i> Project Details</h3>
              
              <div className="form-group">
                <label htmlFor="budget">Estimated Budget <span className="required">*</span></label>
                <select
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                >
                  <option value="1000-5000">$1,000 - $5,000</option>
                  <option value="5000-10000">$5,000 - $10,000</option>
                  <option value="10000-25000">$10,000 - $25,000</option>
                  <option value="25000-50000">$25,000 - $50,000</option>
                  <option value="50000+">$50,000+</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="site_category">Project Type <span className="required">*</span></label>
                <select
                  id="site_category"
                  name="site_category"
                  value={formData.site_category}
                  onChange={handleChange}
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="institutional">Institutional</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="area_size">Project Size (sq ft) <span className="required">*</span></label>
                <input
                  type="text"
                  id="area_size"
                  name="area_size"
                  value={formData.area_size}
                  onChange={handleChange}
                  placeholder="e.g., 1500"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Location <span className="required">*</span></label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, State/Province, Country"
                  className={errors.location ? 'error' : ''}
                />
                {errors.location && <span className="error-message">{errors.location}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="preferred_response_time">Preferred Response Time <span className="required">*</span></label>
                <select
                  id="preferred_response_time"
                  name="preferred_response_time"
                  value={formData.preferred_response_time}
                  onChange={handleChange}
                >
                  <option value="24">24 hours</option>
                  <option value="48">48 hours</option>
                  <option value="72">72 hours</option>
                  <option value="168">1 week</option>
                </select>
              </div>
            </div>
            
            <div className="form-section">
              <h3><i className="fas fa-file-alt"></i> Additional Requirements</h3>
              <div className="form-group">
                <label htmlFor="additional_requirements">Special Requests or Notes</label>
                <textarea
                  id="additional_requirements"
                  name="additional_requirements"
                  value={formData.additional_requirements}
                  onChange={handleChange}
                  placeholder="Describe any specific requirements, materials, or special considerations..."
                  rows="4"
                />
              </div>
              
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="agree_terms"
                  name="agree_terms"
                  checked={formData.agree_terms}
                  onChange={handleChange}
                  className={errors.agree_terms ? 'error' : ''}
                />
                <label htmlFor="agree_terms">
                  I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a> <span className="required">*</span>
                </label>
                {errors.agree_terms && <span className="error-message">{errors.agree_terms}</span>}
              </div>
            </div>
            
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Processing...
                </>
              ) : (
                'Submit Requirements'
              )}
            </button>
          </form>
        </div>
        
        <div className="benefits-sidebar">
          <div className="benefits-card">
            <h3>Why Provide Detailed Requirements?</h3>
            <ul className="benefits-list">
              <li>
                <i className="fas fa-check-circle"></i>
                <span>Receive a more accurate quote</span>
              </li>
              <li>
                <i className="fas fa-check-circle"></i>
                <span>Help us understand your vision</span>
              </li>
              <li>
                <i className="fas fa-check-circle"></i>
                <span>Reduce back-and-forth communication</span>
              </li>
              <li>
                <i className="fas fa-check-circle"></i>
                <span>Get matched with the right specialists</span>
              </li>
            </ul>
          </div>
          
          <div className="support-card">
            <h3>Need Help?</h3>
            <p>Our team is available to assist you with filling out this form.</p>
            <div className="support-contact">
              <i className="fas fa-phone-alt"></i>
              <span>+1 (800) 123-4567</span>
            </div>
            <div className="support-contact">
              <i className="fas fa-envelope"></i>
              <span>support@constructionpro.com</span>
            </div>
            <div className="support-contact">
              <i className="fas fa-comment-alt"></i>
              <span>Live Chat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="modal-header">
              <i className="fas fa-exclamation-circle confirmation-icon"></i>
              <h2>Confirm Submission</h2>
            </div>
            <div className="modal-body">
              <p>Please review your information before submitting:</p>
              <div className="submission-review">
                <p><strong>Name:</strong> {formData.name}</p>
                <p><strong>Project Type:</strong> {formData.site_category}</p>
                <p><strong>Budget:</strong> {formData.budget}</p>
                <p><strong>Location:</strong> {formData.location}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowConfirmationModal(false)} 
                className="modal-cancel-button"
              >
                <i className="fas fa-edit"></i> Edit Details
              </button>
              <button 
                onClick={confirmSubmission} 
                className="modal-confirm-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><i className="fas fa-spinner fa-spin"></i> Submitting...</>
                ) : (
                  <><i className="fas fa-check"></i> Confirm Submission</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSubmitted && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="modal-header">
              <i className="fas fa-check-circle success-icon"></i>
              <h2>Submission Successful!</h2>
            </div>
            <div className="modal-body">
              <p>Your project requirements have been received.</p>
              <p>We'll contact you within {formData.preferred_response_time} hours with a customized proposal.</p>
              <div className="reference-number">
                <p>Your reference number:</p>
                <div className="ref-number">
                  {formData.customer_id}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => {
                  setIsSubmitted(false);
                  window.location.href = '/Customer';
                }} 
                className="modal-close-button"
              >
                <i className="fas fa-home"></i> Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequirementsReportPage;