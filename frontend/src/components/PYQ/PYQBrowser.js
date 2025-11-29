// src/components/PYQ/PYQBrowser.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Button from '../Common/Button';
import './PYQBrowser.css';

function PYQBrowser() {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    examType: '',
    subject: '',
    year: ''
  });

  useEffect(() => {
    fetchPapers();
  }, [filters]);

  const fetchPapers = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.examType) params.append('examType', filters.examType);
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.year) params.append('year', filters.year);

      const response = await api.get(`/question-bank/pyq?${params}`);
      setPapers(response.data.papers || []);
    } catch (error) {
      console.error('Failed to fetch PYQ papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPaper = async (paperId) => {
    try {
      // Generate exam from this paper
      navigate(`/pyq/${paperId}`);
    } catch (error) {
      console.error('Failed to start paper:', error);
    }
  };

  const examTypes = ['NEET', 'JEE', 'UPSC', 'SSC', 'GATE', 'CAT'];
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="pyq-browser">
      <div className="pyq-header">
        <h1 className="pyq-title">
          <span className="title-icon">📚</span>
          Previous Year Questions
        </h1>
        <p className="pyq-subtitle">
          Practice with authentic exam papers from past years
        </p>
      </div>

      <div className="pyq-filters">
        <div className="filter-group">
          <label className="filter-label">Exam Type</label>
          <select
            className="filter-select"
            value={filters.examType}
            onChange={(e) => setFilters({ ...filters, examType: e.target.value })}
          >
            <option value="">All Exams</option>
            {examTypes.map(exam => (
              <option key={exam} value={exam}>{exam}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Year</label>
          <select
            className="filter-select"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <Button onClick={fetchPapers}>
          Apply Filters
        </Button>
      </div>

      {loading ? (
        <div className="pyq-loading">
          <div className="spinner"></div>
          <p>Loading papers...</p>
        </div>
      ) : papers.length === 0 ? (
        <div className="pyq-empty">
          <span className="empty-icon">📭</span>
          <h3>No papers found</h3>
          <p>Try adjusting your filters or check back later for new papers</p>
        </div>
      ) : (
        <div className="pyq-grid">
          {papers.map((paper) => (
            <div key={paper.paper_id} className="pyq-card">
              <div className="pyq-card-header">
                <span className="pyq-exam-badge">{paper.exam_type}</span>
                <span className="pyq-year-badge">{paper.year}</span>
              </div>
              
              <h3 className="pyq-paper-title">{paper.paper_name}</h3>
              
              <div className="pyq-paper-info">
                <div className="info-item">
                  <span className="info-icon">📝</span>
                  <span>{paper.total_questions} Questions</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">⏱️</span>
                  <span>{paper.duration_minutes} Minutes</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">📖</span>
                  <span>{paper.subject}</span>
                </div>
              </div>

              <Button 
                fullWidth 
                onClick={() => handleStartPaper(paper.paper_id)}
              >
                Start Practice →
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PYQBrowser;