import React, { useState } from 'react';
import { FaCode, FaReact, FaCheck } from 'react-icons/fa';
import { converterAPI } from '../../utils/api';

const HTMLToReact = () => {
  const [htmlCode, setHtmlCode] = useState('');
  const [reactCode, setReactCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleInputChange = (e) => {
    setHtmlCode(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!htmlCode.trim()) {
      setError('Please enter HTML code to convert.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Send the HTML to the backend for conversion
      const response = await converterAPI.htmlToReact({ htmlCode });
      
      if (response.data && response.data.success) {
        setReactCode(response.data.reactCode);
      } else {
        throw new Error(response.data.message || 'Conversion failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to convert HTML to React';
      setError(`Error: ${errorMessage}. Please try again.`);
      console.error('HTML to React conversion error:', err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(reactCode)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
      })
      .catch(err => {
        console.error('Failed to copy code:', err);
        setError('Failed to copy to clipboard');
      });
  };

  return (
    <div className="html-to-react-tool">
      <form onSubmit={handleSubmit}>
        {/* HTML Input Area */}
        <div className="mb-4">
          <label htmlFor="htmlCode" className="form-label fw-bold">
            <FaCode className="me-2" />
            HTML Code
          </label>
          <textarea
            id="htmlCode"
            className="form-control font-monospace"
            rows="8"
            value={htmlCode}
            onChange={handleInputChange}
            placeholder="<div class='container'>\n  <h1>Hello World</h1>\n  <p>Enter your HTML code here</p>\n</div>"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          className="btn btn-primary btn-lg w-100" 
          disabled={isProcessing || !htmlCode.trim()}
        >
          {isProcessing ? 'Converting...' : 'Convert to React'}
          {isProcessing && (
            <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
          )}
        </button>
      </form>

      {/* Results Section */}
      {reactCode && !isProcessing && (
        <div className="result-section mt-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">
              <FaReact className="me-2" />
              React Component
            </h5>            <button 
              type="button" 
              className={`btn btn-sm ${copySuccess ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={copyToClipboard}
            >
              {copySuccess ? (
                <>
                  <FaCheck className="me-1" /> Copied!
                </>
              ) : (
                'Copy to Clipboard'
              )}
            </button>
          </div>
          <div className="p-3 border rounded bg-light">
            <pre className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
              <code>{reactCode}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default HTMLToReact;
