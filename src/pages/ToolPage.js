import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaFileAlt, FaImage, FaFileCode, FaFileWord, FaFilePowerpoint, FaFileVideo, FaFileAudio, FaArrowLeft } from 'react-icons/fa';
import SEO from '../components/SEO';

// Tool-specific components
import PDFMerger from '../components/tools/PDFMerger';
import ImageBgRemover from '../components/tools/ImageBgRemover';
import HTMLToReact from '../components/tools/HTMLToReact';
import MediaCompressor from '../components/tools/MediaCompressor';

const ToolPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tool, setTool] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // In production, this would fetch the specific tool from your API
    // For now, we'll use a placeholder object based on the slug
    const dummyTools = {
      'pdf-merger': {
        id: '1',
        name: 'PDF Merger',
        description: 'Combine multiple PDF files into one document',
        category: 'PDF',
        longDescription: 'Merge multiple PDF documents into a single file with ease. Arrange the order of your PDFs and customize the final document. Perfect for combining reports, contracts, or any multi-part documents.',
        keywords: 'pdf merger, combine pdf, merge pdf files, pdf joiner, merge multiple pdfs, free pdf merger',
        component: PDFMerger
      },
      'image-bg-remover': {
        id: '2',
        name: 'Image Background Remover',
        description: 'Remove background from images with AI technology',
        category: 'Image',
        longDescription: 'Remove backgrounds from images instantly with our advanced AI technology. Get transparent PNG images or choose a custom background color. Ideal for product photos, profile pictures, and graphic design.',
        keywords: 'remove background, background eraser, transparent background, background remover, image background removal, ai background remover',
        component: ImageBgRemover
      },      
      'html-to-react': {
        id: '3',
        name: 'HTML to React Converter',
        description: 'Convert HTML code to React components',
        category: 'Converter',
        longDescription: 'Transform your HTML code into React components automatically. Our converter handles nested elements, attributes, and even adds proper JSX syntax. Save hours of manual conversion for your React projects.',
        keywords: 'html to react, convert html to jsx, html to react converter, jsx converter, html to react component',
        component: HTMLToReact
      },
      'media-compressor': {
        id: '7',
        name: 'Media Compressor',
        description: 'Compress audio, video, and image files',
        category: 'Other',
        longDescription: 'Reduce file sizes while maintaining quality with our media compressor. Supports images, audio, and video files. Perfect for website optimization, email attachments, or saving storage space.',
        keywords: 'media compressor, compress video, compress image, file compressor, reduce file size, online compressor',
        component: MediaCompressor
      }
    };

    // Simulate API call
    setTimeout(() => {
      if (dummyTools[slug]) {
        setTool(dummyTools[slug]);
        setLoading(false);
      } else {
        setError('Tool not found');
        setLoading(false);
      }
    }, 500);

    // When connecting to real backend, use this:
    // const fetchTool = async () => {
    //   try {
    //     const response = await axios.get(`http://localhost:5000/api/tools/${slug}`);
    //     setTool(response.data);
    //     setLoading(false);
    //   } catch (err) {
    //     setError('Tool not found or failed to load.');
    //     setLoading(false);
    //   }
    // };
    // fetchTool();
  }, [slug]);

  // Generate schema for tool
  const getToolSchema = (tool) => {
    if (!tool) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": `${tool.name} | Tool Website`,
      "applicationCategory": "WebApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": tool.longDescription
    };
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading tool...</p>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error || 'Tool not found'}
        </div>
        <button 
          className="btn btn-primary mt-3"
          onClick={() => navigate('/')}
        >
          <FaArrowLeft className="me-2" /> Back to Home
        </button>
      </div>
    );
  }

  const ToolComponent = tool.component;

  return (
    <>
      <SEO 
        title={tool.name}
        description={tool.longDescription}
        keywords={tool.keywords}
        canonicalUrl={`${process.env.REACT_APP_SITE_URL || 'https://toolwebsite.vercel.app'}/tool/${slug}`}
        schema={getToolSchema(tool)}
      />
      
      <div className="container py-5">
        <button 
          className="btn btn-outline-secondary mb-4"
          onClick={() => navigate('/')}
        >
          <FaArrowLeft className="me-2" /> All Tools
        </button>
        
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-primary text-white py-3">
                <h1 className="h3 mb-0">{tool.name}</h1>
              </div>
              <div className="card-body">
                <p className="lead mb-4">{tool.longDescription}</p>
                
                <div className="tool-container">
                  {/* Render the specific tool component */}
                  <ToolComponent />
                </div>
              </div>
            </div>
            
            {/* Add related content for SEO */}
            <div className="mt-5">
              <h2 className="h4 mb-4 section-title">About {tool.name}</h2>
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h3 className="h5 mb-3">How to use {tool.name}</h3>
                  <ol className="mb-4">
                    <li>Upload your files by clicking the upload button or dragging and dropping them.</li>
                    <li>Adjust any settings as needed for your specific requirements.</li>
                    <li>Click the process button to begin.</li>
                    <li>Download your results once the processing is complete.</li>
                  </ol>
                  
                  <h3 className="h5 mb-3">Benefits of using our {tool.name}</h3>
                  <ul className="mb-4">
                    <li>Fast and efficient processing directly in your browser</li>
                    <li>100% free to use with no hidden charges</li>
                    <li>Secure and private - your files never leave your computer</li>
                    <li>No registration or download required</li>
                    <li>Works on all devices and platforms</li>
                  </ul>
                  
                  <h3 className="h5 mb-3">Why choose our {tool.name}?</h3>
                  <p>
                    Our {tool.name} is designed with simplicity and efficiency in mind. 
                    Unlike other online tools that may limit functionality or require payment, 
                    we offer a complete solution that's accessible to everyone. Our tool 
                    uses modern technology to ensure fast processing while maintaining the 
                    highest quality output possible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ToolPage;
