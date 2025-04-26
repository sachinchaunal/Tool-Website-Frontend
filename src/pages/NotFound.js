import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch } from 'react-icons/fa';
import SEO from '../components/SEO';

const NotFound = () => {
  // SEO metadata for 404 page
  const notFoundSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Page Not Found | Tool Website",
    "description": "The page you are looking for could not be found. Explore our collection of free online tools instead."
  };

  return (
    <>
      <SEO 
        title="404 - Page Not Found"
        description="The page you are looking for could not be found. Explore our collection of free online tools instead."
        schema={notFoundSchema}
      />
      
      <div className="container py-5 text-center">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-5">
                <h1 className="display-1 mb-4 text-primary">404</h1>
                <h2 className="h3 mb-4">Page Not Found</h2>
                <p className="mb-4 text-muted">
                  The page you are looking for might have been removed, had its name changed, 
                  or is temporarily unavailable.
                </p>
                
                <div className="d-flex justify-content-center gap-3 mb-4">
                  <Link to="/" className="btn btn-primary">
                    <FaHome className="me-2" /> Go Home
                  </Link>
                  <Link to="/" className="btn btn-outline-secondary">
                    <FaSearch className="me-2" /> Explore Tools
                  </Link>
                </div>
                
                <div className="mt-4">
                  <h3 className="h5 mb-3">Popular Tools You Might Like</h3>
                  <div className="d-flex flex-wrap justify-content-center gap-2">
                    <Link to="/tool/pdf-merger" className="badge bg-light text-dark text-decoration-none p-2">PDF Merger</Link>
                    <Link to="/tool/image-bg-remover" className="badge bg-light text-dark text-decoration-none p-2">Background Remover</Link>
                    <Link to="/tool/html-to-react" className="badge bg-light text-dark text-decoration-none p-2">HTML to React</Link>
                    <Link to="/tool/media-compressor" className="badge bg-light text-dark text-decoration-none p-2">Media Compressor</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
