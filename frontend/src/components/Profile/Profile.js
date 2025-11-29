// src/components/Profile/Profile.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import Button from '../Common/Button';
import InterestSelector from './InterestSelector';
import './Profile.css';

function Profile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    target_exam: '',
    study_field: '',
    subject_preference: '',
    interests: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileService.getProfile();
      const profile = response.profile;
      
      setFormData({
        name: profile.name || '',
        age: user.age || '',
        target_exam: profile.target_exam || '',
        study_field: profile.study_field || '',
        subject_preference: profile.subject_preference || '',
        interests: profile.interests || []
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const handleInterestsChange = (newInterests) => {
    setFormData({ ...formData, interests: newInterests });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await profileService.updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">Profile Settings</h1>
        <p className="profile-subtitle">Manage your account information and preferences</p>
      </div>

      {message.text && (
        <div className={`message-box ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h3 className="section-title">Personal Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="age" className="form-label">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="10"
                max="100"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="form-input disabled"
            />
            <span className="form-hint">Email cannot be changed</span>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Academic Information</h3>
          
          <div className="form-group">
            <label htmlFor="target_exam" className="form-label">Target Exam</label>
            <select
              id="target_exam"
              name="target_exam"
              value={formData.target_exam}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select Target Exam</option>
              <option value="NEET">NEET</option>
              <option value="JEE">JEE (Main/Advanced)</option>
              <option value="UPSC">UPSC</option>
              <option value="SSC">SSC</option>
              <option value="GATE">GATE</option>
              <option value="CAT">CAT</option>
              <option value="CLAT">CLAT</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="study_field" className="form-label">Study Field</label>
            <select
              id="study_field"
              name="study_field"
              value={formData.study_field}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select Study Field</option>
              <option value="Science">Science (PCM/PCB)</option>
              <option value="Commerce">Commerce</option>
              <option value="Arts">Arts/Humanities</option>
              <option value="Engineering">Engineering</option>
              <option value="Medical">Medical</option>
              <option value="Law">Law</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subject_preference" className="form-label">Preferred Subject</label>
            <input
              type="text"
              id="subject_preference"
              name="subject_preference"
              value={formData.subject_preference}
              onChange={handleChange}
              placeholder="e.g., Physics, Mathematics, Biology"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Learning Interests</h3>
          <InterestSelector
            interests={formData.interests}
            onChange={handleInterestsChange}
          />
        </div>

        <div className="form-actions">
          <Button type="submit" loading={saving} fullWidth>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Profile;