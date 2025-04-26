import React, { useState, useRef, useEffect } from 'react';
import * as fabric from 'fabric';
import { FaFileAlt, FaEdit, FaTrash, FaFont, FaImage, FaHighlighter, FaFileDownload, FaEye, FaCursor, FaMousePointer } from 'react-icons/fa';
import { pdfAPI } from '../../utils/api';

const PDFEditor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editorMode, setEditorMode] = useState('select'); // 'select', 'text', 'draw', 'image'
  const [editingOperations, setEditingOperations] = useState([]);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(16);
  const [fontColor, setFontColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [drawColor, setDrawColor] = useState('#FF0000');
  const [drawingMode, setDrawingMode] = useState('pencil'); // 'pencil', 'line', 'rectangle', 'circle'
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageWidth, setImageWidth] = useState(100);
  const [imageHeight, setImageHeight] = useState(100);
  const [textToAdd, setTextToAdd] = useState('');
  const [canvasObjects, setCanvasObjects] = useState([]);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate if it's a PDF file
    if (file.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);
    setEditingOperations([]);
    
    // Create a URL for the PDF preview
    const fileUrl = URL.createObjectURL(file);
    setPdfUrl(fileUrl);
    
    // Load the PDF for editing
    setIsLoading(true);
    
    // Simulate PDF analysis (in a real implementation, you might extract metadata here)
    setTimeout(() => {
      setPdfLoaded(true);
      setIsLoading(false);
      // For demonstration, we'll set a default number of pages
      // In a real implementation, you would get this from the PDF metadata
      setTotalPages(1);
      setCurrentPage(1);

      // Initialize the canvas after the PDF is loaded
      initCanvas();
    }, 1000);
  };

  // Initialize the fabric.js canvas
  const initCanvas = () => {
    if (!canvasRef.current) return;

    // Create a new fabric.js canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasContainerRef.current.offsetWidth,
      height: 500,
      backgroundColor: 'rgba(255, 255, 255, 0)',
      selection: true
    });

    fabricCanvasRef.current = canvas;

    // Set up event listeners for the canvas
    canvas.on('mouse:down', handleCanvasMouseDown);
    canvas.on('object:added', updateCanvasObjects);
    canvas.on('object:modified', updateCanvasObjects);
    canvas.on('object:removed', updateCanvasObjects);

    // Disable selection by default in drawing mode
    canvas.selection = editorMode === 'select';

    // Make canvas responsive
    window.addEventListener('resize', handleCanvasResize);

    return () => {
      canvas.dispose();
      window.removeEventListener('resize', handleCanvasResize);
    };
  };

  const handleCanvasResize = () => {
    if (fabricCanvasRef.current && canvasContainerRef.current) {
      fabricCanvasRef.current.setWidth(canvasContainerRef.current.offsetWidth);
      fabricCanvasRef.current.renderAll();
    }
  };

  const updateCanvasObjects = () => {
    if (fabricCanvasRef.current) {
      const objects = fabricCanvasRef.current.getObjects();
      setCanvasObjects(objects);
    }
  };

  // Clean up object URLs when component unmounts or when file changes
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Clean up canvas when component unmounts
  useEffect(() => {
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
    };
  }, []);

  // Update canvas mode when tab changes
  useEffect(() => {
    if (fabricCanvasRef.current) {
      if (activeTab === 'text') {
        setEditorMode('text');
        fabricCanvasRef.current.isDrawingMode = false;
      } else if (activeTab === 'draw') {
        setEditorMode('draw');
        fabricCanvasRef.current.isDrawingMode = true;
        updateBrushSettings();
      } else if (activeTab === 'image') {
        setEditorMode('image');
        fabricCanvasRef.current.isDrawingMode = false;
      }
    }
  }, [activeTab]);

  // Update brush settings when they change
  const updateBrushSettings = () => {
    if (fabricCanvasRef.current && fabricCanvasRef.current.freeDrawingBrush) {
      fabricCanvasRef.current.freeDrawingBrush.color = drawColor;
      fabricCanvasRef.current.freeDrawingBrush.width = parseInt(strokeWidth);
    }
  };

  useEffect(() => {
    updateBrushSettings();
  }, [drawColor, strokeWidth]);

  const handleCanvasMouseDown = (opts) => {
    if (!fabricCanvasRef.current) return;

    if (editorMode === 'text' && opts.target === null) {
      // Add text at mouse position
      const pointer = fabricCanvasRef.current.getPointer(opts.e);
      addTextToCanvas(pointer.x, pointer.y);
    } else if (editorMode === 'draw' && drawingMode !== 'pencil') {
      // Handle other drawing modes (line, rectangle, circle)
      const pointer = fabricCanvasRef.current.getPointer(opts.e);
      
      if (drawingMode === 'line') {
        addLineToCanvas(pointer.x, pointer.y);
      } else if (drawingMode === 'rectangle') {
        addRectangleToCanvas(pointer.x, pointer.y);
      } else if (drawingMode === 'circle') {
        addCircleToCanvas(pointer.x, pointer.y);
      }
    }
  };

  // Add text to the canvas
  const addTextToCanvas = (x, y) => {
    if (!fabricCanvasRef.current) return;

    const text = new fabric.IText(textToAdd || 'Double click to edit text', {
      left: x,
      top: y,
      fontFamily: fontFamily,
      fontSize: parseInt(fontSize),
      fill: fontColor,
      editable: true
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    
    // Add to editing operations
    const operation = {
      type: 'text',
      text: textToAdd || 'Double click to edit text',
      x: x,
      y: y,
      fontFamily: fontFamily,
      fontSize: parseInt(fontSize),
      color: fontColor,
      page: currentPage - 1
    };
    
    setEditingOperations(prev => [...prev, operation]);
  };

  // Add line to the canvas
  const addLineToCanvas = (x, y) => {
    if (!fabricCanvasRef.current) return;

    const line = new fabric.Line([x, y, x + 50, y + 50], {
      stroke: drawColor,
      strokeWidth: parseInt(strokeWidth),
      selectable: true
    });

    fabricCanvasRef.current.add(line);
    fabricCanvasRef.current.setActiveObject(line);
    
    // Add to editing operations
    const operation = {
      type: 'line',
      points: [x, y, x + 50, y + 50],
      color: drawColor,
      strokeWidth: parseInt(strokeWidth),
      page: currentPage - 1
    };
    
    setEditingOperations(prev => [...prev, operation]);
  };

  // Add rectangle to the canvas
  const addRectangleToCanvas = (x, y) => {
    if (!fabricCanvasRef.current) return;

    const rect = new fabric.Rect({
      left: x,
      top: y,
      width: 50,
      height: 50,
      fill: 'transparent',
      stroke: drawColor,
      strokeWidth: parseInt(strokeWidth),
      selectable: true
    });

    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
    
    // Add to editing operations
    const operation = {
      type: 'rectangle',
      x: x,
      y: y,
      width: 50,
      height: 50,
      color: drawColor,
      strokeWidth: parseInt(strokeWidth),
      page: currentPage - 1
    };
    
    setEditingOperations(prev => [...prev, operation]);
  };

  // Add circle to the canvas
  const addCircleToCanvas = (x, y) => {
    if (!fabricCanvasRef.current) return;

    const circle = new fabric.Circle({
      left: x,
      top: y,
      radius: 25,
      fill: 'transparent',
      stroke: drawColor,
      strokeWidth: parseInt(strokeWidth),
      selectable: true
    });

    fabricCanvasRef.current.add(circle);
    fabricCanvasRef.current.setActiveObject(circle);
    
    // Add to editing operations
    const operation = {
      type: 'circle',
      x: x,
      y: y,
      radius: 25,
      color: drawColor,
      strokeWidth: parseInt(strokeWidth),
      page: currentPage - 1
    };
    
    setEditingOperations(prev => [...prev, operation]);
  };

  // Handle image file selection
  const handleImageSelect = (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      setSelectedImage(evt.target.result);
    };
    
    reader.readAsDataURL(file);
  };

  // Add image to the canvas
  const addImageToCanvas = () => {
    if (!fabricCanvasRef.current || !selectedImage) return;

    fabric.Image.fromURL(selectedImage, (img) => {
      // Scale the image while maintaining aspect ratio
      img.scaleToWidth(parseInt(imageWidth));
      img.scaleToHeight(parseInt(imageHeight));
      
      // Position the image in the center of the canvas
      img.set({
        left: fabricCanvasRef.current.width / 2 - (img.width * img.scaleX) / 2,
        top: fabricCanvasRef.current.height / 2 - (img.height * img.scaleY) / 2
      });

      fabricCanvasRef.current.add(img);
      fabricCanvasRef.current.setActiveObject(img);
      
      // Add to editing operations
      const operation = {
        type: 'image',
        src: selectedImage,
        x: img.left,
        y: img.top,
        width: parseInt(imageWidth),
        height: parseInt(imageHeight),
        page: currentPage - 1
      };
      
      setEditingOperations(prev => [...prev, operation]);
    });
  };

  // Delete the currently selected object
  const deleteSelectedObject = () => {
    if (!fabricCanvasRef.current) return;

    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      fabricCanvasRef.current.remove(activeObject);
      fabricCanvasRef.current.renderAll();
    }
  };

  const removeFile = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setSelectedFile(null);
    setPdfLoaded(false);
    setError(null);
    setResult(null);
    setPdfUrl(null);
    setEditingOperations([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Clear canvas
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
    }
  };

  const handleSave = async () => {
    if (!selectedFile || !pdfLoaded) {
      setError('Please load a PDF file first.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create form data for API request
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      
      // Add operations data with the actual edits made
      const operations = {
        addText: editingOperations.filter(op => op.type === 'text').map(op => ({
          page: op.page,
          text: op.text,
          x: op.x,
          y: op.y,
          fontFamily: op.fontFamily,
          fontSize: op.fontSize,
          color: op.color
        })),
        addShapes: editingOperations.filter(op => ['line', 'rectangle', 'circle'].includes(op.type)),
        addImages: editingOperations.filter(op => op.type === 'image')
      };
      
      formData.append('operations', JSON.stringify(operations));
      
      // Send the PDF to the backend for saving edits
      const response = await pdfAPI.editPDF(formData);
      
      // Set the result
      setResult({
        fileName: response.data.fileName,
        downloadUrl: `http://localhost:5000${response.data.downloadUrl}`,
        message: response.data.message || 'PDF successfully edited and saved!'
      });
      
      setPdfLoaded(false);
      setIsLoading(false);
    } catch (error) {
      setError('Failed to save PDF edits. Please try again.');
      console.error('Error saving PDF edits:', error);
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      // Save current page edits
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      // Save current page edits
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="pdf-editor-tool">
      {/* File Upload Area */}
      {!selectedFile ? (
        <div className="mb-4">
          <label htmlFor="pdfFile" className="form-label fw-bold">Select a PDF to Edit</label>
          <div 
            className="file-upload-area" 
            onClick={() => fileInputRef.current.click()}
          >
            <input 
              type="file"
              ref={fileInputRef}
              id="pdfFile"
              accept=".pdf,application/pdf" 
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <FaFileAlt size={24} className="mb-2 text-danger" />
            <p className="mb-1">Click to upload a PDF file</p>
            <p className="text-muted small">Upload the PDF you want to edit</p>
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
              <FaFileAlt className="text-danger" size={24} />
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

      {/* Loading State */}
      {isLoading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading PDF...</span>
          </div>
          <p className="mt-2">Loading PDF file...</p>
        </div>
      )}

      {/* PDF Editor Interface */}
      {pdfLoaded && !isLoading && !result && (
        <div className="pdf-editor-interface mt-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'text' ? 'active' : ''}`}
                    onClick={() => setActiveTab('text')}
                  >
                    <FaFont className="me-2" />
                    Text
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'draw' ? 'active' : ''}`}
                    onClick={() => setActiveTab('draw')}
                  >
                    <FaHighlighter className="me-2" />
                    Draw
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'image' ? 'active' : ''}`}
                    onClick={() => setActiveTab('image')}
                  >
                    <FaImage className="me-2" />
                    Image
                  </button>
                </li>
                <li className="nav-item ms-auto">
                  <button 
                    className={`nav-link ${editorMode === 'select' ? 'active' : ''}`}
                    onClick={() => {
                      setEditorMode('select');
                      if (fabricCanvasRef.current) {
                        fabricCanvasRef.current.isDrawingMode = false;
                        fabricCanvasRef.current.selection = true;
                      }
                    }}
                  >
                    <FaMousePointer className="me-2" />
                    Select
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className="nav-link text-danger"
                    onClick={deleteSelectedObject}
                    title="Delete selected object"
                  >
                    <FaTrash className="me-2" />
                    Delete
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body">
              {/* PDF Preview with Canvas Overlay */}
              <div ref={canvasContainerRef} className="pdf-preview text-center bg-light mb-4 border rounded position-relative">
                <div className="canvas-container" style={{ position: 'relative', width: '100%', height: '500px' }}>
                  {/* PDF Iframe as background */}
                  <iframe 
                    src={`${pdfUrl}#page=${currentPage}`}
                    title="PDF Preview" 
                    width="100%" 
                    height="500" 
                    style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, border: 'none' }}
                  ></iframe>
                  
                  {/* Canvas for editing (overlays the PDF) */}
                  <canvas
                    ref={canvasRef}
                    style={{
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      zIndex: 2,
                      pointerEvents: 'auto'
                    }}
                  />
                </div>
                
                {/* Page navigation */}
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <button 
                    className="btn btn-sm btn-outline-secondary" 
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                  >
                    Previous Page
                  </button>
                  <p className="mb-0 text-muted small">Page {currentPage} of {totalPages}</p>
                  <button 
                    className="btn btn-sm btn-outline-secondary" 
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                  >
                    Next Page
                  </button>
                </div>
              </div>

              {/* Editing Tools */}
              <div className="editing-tools mb-4">
                {activeTab === 'text' && (
                  <div className="text-tools">
                    <div className="mb-3">
                      <label htmlFor="textToAdd" className="form-label">Text to Add</label>
                      <input 
                        type="text"
                        id="textToAdd"
                        className="form-control"
                        placeholder="Click on canvas to add this text"
                        value={textToAdd}
                        onChange={(e) => setTextToAdd(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="fontFamily" className="form-label">Font Family</label>
                      <select 
                        className="form-select" 
                        id="fontFamily"
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                      >
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                      </select>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="fontSize" className="form-label">Font Size</label>
                        <select 
                          className="form-select" 
                          id="fontSize"
                          value={fontSize}
                          onChange={(e) => setFontSize(e.target.value)}
                        >
                          <option value="8">8</option>
                          <option value="10">10</option>
                          <option value="12">12</option>
                          <option value="14">14</option>
                          <option value="16">16</option>
                          <option value="18">18</option>
                          <option value="20">20</option>
                          <option value="24">24</option>
                          <option value="36">36</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="fontColor" className="form-label">Color</label>
                        <input 
                          type="color" 
                          className="form-control form-control-color w-100" 
                          id="fontColor" 
                          value={fontColor}
                          onChange={(e) => setFontColor(e.target.value)}
                        />
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={() => {
                        if (fabricCanvasRef.current) {
                          addTextToCanvas(
                            fabricCanvasRef.current.width / 2, 
                            fabricCanvasRef.current.height / 2
                          );
                        }
                      }}
                    >
                      Add Text to Center
                    </button>
                  </div>
                )}

                {activeTab === 'draw' && (
                  <div className="draw-tools">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="strokeWidth" className="form-label">Stroke Width</label>
                        <input 
                          type="range" 
                          className="form-range" 
                          id="strokeWidth" 
                          min="1" 
                          max="20"
                          value={strokeWidth}
                          onChange={(e) => setStrokeWidth(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="drawColor" className="form-label">Color</label>
                        <input 
                          type="color" 
                          className="form-control form-control-color w-100" 
                          id="drawColor"
                          value={drawColor}
                          onChange={(e) => setDrawColor(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="btn-group w-100" role="group">
                        <button 
                          type="button" 
                          className={`btn ${drawingMode === 'pencil' ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => {
                            setDrawingMode('pencil');
                            if (fabricCanvasRef.current) {
                              fabricCanvasRef.current.isDrawingMode = true;
                              updateBrushSettings();
                            }
                          }}
                        >
                          Pen
                        </button>
                        <button 
                          type="button" 
                          className={`btn ${drawingMode === 'line' ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => {
                            setDrawingMode('line');
                            if (fabricCanvasRef.current) {
                              fabricCanvasRef.current.isDrawingMode = false;
                            }
                          }}
                        >
                          Line
                        </button>
                        <button 
                          type="button" 
                          className={`btn ${drawingMode === 'rectangle' ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => {
                            setDrawingMode('rectangle');
                            if (fabricCanvasRef.current) {
                              fabricCanvasRef.current.isDrawingMode = false;
                            }
                          }}
                        >
                          Rectangle
                        </button>
                        <button 
                          type="button" 
                          className={`btn ${drawingMode === 'circle' ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => {
                            setDrawingMode('circle');
                            if (fabricCanvasRef.current) {
                              fabricCanvasRef.current.isDrawingMode = false;
                            }
                          }}
                        >
                          Circle
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'image' && (
                  <div className="image-tools">
                    <div className="mb-3">
                      <label htmlFor="imageUpload" className="form-label">Upload Image</label>
                      <input 
                        type="file" 
                        className="form-control" 
                        id="imageUpload" 
                        ref={imageInputRef}
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="imageWidth" className="form-label">Width</label>
                        <div className="input-group">
                          <input 
                            type="number" 
                            className="form-control" 
                            id="imageWidth"
                            value={imageWidth}
                            onChange={(e) => setImageWidth(e.target.value)}
                          />
                          <span className="input-group-text">px</span>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="imageHeight" className="form-label">Height</label>
                        <div className="input-group">
                          <input 
                            type="number" 
                            className="form-control" 
                            id="imageHeight"
                            value={imageHeight}
                            onChange={(e) => setImageHeight(e.target.value)}
                          />
                          <span className="input-group-text">px</span>
                        </div>
                      </div>
                    </div>
                    {selectedImage && (
                      <div className="text-center mb-3">
                        <img 
                          src={selectedImage} 
                          alt="Selected" 
                          style={{ 
                            maxWidth: '100%',
                            maxHeight: '100px',
                            objectFit: 'contain'
                          }} 
                        />
                      </div>
                    )}
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      disabled={!selectedImage}
                      onClick={addImageToCanvas}
                    >
                      Add Image to Canvas
                    </button>
                  </div>
                )}

                {/* Canvas objects list */}
                {canvasObjects.length > 0 && (
                  <div className="mt-4">
                    <h6>Objects on Canvas ({canvasObjects.length})</h6>
                    <ul className="list-group">
                      {canvasObjects.map((obj, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          <span>
                            {obj.type === 'i-text' ? 'Text' : 
                             obj.type === 'rect' ? 'Rectangle' : 
                             obj.type === 'circle' ? 'Circle' : 
                             obj.type === 'line' ? 'Line' : 
                             obj.type === 'image' ? 'Image' : obj.type}
                          </span>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              if (fabricCanvasRef.current) {
                                fabricCanvasRef.current.remove(obj);
                              }
                            }}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="d-flex justify-content-between">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={removeFile}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={handleSave}
                >
                  <FaFileDownload className="me-2" />
                  Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && !isLoading && (
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
              href={result.downloadUrl} 
              download={result.fileName} 
              className="btn btn-success flex-grow-1"
            >
              <FaFileDownload className="me-2" /> Download
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
                  download={result.fileName} 
                  className="btn btn-success"
                >
                  <FaFileDownload className="me-2" /> Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {showPreview && result && <div className="modal-backdrop show" onClick={() => setShowPreview(false)}></div>}
    </div>
  );
};

export default PDFEditor;
