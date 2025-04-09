import React, { useState } from 'react';
import './Report.css';

const RequirementsReportPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    budget: '5000-10000',
    siteCategory: 'ecommerce',
    areaSize: 'medium',
    location: '',
    preferredResponseTime: '48',
    additionalRequirements: '',
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

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
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms';
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
  
      const result = await response.json();
  
      if (response.ok) {
        setIsSubmitted(true);
        console.log('Form submitted successfully:', result);
      } else {
        console.error('Submission error:', result);
        alert('Something went wrong. Please try again.');
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
        <p>Fill out this form to get a customized quote for your website project</p>
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
                <label htmlFor="siteCategory">Site Category <span className="required">*</span></label>
                <select
                  id="siteCategory"
                  name="siteCategory"
                  value={formData.siteCategory}
                  onChange={handleChange}
                >
                  <option value="ecommerce">Industrial</option>
                  <option value="portfolio">Residential</option>
                  <option value="blog">Commercial</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="areaSize">Project Size <span className="required">*</span></label>
                <div className="radio-group">
                  <div className="form-group">
                    <label className="required">
                      <input
                        type="text"
                        name="areaSize"
                        placeholder='Area Size'
                        onChange={handleChange}
                      />
                      <span className="label">Area Size (in sq.ft)</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Location <span className="required">*</span></label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                  className={errors.location ? 'error' : ''}
                />
                {errors.location && <span className="error-message">{errors.location}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="preferredResponseTime">Preferred Response Time <span className="required">*</span></label>
                <select
                  id="preferredResponseTime"
                  name="preferredResponseTime"
                  value={formData.preferredResponseTime}
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
                <label htmlFor="additionalRequirements">Special Requests or Notes</label>
                <textarea
                  id="additionalRequirements"
                  name="additionalRequirements"
                  value={formData.additionalRequirements}
                  onChange={handleChange}
                  placeholder="Describe any specific features, design preferences, or other requirements..."
                  rows="4"
                />
              </div>
              
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className={errors.agreeTerms ? 'error' : ''}
                />
                <label htmlFor="agreeTerms">
                  I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a> <span className="required">*</span>
                </label>
                {errors.agreeTerms && <span className="error-message">{errors.agreeTerms}</span>}
              </div>
            </div>
            
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Processing...
                </>
              ) : (
                'Get Your Custom Quote'
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
          
          <div className="testimonial-card">
            <div className="testimonial-content">
              <i className="fas fa-quote-left"></i>
              <p>Providing detailed requirements helped us get exactly what we wanted in half the expected time.</p>
            </div>
            <div className="testimonial-author">
              <img src="https://via.placeholder.com/50" alt="Sarah Johnson" />
              <div>
                <h4>Sarah Johnson</h4>
                <p>CEO, TechSolutions Inc.</p>
              </div>
            </div>
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
              <span>support@webdevpro.com</span>
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
              <p>Are you sure you want to submit your project requirements?</p>
              <p>You won't be able to make changes after submission.</p>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowConfirmationModal(false)} 
                className="modal-cancel-button"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSubmission} 
                className="modal-confirm-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Submission'}
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
              <h2>Success!</h2>
            </div>
            <div className="modal-body">
              <p>Your requirements have been submitted successfully.</p>
              <p>We'll get back to you within {formData.preferredResponseTime} hours.</p>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setIsSubmitted(false)} 
                className="modal-close-button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequirementsReportPage;