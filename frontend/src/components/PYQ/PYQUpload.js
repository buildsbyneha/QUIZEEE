// src/components/PYQ/PYQUpload.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Button from '../Common/Button';
import './PYQUpload.css';

function PYQUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    examType: '',
    subject: '',
    year: new Date().getFullYear()
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const examTypes = ['NEET', 'JEE', 'UPSC', 'SSC', 'GATE', 'CAT', 'CLAT'];
  const subjects = ['Biology', 'Chemistry', 'Physics', 'Mathematics', 'General Knowledge', 'English'];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    if (!formData.examType || !formData.subject) {
      setError('Please fill all required fields');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    setProgress(0);

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('examType', formData.examType);
    uploadFormData.append('subject', formData.subject);
    uploadFormData.append('year', formData.year);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await api.post('/pyq/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      setSuccess(`Successfully uploaded! ${response.data.count} questions extracted.`);
      
      setTimeout(() => {
        navigate('/pyq');
      }, 2000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload PDF. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pyq-upload-container">
      <div className="pyq-upload-header">
        <h1 className="upload-title">
          <span className="title-icon">📤</span>
          Upload PYQ Paper
        </h1>
        <p className="upload-subtitle">
          Upload PDF files and we'll automatically extract questions using AI
        </p>
      </div>

      <div className="upload-card">
        {error && <div className="message-box error">{error}</div>}
        {success && <div className="message-box success">{success}</div>}

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="file-upload-area">
            <input
              type="file"
              id="file-input"
              accept=".pdf"
              onChange={handleFileChange}
              className="file-input-hidden"
              disabled={uploading}
            />
            <label htmlFor="file-input" className="file-upload-label">
              <div className="upload-icon">📄</div>
              <p className="upload-text">
                {file ? file.name : 'Click to select PDF or drag and drop'}
              </p>
              <p className="upload-hint">Maximum file size: 10MB</p>
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Exam Type <span className="required">*</span>
              </label>
              <select
                name="examType"
                value={formData.examType}
                onChange={handleChange}
                required
                className="form-input"
                disabled={uploading}
              >
                <option value="">Select Exam Type</option>
                {examTypes.map(exam => (
                  <option key={exam} value={exam}>{exam}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Subject <span className="required">*</span>
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="form-input"
                disabled={uploading}
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Year</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="2000"
                max={new Date().getFullYear()}
                className="form-input"
                disabled={uploading}
              />
            </div>
          </div>

          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="progress-text">
                {progress < 90 ? 'Uploading and parsing...' : 'Extracting questions with AI...'}
              </p>
            </div>
          )}

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/pyq')}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={uploading}
              disabled={!file || uploading}
            >
              {uploading ? 'Processing...' : 'Upload & Process'}
            </Button>
          </div>
        </form>

        <div className="upload-info">
          <h3 className="info-title">📋 How it works:</h3>
          <ol className="info-list">
            <li>Upload your PYQ paper in PDF format</li>
            <li>Our AI automatically extracts questions and answers</li>
            <li>Questions are added to the question bank</li>
            <li>You can practice immediately after processing</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default PYQUpload;