import React, { useState, useRef, useEffect } from 'react';
import { FaImage, FaTrash, FaMagic, FaExclamationTriangle, FaDownload, FaRedo } from 'react-icons/fa';
import { mediaAPI } from '../../utils/api';
import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs';

const ImageBgRemover = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [useClientProcessing, setUseClientProcessing] = useState(false);
  const [model, setModel] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const dragAreaRef = useRef(null);

  // Load TensorFlow model on component mount if client processing enabled
  useEffect(() => {
    let isMounted = true;

    if (useClientProcessing && !model) {
      const loadModel = async () => {
        try {
          setModelLoading(true);
          // Load BodyPix model with lower memory settings
          const loadedModel = await bodyPix.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            multiplier: 0.75,
            quantBytes: 2
          });
          
          if (isMounted) {
            setModel(loadedModel);
            setModelLoading(false);
          }
        } catch (err) {
          console.error('Error loading TensorFlow model:', err);
          if (isMounted) {
            setError('Failed to load AI model. Please try again later or use server processing.');
            setModelLoading(false);
          }
        }
      };

      loadModel();
    }

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
      // Clean up TensorFlow memory
      if (model) {
        try {
          // Dispose tensors
          if (window.tf) {
            window.tf.disposeVariables();
            window.tf.engine().purgeUnusedTensors();
          }
        } catch (e) {
          console.error('Error cleaning up TensorFlow resources:', e);
        }
      }
    };
  }, [useClientProcessing, model]);

  // Add drag and drop functionality
  useEffect(() => {
    if (!dragAreaRef.current) return;
    
    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragAreaRef.current.classList.add('drag-over');
    };
    
    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragAreaRef.current.classList.remove('drag-over');
    };
    
    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragAreaRef.current.classList.remove('drag-over');
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    };
    
    const element = dragAreaRef.current;
    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('dragleave', handleDragLeave);
    element.addEventListener('drop', handleDrop);
    
    return () => {
      if (element) {
        element.removeEventListener('dragover', handleDragOver);
        element.removeEventListener('dragleave', handleDragLeave);
        element.removeEventListener('drop', handleDrop);
      }
    };
  }, []);

  const handleFile = (file) => {
    // Validate if it's an image file
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    // Validate file size (limit to 5MB for example)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB.');
      return;
    }

    setSelectedImage(file);
    setError(null);

    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleFile(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    setProcessedImage(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Client-side background removal with TensorFlow.js
  const processImageClientSide = async () => {
    if (!model || !imageRef.current) {
      throw new Error('Model or image not ready');
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to match the image
    canvas.width = imageRef.current.width;
    canvas.height = imageRef.current.height;
    
    try {
      // Simulate processing stages for better UX
      for (let i = 0; i <= 80; i += 20) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Segment person from image
      const segmentation = await model.segmentPerson(imageRef.current, {
        flipHorizontal: false,
        internalResolution: 'medium',
        segmentationThreshold: 0.7
      });
      
      setUploadProgress(90);
      
      // Draw original image
      ctx.drawImage(imageRef.current, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Apply mask to make background transparent
      for (let i = 0; i < data.length; i += 4) {
        const pixelIndex = Math.floor(i / 4);
        
        // If not part of the person, make transparent
        if (!segmentation.data[pixelIndex]) {
          data[i + 3] = 0; // Set alpha to 0
        }
      }
      
      // Put the modified image data back
      ctx.putImageData(imageData, 0, 0);
      
      setUploadProgress(100);
      
      // Return the result as data URL
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error in client-side processing:', error);
      throw error;
    } finally {
      // Clean up TensorFlow memory
      if (window.tf) {
        window.tf.engine().startScope();
        window.tf.engine().endScope();
        window.tf.engine().disposeVariables();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedImage) {
      setError('Please select an image first.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setUploadProgress(0);

    try {
      let result;
      
      if (useClientProcessing) {
        // Process on client side with TensorFlow.js
        if (modelLoading) {
          throw new Error('AI model is still loading. Please wait.');
        }
        
        result = await processImageClientSide();
        setProcessedImage(result);
      } else {
        // Process using server API (with progress simulation for better UX)
        const formData = new FormData();
        formData.append('image', selectedImage);
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 500);
        
        try {
          const response = await mediaAPI.removeImageBackground(formData);
          clearInterval(progressInterval);
          setUploadProgress(100);
          
          // Construct proper download URL
          const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
          const downloadUrl = response.data.downloadUrl.startsWith('http') 
            ? response.data.downloadUrl 
            : `${baseUrl}${response.data.downloadUrl}`;
            
          setProcessedImage(downloadUrl);
        } catch (err) {
          clearInterval(progressInterval);
          throw err;
        }
      }
    } catch (err) {
      console.error('Processing error:', err);
      
      if (err.response && err.response.data.fallback) {
        // If server suggests falling back to client-side processing
        setError('Server processing failed. Switching to client-side processing...');
        setUseClientProcessing(true);
      } else {
        setError(`Failed to process image: ${err.message}`);
      }
      setUploadProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="image-bg-remover-tool">
      <div className="mb-3">
        <div className="alert alert-info">
          <FaMagic className="me-2" />
          Our AI-powered background removal uses advanced technology for professional results
        </div>
        
        {/* Processing method toggle */}
        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="processingModeSwitch"
            checked={useClientProcessing}
            onChange={() => setUseClientProcessing(!useClientProcessing)}
          />
          <label className="form-check-label" htmlFor="processingModeSwitch">
            {useClientProcessing ? 'Client-side processing (faster)' : 'Server-side processing (better quality)'}
          </label>
        </div>
        
        {modelLoading && useClientProcessing && (
          <div className="alert alert-warning">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            Loading AI model for client-side processing...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* File Upload Area */}
        {!selectedImage ? (
          <div className="mb-4">
            <label htmlFor="imageFile" className="form-label fw-bold">Select an Image</label>
            <div 
              ref={dragAreaRef}
              className="file-upload-area" 
              onClick={() => fileInputRef.current.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                id="imageFile" 
                accept="image/*" 
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <FaImage size={24} className="mb-2 text-secondary" />
              <p className="mb-1">Click or drag an image here</p>
              <p className="text-muted small">Supports JPG, PNG, WEBP (Max: 5MB)</p>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label fw-bold mb-0">Selected Image</label>
              <button 
                type="button" 
                className="btn btn-sm btn-outline-danger" 
                onClick={removeImage}
              >
                <FaTrash className="me-1" /> Remove
              </button>
            </div>
            
            <div className="text-center p-3 border rounded">
              <img 
                ref={imageRef}
                src={previewImage} 
                alt="Preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '300px',
                  objectFit: 'contain'
                }}
                crossOrigin="anonymous"
              />
              <p className="mt-2 mb-0 text-muted small">
                {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger">
            <FaExclamationTriangle className="me-2" />
            {error}
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && uploadProgress > 0 && (
          <div className="mb-3">
            <div className="progress" style={{ height: '25px' }}>
              <div 
                className="progress-bar progress-bar-striped progress-bar-animated" 
                role="progressbar" 
                style={{ width: `${uploadProgress}%` }}
                aria-valuenow={uploadProgress} 
                aria-valuemin="0" 
                aria-valuemax="100"
              >
                {uploadProgress}%
              </div>
            </div>
            <p className="small text-center mt-1">
              {uploadProgress < 30 && 'Uploading image...'}
              {uploadProgress >= 30 && uploadProgress < 60 && 'Analyzing image...'}
              {uploadProgress >= 60 && uploadProgress < 90 && 'Removing background...'}
              {uploadProgress >= 90 && 'Finalizing results...'}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          className="btn btn-primary btn-lg w-100" 
          disabled={isProcessing || !selectedImage || (useClientProcessing && modelLoading)}
        >
          {isProcessing ? 'Removing Background...' : 'Remove Background'}
          {isProcessing && !uploadProgress && (
            <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
          )}
        </button>
      </form>

      {/* Results Section */}
      {processedImage && !isProcessing && (
        <div className="result-section mt-4">
          <h5 className="mb-3">Result</h5>
          <div className="text-center p-3 border rounded bg-light">
            <div className="position-relative">
              <div className="bg-checkerboard" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}></div>
              <img 
                src={processedImage} 
                alt="Processed result" 
                className="img-fluid rounded position-relative"
                style={{ maxHeight: '350px' }}
              />
            </div>
          </div>
          <div className="d-flex mt-3">
            <a 
              href={processedImage} 
              download="bg-removed.png" 
              className="btn btn-success flex-grow-1 me-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaDownload className="me-2" /> Download Image
            </a>
            <button 
              type="button" 
              className="btn btn-outline-secondary"
              onClick={() => {
                removeImage();
                setProcessedImage(null);
              }}
            >
              <FaRedo className="me-2" /> Process Another Image
            </button>
          </div>
        </div>
      )}
      
      {/* Hidden canvas for image processing */}
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ImageBgRemover;
