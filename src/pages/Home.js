import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaFileAlt, FaImage, FaFileCode, FaFileWord, FaFilePowerpoint, FaFileVideo, FaFileAudio, FaArrowRight } from 'react-icons/fa';
import SEO from '../components/SEO';

const Home = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // SEO Schema for home page
  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Tool Website",
    "url": "https://toolwebsite.com",
    "description": "Free online tools for PDF, image editing, media compression and more.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://toolwebsite.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  useEffect(() => {
    // In production, this would fetch from your API
    // For now, we'll use a placeholder array
    const dummyTools = [
      {
        id: '1',
        name: 'PDF Merger',
        description: 'Combine multiple PDF files into one document easily. Merge PDFs online for free.',
        category: 'PDF',
        slug: 'pdf-merger',
        icon: 'pdf'
      },
      {
        id: '2',
        name: 'Image Background Remover',
        description: 'Remove backgrounds from images instantly with our AI-powered tool. Get transparent backgrounds in seconds.',
        category: 'Image',
        slug: 'image-bg-remover',
        icon: 'image'
      },      
      {
        id: '3',
        name: 'HTML to React Converter',
        description: 'Convert HTML code to React JSX components automatically. Perfect for React developers.',
        category: 'Converter',
        slug: 'html-to-react',
        icon: 'code'
      },
      {
        id: '7',
        name: 'Media Compressor',
        description: 'Compress videos, images, and audio files without losing quality. Optimize media files for web.',
        category: 'Other',
        slug: 'media-compressor',
        icon: 'video'
      }
    ];

    // Simulate API call
    setTimeout(() => {
      setTools(dummyTools);
      setLoading(false);
    }, 500);

    // When connecting to real backend, use this:
    // const fetchTools = async () => {
    //   try {
    //     const response = await axios.get('http://localhost:5000/api/tools');
    //     setTools(response.data);
    //     setLoading(false);
    //   } catch (err) {
    //     setError('Failed to fetch tools. Please try again later.');
    //     setLoading(false);
    //   }
    // };
    // fetchTools();

    // Add entrance animations to elements
    const animateElements = () => {
      const elements = document.querySelectorAll('.animate-on-load');
      elements.forEach((element, index) => {
        setTimeout(() => {
          element.classList.add('page-enter');
        }, 150 * index);
      });
    };
    
    animateElements();
  }, []);

  // Helper function to get icon based on tool type
  const getToolIcon = (iconType) => {
    switch (iconType) {
      case 'pdf':
        return <FaFileAlt size={40} className="mb-3 text-danger card-icon icon-micro-animation" />;
      case 'image':
        return <FaImage size={40} className="mb-3 text-success card-icon icon-micro-animation" />;
      case 'code':
        return <FaFileCode size={40} className="mb-3 text-info card-icon icon-micro-animation" />;
      case 'ppt':
        return <FaFilePowerpoint size={40} className="mb-3 text-warning card-icon icon-micro-animation" />;
      case 'word':
        return <FaFileWord size={40} className="mb-3 text-primary card-icon icon-micro-animation" />;
      case 'video':
        return <FaFileVideo size={40} className="mb-3 text-danger card-icon icon-micro-animation" />;
      case 'audio':
        return <FaFileAudio size={40} className="mb-3 text-secondary card-icon icon-micro-animation" />;
      default:
        return <FaFileAlt size={40} className="mb-3 text-secondary card-icon icon-micro-animation" />;
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading tools...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Free Online Tools for PDF, Image Editing & Media Conversion" 
        description="Discover our collection of free online tools including PDF merger, image background remover, HTML to React converter, and media compressor. No signup required." 
        keywords="free online tools, pdf merger, image background remover, html to react converter, media compressor, free utility tools"
        schema={homeSchema}
      />
      
      <div className="container py-5">
        <section className="text-center mb-5 animate-on-load">
          <h1 className="display-4 fw-bold mb-3">All-in-One Tool Website</h1>
          <p className="lead text-muted mb-4">Free online tools to make your work easier and more productive</p>
          <div className="d-flex justify-content-center">
            <Link to="/tool/pdf-merger" className="btn btn-primary me-2">
              Get Started <FaArrowRight className="ms-2" />
            </Link>
            <Link to="/about" className="btn btn-outline-secondary">Learn More</Link>
          </div>
        </section>

        <section className="py-4">
          <h2 className="text-center mb-4 section-title animate-on-load">Popular Online Tools</h2>
          <div className="row g-4">
            {tools.map((tool) => (
              <div key={tool.id} className="col-md-6 col-lg-3 animate-on-load">
                <div className="card h-100 hover-scale">
                  <div className="card-body text-center">
                    {getToolIcon(tool.icon)}
                    <h5 className="card-title">{tool.name}</h5>
                    <p className="card-text">{tool.description}</p>
                    <Link to={`/tool/${tool.slug}`} className="btn btn-primary mt-3">
                      Use Tool
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-4 animate-on-load">
          <div className="card bg-light border-0 rounded-3 p-4 p-md-5">
            <div className="row align-items-center">
              <div className="col-md-7">
                <h2 className="fw-bold mb-3 section-title">Why Choose Our Tools?</h2>
                <ul className="list-unstyled">
                  <li className="mb-2">✓ Free to use with no hidden charges</li>
                  <li className="mb-2">✓ Privacy-focused: files never leave your browser</li>
                  <li className="mb-2">✓ Fast processing with latest technologies</li>
                  <li className="mb-2">✓ No account or signup required</li>
                  <li className="mb-2">✓ Modern, intuitive user interface</li>
                </ul>
                <Link to="/about" className="btn btn-primary mt-3">
                  Learn More <FaArrowRight className="ms-2" />
                </Link>
              </div>
              <div className="col-md-5 mt-4 mt-md-0 text-center">
                <img 
                  src="https://via.placeholder.com/400x300?text=Tools+Illustration" 
                  alt="Free Online Tools Collection" 
                  className="img-fluid rounded"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-4 animate-on-load">
          <h2 className="text-center mb-4 section-title">Frequently Asked Questions</h2>
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="accordion" id="faqAccordion">
                <div className="accordion-item">
                  <h3 className="accordion-header">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                      Are these tools really free to use?
                    </button>
                  </h3>
                  <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Yes, all the tools on our website are completely free to use. We don't have any hidden charges or premium plans. Our mission is to provide helpful tools that everyone can access.
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h3 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                      Is my data safe when using these tools?
                    </button>
                  </h3>
                  <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Yes, your data is safe. Most of our tools process your files directly in your browser, which means your files never leave your computer. We don't store your uploads on our servers, ensuring complete privacy.
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h3 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                      What's the maximum file size I can process?
                    </button>
                  </h3>
                  <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      For most tools, the maximum file size is 50MB. However, this limit may vary depending on the specific tool and your browser's capabilities. For large files, we recommend using our media compressor tool first to reduce the file size.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
