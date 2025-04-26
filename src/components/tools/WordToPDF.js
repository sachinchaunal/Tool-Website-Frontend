import React, { useState, useRef } from 'react';
import { FaFileWord, FaFileAlt, FaTrash, FaDownload } from 'react-icons/fa';
import { pdfAPI } from '../../utils/api';

const WordToPDF = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's a Word file
    const validTypes = [
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid Word document (.doc or .docx)');
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
      setError('Please select a Word document first.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create form data for API request
      const formData = new FormData();
      formData.append('document', selectedFile);
      
      // Send the document to the backend for conversion
      const response = await pdfAPI.wordToPDF(formData);
      
      // Set the result
      setResult({
        fileName: response.data.fileName,
        downloadUrl: `http://localhost:5000${response.data.downloadUrl}`,
      });      // Result is now set in the API call response handling above
    } catch (err) {
      setError('Failed to convert file. Please try again.');
      console.error(err);
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
    <div className="word-to-pdf-tool">
      <form onSubmit={handleSubmit}>
        {/* File Upload Area */}
        {!selectedFile ? (
          <div className="mb-4">
            <label htmlFor="wordFile" className="form-label fw-bold">Select a Word Document</label>
            <div 
              className="file-upload-area" 
              onClick={() => fileInputRef.current.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                id="wordFile" 
                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <FaFileWord size={24} className="mb-2 text-primary" />
              <p className="mb-1">Click to upload a Word document</p>
              <p className="text-muted small">Supports .doc and .docx formats</p>
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
                <FaFileWord className="text-primary" size={24} />
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
          <a 
            href={result.downloadUrl} 
            download={result.fileName} 
            className="btn btn-success w-100 mt-3"
          >
            Download PDF
          </a>
        </div>
      )}
    </div>
  );
};

export default WordToPDF;
