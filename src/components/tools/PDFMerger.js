import React, { useState } from 'react';
import { FaFileAlt, FaTrash, FaArrowUp, FaArrowDown, FaPlus, FaDownload, FaEye } from 'react-icons/fa';
import { pdfAPI } from '../../utils/api';

const PDFMerger = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== selectedFiles.length) {
      setError('Only PDF files are allowed.');
      return;
    }
    
    setFiles(prev => [...prev, ...pdfFiles]);
    setError(null);
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const moveFile = (index, direction) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === files.length - 1)
    ) {
      return; // Can't move further in this direction
    }

    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap files
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    
    setFiles(newFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length < 2) {
      setError('Please select at least two PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create a FormData object
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('pdfs', file);
      });

      // Send the request to the backend using the API utility
      const response = await pdfAPI.mergePDFs(formData);
      
      // Prepend the API base URL to the downloadUrl if it's a relative path
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const downloadUrl = response.data.downloadUrl.startsWith('/')
        ? `${baseUrl}${response.data.downloadUrl}`
        : response.data.downloadUrl;
      
      setResult({
        success: true,
        downloadUrl: downloadUrl,
        message: response.data.message || 'PDFs merged successfully!'
      });
    } catch (err) {
      console.error('PDF merge error:', err);
      setError(err.response?.data?.message || 'Failed to merge PDF files. Please try again.');
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
    <div className="pdf-merger-tool">
      <form onSubmit={handleSubmit}>
        {/* File Upload Area */}
        <div className="mb-4">
          <label htmlFor="pdfFiles" className="form-label fw-bold">Select PDF Files</label>
          <div className="file-upload-area" onClick={() => document.getElementById('pdfFiles').click()}>
            <input 
              type="file" 
              id="pdfFiles" 
              multiple 
              accept=".pdf" 
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <FaPlus size={24} className="mb-2 text-secondary" />
            <p className="mb-1">Click to select PDF files</p>
            <p className="text-muted small">or drag and drop files here</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="mb-4">
            <label className="form-label fw-bold">Selected Files ({files.length})</label>
            <p className="text-muted small mb-2">Drag files to reorder them for the merged PDF</p>
            
            {files.map((file, index) => (
              <div key={index} className="file-preview">
                <div className="file-preview-icon">
                  <FaFileAlt className="text-primary" size={24} />
                </div>
                <div className="file-preview-info">
                  <div className="file-preview-name">{file.name}</div>
                  <div className="file-preview-size">{formatFileSize(file.size)}</div>
                </div>
                <div className="file-preview-actions">
                  <button 
                    type="button" 
                    className="btn btn-sm btn-light me-1" 
                    onClick={() => moveFile(index, 'up')}
                    disabled={index === 0}
                  >
                    <FaArrowUp />
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-light me-1" 
                    onClick={() => moveFile(index, 'down')}
                    disabled={index === files.length - 1}
                  >
                    <FaArrowDown />
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-light" 
                    onClick={() => removeFile(index)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          className="btn btn-primary btn-lg w-100" 
          disabled={isProcessing || files.length < 2}
        >
          {isProcessing ? 'Merging PDFs...' : 'Merge PDFs'}
          {isProcessing && (
            <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
          )}
        </button>
      </form>

      {/* Results Section */}
      {result && (
        <div className="result-section mt-4">
          <div className="alert alert-success">
            {result.message}
          </div>
          <div className="d-flex justify-content-between gap-2 mt-3">
            <button 
              onClick={() => setShowPreview(true)} 
              className="btn btn-primary flex-grow-1"
            >
              <FaEye className="me-2" /> Preview
            </button>
            <a 
              href={result.downloadUrl} 
              download="merged.pdf" 
              className="btn btn-success flex-grow-1"
            >
              <FaDownload className="me-2" /> Download
            </a>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPreview && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">PDF Preview</h5>
                <button type="button" className="btn-close" onClick={() => setShowPreview(false)}></button>
              </div>
              <div className="modal-body p-0" style={{ height: '70vh' }}>
                <iframe 
                  src={result.downloadUrl}
                  title="PDF Preview" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 'none' }}
                ></iframe>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPreview(false)}>Close</button>
                <a 
                  href={result.downloadUrl} 
                  download="merged.pdf" 
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

export default PDFMerger;
