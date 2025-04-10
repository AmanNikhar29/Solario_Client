import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Add.css';

const AddressForm = () => {
  const [formData, setFormData] = useState({
    address1: '',
    city: '',
    country: 'US',
    state: '',
    zipCode: '',
    phone: '',
    isDefault: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState('address'); 

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'IN', name: 'India' },
  ];

  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 
    'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  const navigateToStep = (step) => {
    setActiveStep(step); // Update active step
    if (step === 'address') {
      navigate('/AddressDetails');
    } else if (step === 'summary') {
      navigate('/Order');
    } else if (step === 'payment') {
      navigate('/payment');
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.address1.trim()) {
      newErrors.address1 = 'Address line 1 is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.country) {
      newErrors.country = 'Country is required';
    }
    
    if (formData.country === 'US' && !formData.state) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP/Postal code is required';
    } else if (formData.country === 'US' && !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Invalid ZIP code format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveToLocalStorage = () => {
    // Get existing addresses or initialize empty array
    const existingAddresses = JSON.parse(localStorage.getItem('savedAddresses')) || [];
    
    // Create new address object
    const newAddress = {
      ...formData,
      id: Date.now(), // Add unique identifier
      createdAt: new Date().toISOString()
    };
    
    // If this is set as default, remove default flag from others
    if (newAddress.isDefault) {
      existingAddresses.forEach(addr => { addr.isDefault = false; });
    }
    
    // Add new address to array
    const updatedAddresses = [...existingAddresses, newAddress];
    
    // Save to localStorage
    localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
    
    const savedAddresses = JSON.parse(localStorage.getItem('savedAddresses'));
console.log(savedAddresses);

  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        // Save to localStorage
        saveToLocalStorage();
        
        setIsSubmitting(false);
        setIsSubmitted(true);
        
        // Navigate to payment after 1.5 seconds
        setTimeout(() => {
          navigate('/Order'); // Update this to your actual payment route
        }, 1500);
      }, 1000);
    }
  };

  return (
    <div className="address-form-container">
      <div className="address-form-header">
        <h1>Shipping Address</h1>
      
        <div className="progress-steps">
          <span 
            className={`step ${activeStep === 'address' ? 'active' : 'completed'}`}
            onClick={() => navigateToStep('address')}
          >
            Address Details
          </span>
          <span 
            className={`step ${activeStep === 'summary' ? 'active' : ''}`}
            onClick={() => navigateToStep('summary')}
          >
            Order Summary
          </span>
          <span 
            className={`step ${activeStep === 'payment' ? 'active' : ''}`}
          >
            Payment
          </span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="address-form">
        <div className="form-section">
          <h3 className="section-title">Address Information</h3>
          
          <div className={`form-group ${errors.address1 ? 'has-error' : ''}`}>
            <label htmlFor="address1">Street Address 1 <span className="required">*</span></label>
            <input
              type="text"
              id="address1"
              name="address1"
              value={formData.address1}
              onChange={handleChange}
              placeholder="123 Main St"
            />
            {errors.address1 && <span className="error-message">{errors.address1}</span>}
          </div>
          
          <div className="form-row">
            <div className={`form-group ${errors.city ? 'has-error' : ''}`}>
              <label htmlFor="city">City <span className="required">*</span></label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="New York"
              />
              {errors.city && <span className="error-message">{errors.city}</span>}
            </div>
            
            <div className={`form-group ${errors.country ? 'has-error' : ''}`}>
              <label htmlFor="country">Country <span className="required">*</span></label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              >
                {countries.map(country => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            {formData.country === 'US' && (
              <div className={`form-group ${errors.state ? 'has-error' : ''}`}>
                <label htmlFor="state">State <span className="required">*</span></label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                >
                  <option value="">Select State</option>
                  {usStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && <span className="error-message">{errors.state}</span>}
              </div>
            )}
            
            <div className={`form-group ${errors.zipCode ? 'has-error' : ''}`}>
              <label htmlFor="zipCode">
                {formData.country === 'US' ? 'ZIP Code' : 'Postal Code'} 
                <span className="required">*</span>
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder={formData.country === 'US' ? '10001' : 'Postal Code'}
              />
              {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
            />
            <label htmlFor="isDefault">
              Set as default shipping address
            </label>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className='submit-button'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save address'}
          </button>
        </div> 
      </form>
      
      {isSubmitted && (
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h3>Address Saved Successfully!</h3>
          <p>Redirecting to payment...</p>
        </div>
      )}
    </div>
  );
};

export default AddressForm;