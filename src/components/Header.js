import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaTools, FaChevronDown } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header>
      <nav className={`navbar navbar-expand-lg ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center">
            <FaTools className="brand-icon me-2" />
            <span className="brand-text">Tool Website</span>
          </Link>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <NavLink to="/" className={({isActive}) => 
                  isActive ? "nav-link active" : "nav-link"} end>
                  Home
                </NavLink>
              </li>
              <li className="nav-item dropdown">
                <a 
                  className="nav-link dropdown-toggle" 
                  href="#" 
                  id="toolsDropdown" 
                  role="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  Tools <FaChevronDown className="ms-1 dropdown-icon" />
                </a>
                <ul className="dropdown-menu dropdown-menu-animated" aria-labelledby="toolsDropdown">
                  <li><Link to="/tool/pdf-merger" className="dropdown-item">PDF Merger</Link></li>
                  <li><Link to="/tool/image-bg-remover" className="dropdown-item">Image Background Remover</Link></li>
                  <li><Link to="/tool/html-to-react" className="dropdown-item">HTML to React Converter</Link></li>
                  <li><Link to="/tool/media-compressor" className="dropdown-item">Media Compressor</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><Link to="/" className="dropdown-item">All Tools</Link></li>
                </ul>
              </li>
              <li className="nav-item">
                <NavLink to="/about" className={({isActive}) => 
                  isActive ? "nav-link active" : "nav-link"}>
                  About
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/contact" className={({isActive}) => 
                  isActive ? "nav-link active" : "nav-link"}>
                  Contact
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
