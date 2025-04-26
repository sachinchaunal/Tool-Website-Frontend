import React, { useState } from 'react';
import { FaEnvelope, FaPaperPlane, FaGithub, FaLinkedin } from 'react-icons/fa';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Send form data to backend
      await axios.post('http://localhost:5000/api/contact/send-message', formData);
      
      // Clear form and show success message
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setFormSubmitted(true);
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitError('There was a problem sending your message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row mb-5">
        <div className="col-lg-8 mx-auto text-center">
          <h1 className="display-4 fw-bold">Contact Us</h1>
          <div className="divider-custom my-4">
            <div className="divider-custom-line"></div>
            <div className="divider-custom-icon">
              <FaEnvelope className="text-primary" />
            </div>
            <div className="divider-custom-line"></div>
          </div>
          <p className="lead">
            Have questions, feedback, or ideas for new tools? We'd love to hear from you!
            Fill out the form below or reach out directly via email.
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 mb-4 mb-lg-0">
          {formSubmitted ? (
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-5 text-center">
                <div className="mb-4">
                  <span className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                    <FaPaperPlane size={36} />
                  </span>
                </div>
                <h2>Message Sent!</h2>
                <p className="lead mb-4">
                  Thank you for reaching out! We've received your message and will respond as soon as possible.
                </p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setFormSubmitted(false)}
                >
                  Send Another Message
                </button>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-md-5">
                <h2 className="card-title mb-4">Get in Touch</h2>
                
                {submitError && (
                  <div className="alert alert-danger" role="alert">
                    {submitError}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Your Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="name" 
                      name="name" 
                      value={formData.name}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      id="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="subject" className="form-label">Subject</label>
                    <select 
                      className="form-select" 
                      id="subject" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="Tool Request">Tool Request</option>
                      <option value="Bug Report">Bug Report</option>
                      <option value="Feature Suggestion">Feature Suggestion</option>
                      <option value="General Question">General Question</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="message" className="form-label">Your Message</label>
                    <textarea 
                      className="form-control" 
                      id="message" 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="5" 
                      required
                    ></textarea>
                    {formData.subject === 'Tool Request' && (
                      <div className="form-text mt-2">
                        Please provide a detailed description of the tool you'd like to see implemented.
                      </div>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg w-100" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="me-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
        
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h3 className="card-title mb-4">Contact Information</h3>
              
              <p className="mb-2">
                <strong>Email:</strong>
              </p>
              <p className="d-flex align-items-center mb-4">
                <FaEnvelope className="me-2 text-primary" />
                <a href="mailto:sachinchaunal@gmail.com" className="text-decoration-none">
                  sachinchaunal@gmail.com
                </a>
              </p>
              
              <p className="mb-2">
                <strong>Connect with us:</strong>
              </p>
              <div className="d-flex gap-3">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                  <FaGithub size={24} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                  <FaLinkedin size={24} />
                </a>
              </div>
            </div>
          </div>
          
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h3 className="card-title mb-4">Request a Tool</h3>
              <p>
                Is there a specific tool you need but don't see on our website?
                We're constantly expanding our collection and welcome your suggestions!
              </p>
              <p>
                Describe the tool you're looking for in detail in the contact form,
                and we'll consider adding it to our website in a future update.
              </p>
              <p className="mb-0 text-muted fst-italic">
                <small>
                  All requests are reviewed personally, and tools are prioritized based 
                  on user demand and technical feasibility.
                </small>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
