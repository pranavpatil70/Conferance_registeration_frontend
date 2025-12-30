'use client';

import { useState } from 'react';

const API_URL = '/api';

export default function Home() {
  const [view, setView] = useState('landing'); // landing, student, professional, success
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    company: '',
    phone: ''
  });
  const [emailChecking, setEmailChecking] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ email: string; type: string } | null>(null);

  const formatPhone = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    // Format as XXXXX XXXXX
    if (digits.length >= 10) {
      return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
    } else if (digits.length >= 5) {
      return `${digits.slice(0, 5)} ${digits.slice(5)}`;
    } else {
      return digits;
    }
  };

  const validateEmail = async (email: string) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format';

    setEmailChecking(true);
    try {
      const response = await fetch(`${API_URL}/registrations?checkEmail=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (!data.available) return 'Email is already registered';
    } catch (err) {
      return 'Unable to verify email';
    } finally {
      setEmailChecking(false);
    }
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'phone') {
      formattedValue = formatPhone(value);
    }

    setFormData({
      ...formData,
      [name]: formattedValue
    });

    // Clear field error on change
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }
  };

  const handleEmailBlur = async () => {
    const error = await validateEmail(formData.email);
    setFieldErrors({
      ...fieldErrors,
      email: error
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check for field errors
    const errors = { ...fieldErrors };
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (fieldErrors.email) errors.email = fieldErrors.email; // Keep async error
    if (view === 'professional' && !formData.company.trim()) errors.company = 'Company is required';

    setFieldErrors(errors);

    // If any errors, don't submit
    if (Object.values(errors).some(err => err)) return;

    setLoading(true);

    try {
      const registrationType = view === 'student' ? 'student' : 'professional';

      const response = await fetch(`${API_URL}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          registration_type: registrationType,
          company: formData.company || null,
          phone: formData.phone || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSubmittedData({ email: formData.email, type: registrationType });
      setView('success');
      setFormData({ name: '', email: '', company: '', phone: '' });
      setFieldErrors({ name: '', email: '', company: '', phone: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setView('landing');
    setFormData({ name: '', email: '', company: '', phone: '' });
    setError('');
    setFieldErrors({ name: '', email: '', company: '', phone: '' });
  };

  const handleRegisterAnother = () => {
    setView('landing');
    setFormData({ name: '', email: '', company: '', phone: '' });
    setFieldErrors({ name: '', email: '', company: '', phone: '' });
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --primary: #FF6B35;
          --secondary: #004E89;
          --accent: #F7B801;
          --dark: #1A1A2E;
          --light: #F4F4F9;
          --success: #06D6A0;
          --error: #EF476F;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'DM Sans', sans-serif;
          background: linear-gradient(135deg, var(--secondary) 0%, var(--dark) 100%);
          min-height: 100vh;
          color: var(--dark);
          overflow-x: hidden;
        }

        .background-pattern {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.1;
          background-image:
            repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px);
          pointer-events: none;
          z-index: 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }

        .header {
          text-align: center;
          margin-bottom: 4rem;
          animation: fadeInDown 0.8s ease-out;
        }

        .header h1 {
          font-family: 'Space Mono', monospace;
          font-size: 3.5rem;
          font-weight: 700;
          color: var(--light);
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          text-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .header p {
          font-size: 1.3rem;
          color: var(--accent);
          font-weight: 500;
        }

        .landing-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          animation: fadeIn 1s ease-out 0.3s both;
        }

        .button-group {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .register-button {
          font-family: 'Space Mono', monospace;
          font-size: 1.2rem;
          font-weight: 700;
          padding: 2rem 3rem;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .register-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }

        .register-button:hover::before {
          left: 100%;
        }

        .register-button.student {
          background: linear-gradient(135deg, var(--primary), #ff8c5a);
          color: white;
        }

        .register-button.professional {
          background: linear-gradient(135deg, var(--accent), #ffd24d);
          color: var(--dark);
        }

        .register-button:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 15px 40px rgba(0,0,0,0.4);
        }

        .form-container {
          background: white;
          border-radius: 20px;
          padding: 3rem;
          max-width: 600px;
          width: 100%;
          margin: 0 auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          animation: slideIn 0.5s ease-out;
        }

        .form-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .form-header h2 {
          font-family: 'Space Mono', monospace;
          font-size: 2rem;
          color: var(--dark);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }

        .form-header .badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-header .badge.student {
          background: var(--primary);
          color: white;
        }

        .form-header .badge.professional {
          background: var(--accent);
          color: var(--dark);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--dark);
          font-size: 0.95rem;
        }

        .form-group label .required {
          color: var(--error);
        }

        .form-group input {
          width: 100%;
          padding: 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--secondary);
          box-shadow: 0 0 0 3px rgba(0, 78, 137, 0.1);
        }

        .form-group .field-error {
          color: var(--error);
          font-size: 0.85rem;
          margin-top: 0.25rem;
          display: block;
        }

        .form-group input.error {
          border-color: var(--error);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn {
          flex: 1;
          padding: 1rem 2rem;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: 'Space Mono', monospace;
        }

        .btn-primary {
          background: var(--secondary);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #003a6b;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .btn-secondary {
          background: #e0e0e0;
          color: var(--dark);
        }

        .btn-secondary:hover {
          background: #d0d0d0;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .success-message {
          background: linear-gradient(135deg, var(--success), #00b894);
          color: white;
          padding: 3rem;
          border-radius: 20px;
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          animation: bounceIn 0.6s ease-out;
        }

        .success-message h2 {
          font-family: 'Space Mono', monospace;
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .success-message p {
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }

        .checkmark {
          display: inline-block;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: white;
          margin-bottom: 1rem;
          animation: checkmark 0.6s ease-out;
        }

        .checkmark::after {
          content: '✓';
          display: block;
          font-size: 2rem;
          color: var(--success);
          text-align: center;
          line-height: 60px;
          animation: checkmark-check 0.6s ease-out 0.3s both;
        }

        @keyframes checkmark {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes checkmark-check {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .error-message {
          background: var(--error);
          color: white;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          text-align: center;
          font-weight: 500;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (max-width: 768px) {
          .header h1 {
            font-size: 2rem;
          }

          .button-group {
            flex-direction: column;
          }

          .register-button {
            width: 100%;
          }

          .form-container {
            padding: 2rem;
          }

          .form-actions {
            position: sticky;
            bottom: 0;
            background: white;
            padding: 1rem 0;
            margin: -2rem -2rem 0;
            border-top: 1px solid #e0e0e0;
          }

          .form-actions .btn {
            min-height: 48px;
            font-size: 1.2rem;
          }
        }
      `}</style>

      <div className="background-pattern"></div>
      <div className="container">
        <div className="header">
          <h1>TechConf 2025</h1>
          <p>Register for the Future of Technology</p>
        </div>

        {view === 'landing' && (
          <div className="landing-view">
            <div className="button-group">
              <button
                className="register-button student"
                onClick={() => setView('student')}
              >
                Register as Student
              </button>
              <button
                className="register-button professional"
                onClick={() => setView('professional')}
              >
                Register as Professional
              </button>
            </div>
          </div>
        )}

        {(view === 'student' || view === 'professional') && (
          <div className="form-container">
            <div className="form-header">
              <h2>Registration Form</h2>
              <span className={`badge ${view}`}>
                {view === 'student' ? 'Student' : 'Professional'}
              </span>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={fieldErrors.name ? 'error' : ''}
                  required
                  placeholder="Enter your full name"
                />
                {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
              </div>

              <div className="form-group">
                <label>
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleEmailBlur}
                  className={fieldErrors.email ? 'error' : ''}
                  required
                  placeholder="your.email@example.com"
                />
                {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                {emailChecking && <span className="field-error">Checking availability...</span>}
              </div>

              {view === 'professional' && (
                <div className="form-group">
                  <label>
                    Company <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className={fieldErrors.company ? 'error' : ''}
                    required
                    placeholder="Your company name"
                  />
                  {fieldErrors.company && <span className="field-error">{fieldErrors.company}</span>}
                </div>
              )}

              <div className="form-group">
                <label>
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="12345 67890"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        )}

        {view === 'success' && submittedData && (
          <div className="success-message">
            <div className="checkmark"></div>
            <h2>Success!</h2>
            <p>You've been registered as a {submittedData.type === 'student' ? 'Student' : 'Professional'}.</p>
            <button
              className="btn btn-primary"
              onClick={handleRegisterAnother}
              style={{ maxWidth: '300px', margin: '0 auto' }}
            >
              Register Another
            </button>
          </div>
        )}
      </div>
    </>
  );
}
