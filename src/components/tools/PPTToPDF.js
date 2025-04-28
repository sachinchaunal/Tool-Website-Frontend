import React, { useState, useRef } from 'react';
import { FaFilePowerpoint, FaFileAlt, FaTrash, FaDownload, FaEye } from 'react-icons/fa';
import axios from 'axios';

const PPTToPDF = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's a PowerPoint file
    const validTypes = ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid PowerPoint file (.ppt or .pptx)');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select a PowerPoint file first.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('presentation', selectedFile);
      
      // Send the file to the backend API
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/document/ppt-to-pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.success) {
        setResult({
          downloadUrl: `${apiUrl}${response.data.downloadUrl}`,
          fileName: response.data.fileName || selectedFile.name.replace(/\.(ppt|pptx)$/i, '.pdf'),
          message: response.data.message || 'PowerPoint converted to PDF successfully!'
        });
      } else {
        throw new Error(response.data.message || 'Conversion failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to convert file';
      setError(`Error: ${errorMessage}. Please try again.`);
      console.error('PPT to PDF conversion error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <div className="ppt-to-pdf-tool">
      <form onSubmit={handleSubmit}>
        {/* File Upload Area */}
        {!selectedFile ? (
          <div className="mb-4">
            <label htmlFor="pptFile" className="form-label fw-bold">Select a PowerPoint File</label>
            <div 
              className="file-upload-area" 
              onClick={() => fileInputRef.current.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                id="pptFile" 
                accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" 
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <FaFilePowerpoint size={24} className="mb-2 text-warning" />
              <p className="mb-1">Click to upload a PowerPoint file</p>
              <p className="text-muted small">Supports .ppt and .pptx formats</p>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label fw-bold mb-0">Selected File</label>
              <button 
                type="button" 
                className="btn btn-sm btn-outline-danger" 
                onClick={removeFile}
              >
                <FaTrash className="me-1" /> Remove
              </button>
            </div>
            
            <div className="file-preview">
              <div className="file-preview-icon">
                <FaFilePowerpoint className="text-warning" size={24} />
              </div>
              <div className="file-preview-info">
                <div className="file-preview-name">{selectedFile.name}</div>
                <div className="file-preview-size">{formatFileSize(selectedFile.size)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          className="btn btn-primary btn-lg w-100" 
          disabled={isProcessing || !selectedFile}
        >
          {isProcessing ? 'Converting to PDF...' : 'Convert to PDF'}
          {isProcessing && (
            <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
          )}
        </button>
      </form>

      {/* Results Section */}
      {result && !isProcessing && (
        <div className="result-section mt-4">
          <div className="alert alert-success">
            {result.message}
          </div>
          <div className="file-preview">
            <div className="file-preview-icon">
              <FaFileAlt className="text-danger" size={24} />
            </div>
            <div className="file-preview-info">
              <div className="file-preview-name">{result.fileName}</div>
            </div>
          </div>
          <div className="d-flex justify-content-between gap-2 mt-3">
            <button 
              onClick={() => setShowPreview(true)}
              className="btn btn-primary flex-grow-1"
            >
              <FaEye className="me-2" /> Preview
            </button>
            <a 
              href={`http://localhost:5000${result.downloadUrl}`} 
              download={result.fileName} 
              className="btn btn-success flex-grow-1"
            >
              <FaDownload className="me-2" /> Download
            </a>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPreview && result && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">PDF Preview</h5>
                <button type="button" className="btn-close" onClick={() => setShowPreview(false)}></button>
              </div>
              <div className="modal-body p-0" style={{ height: '70vh' }}>
                <iframe 
                  src={`http://localhost:5000${result.downloadUrl}`}
                  title="PDF Preview" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 'none' }}
                ></iframe>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPreview(false)}>Close</button>
                <a 
                  href={`http://localhost:5000${result.downloadUrl}`} 
                  download={result.fileName} 
                  className="btn btn-success"
                >
                  <FaDownload className="me-2" /> Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Backdrop */}
      {showPreview && <div className="modal-backdrop show" onClick={() => setShowPreview(false)}></div>}
    </div>
  );
};

export default PPTToPDF;
