import React, { useState, useRef, useEffect } from 'react';
import { FaFileImage, FaFileVideo, FaFileAudio, FaCompress, FaTrash, FaDownload, FaEye } from 'react-icons/fa';
import { mediaAPI } from '../../utils/api';

const MediaCompressor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null); // 'image', 'video', or 'audio'
  const [compressionLevel, setCompressionLevel] = useState('medium'); // 'low', 'medium', or 'high'
  const [compressionMode, setCompressionMode] = useState('preset'); // 'preset' or 'custom'
  const [targetSizeValue, setTargetSizeValue] = useState(1); // Default 1MB
  const [targetSizeUnit, setTargetSizeUnit] = useState('MB'); // 'KB' or 'MB'
  const [targetSizeBytes, setTargetSizeBytes] = useState(1048576); // 1MB in bytes
  const [compressionSliderValue, setCompressionSliderValue] = useState(70); // 0-100 scale
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Determine file type based on MIME type
    if (file.type.startsWith('image/')) {
      setFileType('image');
    } else if (file.type.startsWith('video/')) {
      setFileType('video');
    } else if (file.type.startsWith('audio/')) {
      setFileType('audio');
    } else {
      setError('Unsupported file type. Please upload an image, video, or audio file.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileType(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCompressionLevelChange = (e) => {
    setCompressionLevel(e.target.value);
  };
  
  const handleCompressionModeChange = (mode) => {
    setCompressionMode(mode);
  };
  
  const handleTargetSizeValueChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setTargetSizeValue(value);
      updateTargetSizeBytes(value, targetSizeUnit);
    }
  };
  
  const handleTargetSizeUnitChange = (e) => {
    const newUnit = e.target.value;
    setTargetSizeUnit(newUnit);
    updateTargetSizeBytes(targetSizeValue, newUnit);
  };
  
  const handleSliderChange = (e) => {
    setCompressionSliderValue(parseInt(e.target.value));
  };
  
  const updateTargetSizeBytes = (value, unit) => {
    const multiplier = unit === 'KB' ? 1024 : 1048576; // 1024 for KB, 1048576 for MB
    setTargetSizeBytes(value * multiplier);
  };
  
  // Calculate max slider value based on file size
  useEffect(() => {
    if (selectedFile) {
      // Set slider max to 90% of original file size
      const maxTargetSize = Math.ceil(selectedFile.size / 1048576); // Convert to MB
      setTargetSizeValue(Math.min(maxTargetSize / 2, 1)); // Half of max or 1MB, whichever is smaller
      updateTargetSizeBytes(Math.min(maxTargetSize / 2, 1), 'MB');
    }
  }, [selectedFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select a file to compress.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create form data for API request
      const formData = new FormData();
      const originalSize = selectedFile.size;
      
      // Add compression settings based on mode (preset vs custom target size)
      if (compressionMode === 'preset') {
        // Map compression levels to appropriate values based on media type
        if (fileType === 'image') {
          // For images, map to quality values between 0-100
          const imageQualityMap = {
            low: 90, // Low compression = high quality (90)
            medium: 70, // Medium compression = medium quality (70)
            high: 40 // High compression = low quality (40)
          };
          formData.append('quality', imageQualityMap[compressionLevel]);
          formData.append('mode', 'preset');
        } else if (fileType === 'video') {
          // For videos, pass the compression level directly
          formData.append('quality', compressionLevel);
          formData.append('mode', 'preset');
        } else if (fileType === 'audio') {
          // For audio, map to bitrates
          const audioBitrateMap = {
            low: 192, // Low compression = high bitrate
            medium: 128, // Medium compression = medium bitrate
            high: 64 // High compression = low bitrate
          };
          formData.append('quality', audioBitrateMap[compressionLevel]);
          formData.append('mode', 'preset');
        }
      } else {
        // Custom target size mode
        formData.append('mode', 'targetSize');
        formData.append('targetSize', targetSizeBytes.toString());
        
        // For image compression via slider, add quality preference
        if (fileType === 'image') {
          formData.append('quality', compressionSliderValue.toString());
        }
      }
      
      // Add the file to the form data
      if (fileType === 'image') {
        formData.append('image', selectedFile);
      } else if (fileType === 'video') {
        formData.append('video', selectedFile);
      } else if (fileType === 'audio') {
        formData.append('audio', selectedFile);
      }
      
      // Call the appropriate API endpoint based on file type
      let response;
      
      if (fileType === 'image') {
        response = await mediaAPI.compressImage(formData);
      } else if (fileType === 'video') {
        response = await mediaAPI.compressVideo(formData);
      } else if (fileType === 'audio') {
        response = await mediaAPI.compressAudio(formData);
      }
      
      // Get the base URL for constructing the download URL
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Set the result with data from the backend
      // Ensure the downloadUrl is properly formed with the base URL
      const downloadUrl = response.data.downloadUrl.startsWith('/')
        ? `${baseUrl}${response.data.downloadUrl}`
        : response.data.downloadUrl;
        
      setResult({
        fileName: response.data.fileName || `compressed-${selectedFile.name}`,
        downloadUrl: downloadUrl,
        originalSize: originalSize,
        compressedSize: response.data.compressedSize || originalSize * 0.7, // Use backend size if available
        compressionRate: response.data.compressionRate || 30 // Use backend rate if available
      });
    } catch (err) {
      setError('Failed to compress file. Please try again.');
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

  const getFileIcon = () => {
    switch (fileType) {
      case 'image':
        return <FaFileImage className="text-success" size={24} />;
      case 'video':
        return <FaFileVideo className="text-danger" size={24} />;
      case 'audio':
        return <FaFileAudio className="text-primary" size={24} />;
      default:
        return <FaFileImage className="text-muted" size={24} />;
    }
  };

  const getAcceptTypes = () => {
    return "image/*, video/*, audio/*";
  };

  const getCompressionDescription = () => {
    switch (compressionLevel) {
      case 'low':
        return 'Low compression - Better quality, larger file size';
      case 'medium':
        return 'Medium compression - Balanced quality and file size';
      case 'high':
        return 'High compression - Smaller file size, may affect quality';
      default:
        return '';
    }
  };

  return (
    <div className="media-compressor-tool">
      <form onSubmit={handleSubmit}>
        {/* File Upload Area */}
        {!selectedFile ? (
          <div className="mb-4">
            <label htmlFor="mediaFile" className="form-label fw-bold">Select a File to Compress</label>
            <div 
              className="file-upload-area" 
              onClick={() => fileInputRef.current.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                id="mediaFile" 
                accept={getAcceptTypes()} 
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <FaCompress size={24} className="mb-2 text-secondary" />
              <p className="mb-1">Click to upload a file</p>
              <p className="text-muted small">Supports image, video, and audio files</p>
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
                {getFileIcon()}
              </div>
              <div className="file-preview-info">
                <div className="file-preview-name">{selectedFile.name}</div>
                <div className="file-preview-size">{formatFileSize(selectedFile.size)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Compression Options - Only show if a file is selected */}
        {selectedFile && (
          <div className="mb-4">
            <ul className="nav nav-tabs mb-3" role="tablist">
              <li className="nav-item" role="presentation">
                <button 
                  className={`nav-link ${compressionMode === 'preset' ? 'active' : ''}`} 
                  onClick={() => handleCompressionModeChange('preset')}
                  type="button"
                  style={{ 
                    backgroundColor: compressionMode === 'preset' ? 'rgb(125 111 255)' : 'rgb(230, 230, 230)', 
                    fontWeight: 'bold',
                    color: 'black',
                    border: '1px solid #dee2e6',
                    borderBottom: compressionMode === 'preset' ? 'none' : '1px solid #dee2e6'
                  }}
                >
                  Preset Levels
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button 
                  className={`nav-link ${compressionMode === 'custom' ? 'active' : ''}`}
                  onClick={() => handleCompressionModeChange('custom')}
                  type="button"
                  style={{ 
                    backgroundColor: compressionMode === 'custom' ? 'rgb(125 111 255)' : 'rgb(230, 230, 230)', 
                    fontWeight: 'bold',
                    color: 'black',
                    border: '1px solid #dee2e6',
                    borderBottom: compressionMode === 'custom' ? 'none' : '1px solid #dee2e6'
                  }}
                >
                  Custom Size
                </button>
              </li>
            </ul>
            
            <div className="tab-content p-3 border rounded" style={{ borderColor: '#dee2e6', borderTopLeftRadius: 0 }}>
              {compressionMode === 'preset' && (
                <div className="preset-options">
                  <label className="form-label fw-bold">Compression Level</label>
                  <div className="compression-options">
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="radio" 
                        name="compressionLevel" 
                        id="compressionLow" 
                        value="low"
                        checked={compressionLevel === 'low'}
                        onChange={handleCompressionLevelChange}
                      />
                      <label className="form-check-label" htmlFor="compressionLow">
                        Low
                      </label>
                    </div>
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="radio" 
                        name="compressionLevel" 
                        id="compressionMedium" 
                        value="medium"
                        checked={compressionLevel === 'medium'}
                        onChange={handleCompressionLevelChange}
                      />
                      <label className="form-check-label" htmlFor="compressionMedium">
                        Medium
                      </label>
                    </div>
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="radio" 
                        name="compressionLevel" 
                        id="compressionHigh" 
                        value="high"
                        checked={compressionLevel === 'high'}
                        onChange={handleCompressionLevelChange}
                      />
                      <label className="form-check-label" htmlFor="compressionHigh">
                        High
                      </label>
                    </div>
                  </div>
                  <p className="text-muted small mt-1">{getCompressionDescription()}</p>
                </div>
              )}
              
              {compressionMode === 'custom' && (
                <div className="custom-size-options">
                  <label className="form-label fw-bold">Target File Size</label>
                  <div className="input-group mb-3">
                    <input 
                      type="number" 
                      className="form-control"
                      value={targetSizeValue}
                      onChange={handleTargetSizeValueChange}
                      min="0.1"
                      step="0.1"
                    />
                    <select 
                      className="form-select" 
                      style={{maxWidth: '80px'}}
                      value={targetSizeUnit}
                      onChange={handleTargetSizeUnitChange}
                    >
                      <option value="KB">KB</option>
                      <option value="MB">MB</option>
                    </select>
                  </div>
                  
                  {fileType === 'image' && (
                    <div className="mt-3">
                      <label className="form-label d-flex justify-content-between text-dark">
                        <span>Quality vs. Size</span>
                        <span className="small">{compressionSliderValue}%</span>
                      </label>
                      <input 
                        type="range" 
                        className="form-range" 
                        min="10" 
                        max="95" 
                        value={compressionSliderValue}
                        onChange={handleSliderChange}
                      />
                      <div className="d-flex justify-content-between small text-dark">
                        <span>Smaller File</span>
                        <span>Better Quality</span>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-dark small mt-1">
                    Target size: {formatFileSize(targetSizeBytes)}
                    {selectedFile && ` (Original: ${formatFileSize(selectedFile.size)})`}
                  </p>
                </div>
              )}
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
          {isProcessing ? 'Compressing...' : 'Compress File'}
          {isProcessing && (
            <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
          )}
        </button>
      </form>

      {/* Results Section */}
      {result && !isProcessing && (
        <div className="result-section mt-4">
          <div className="alert alert-success">
            File compressed successfully!
          </div>
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <h5 className="card-title">Compression Results</h5>
              <div className="row mb-3">
                <div className="col-md-6">
                  <p className="mb-1 fw-bold">Original Size:</p>
                  <p className="mb-0">{formatFileSize(result.originalSize)}</p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1 fw-bold">Compressed Size:</p>
                  <p className="mb-0">{formatFileSize(result.compressedSize)}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="d-flex align-items-center justify-content-center">
                  <div className="me-2">{formatFileSize(result.originalSize)}</div>
                  <div className="progress flex-grow-1" style={{ height: '20px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: `${result.compressionRate}%` }}
                    >
                      {result.compressionRate}% smaller
                    </div>
                  </div>
                  <div className="ms-2">{formatFileSize(result.compressedSize)}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Use proper download attributes to ensure file downloads */}
          <a 
            href={result.downloadUrl} 
            download={result.fileName}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success w-100"
          >
            <FaDownload className="me-2" />
            Download Compressed File
          </a>
        </div>
      )}
    </div>
  );
};

export default MediaCompressor;
