import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3 mb-md-0">
            <h5>Tool Website</h5>
            <p className="text-muted">
              A collection of useful online tools for everyday tasks.
            </p>
          </div>
          
          <div className="col-md-4 mb-3 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-decoration-none text-light">Home</Link></li>
              <li><Link to="/about" className="text-decoration-none text-light">About</Link></li>
              <li><Link to="/contact" className="text-decoration-none text-light">Contact</Link></li>
              <li><Link to="/privacy-policy" className="text-decoration-none text-light">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div className="col-md-4">
            <h5>Connect With Us</h5>
            <div className="d-flex gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-light">
                <FaGithub size={24} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-light">
                <FaTwitter size={24} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-light">
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>
        </div>
        
        <hr className="mt-3 mb-3" />
        
        <div className="text-center">
          <p className="mb-0">&copy; {year} Tool Website. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
