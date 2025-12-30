'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Admin() {
  const [stats, setStats] = useState({ total: 0, students: 0, professionals: 0 });
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch statistics
      const { count: total, error: totalError } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      const { count: students, error: studentsError } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('registration_type', 'student');

      if (studentsError) throw studentsError;

      const { count: professionals, error: professionalsError } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('registration_type', 'professional');

      if (professionalsError) throw professionalsError;

      setStats({
        total: total || 0,
        students: students || 0,
        professionals: professionals || 0
      });

      // Fetch registrations
      const [sortField, sortOrder] = sortBy.split('-');
      let query = supabase
        .from('registrations')
        .select('*')
        .order(sortField === 'date' ? 'created_at' : 'name', { ascending: sortOrder === 'asc' });

      if (filter !== 'all') {
        query = query.eq('registration_type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setRegistrations(data || []);
    } catch (err: any) {
      setError('Failed to fetch data from Supabase.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter, sortBy]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --primary: #6366F1;
          --secondary: #8B5CF6;
          --success: #10B981;
          --warning: #F59E0B;
          --danger: #EF4444;
          --dark: #1F2937;
          --light: #F9FAFB;
          --border: #E5E7EB;
          --text: #374151;
          --text-light: #6B7280;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', sans-serif;
          background: var(--light);
          color: var(--text);
          line-height: 1.6;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .header {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          padding: 2rem;
          border-radius: 16px;
          margin-bottom: 2rem;
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2);
        }

        .header h1 {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .header p {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid var(--border);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .stat-card .label {
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-light);
          margin-bottom: 0.5rem;
        }

        .stat-card .value {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 3rem;
          font-weight: 700;
          line-height: 1;
        }

        .stat-card.total .value { color: var(--primary); }
        .stat-card.students .value { color: var(--success); }
        .stat-card.professionals .value { color: var(--warning); }

        .table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid var(--border);
          overflow: hidden;
        }

        .table-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .table-header h2 {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 1.5rem;
          color: var(--dark);
        }

        .controls {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          gap: 0.5rem;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          border: 2px solid var(--border);
          background: white;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'IBM Plex Mono', monospace;
        }

        .filter-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .filter-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .sort-select {
          padding: 0.5rem 1rem;
          border: 2px solid var(--border);
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          background: white;
          font-family: 'Inter', sans-serif;
        }

        .sort-select:focus {
          outline: none;
          border-color: var(--primary);
        }

        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: var(--light);
        }

        th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-light);
          border-bottom: 2px solid var(--border);
        }

        td {
          padding: 1rem;
          border-bottom: 1px solid var(--border);
        }

        tbody tr {
          transition: background 0.2s ease;
        }

        tbody tr:hover {
          background: var(--light);
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .badge.student {
          background: #DEF7EC;
          color: #03543F;
        }

        .badge.professional {
          background: #FEF3C7;
          color: #92400E;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: var(--text-light);
        }

        .loading-spinner {
          display: inline-block;
          width: 40px;
          height: 40px;
          border: 4px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error {
          background: #FEE2E2;
          color: #991B1B;
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem;
          border: 1px solid #FECACA;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-light);
        }

        .empty-state svg {
          width: 80px;
          height: 80px;
          margin-bottom: 1rem;
          opacity: 0.3;
        }

        .refresh-btn {
          padding: 0.5rem 1rem;
          border: 2px solid var(--primary);
          background: white;
          color: var(--primary);
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'IBM Plex Mono', monospace;
        }

        .refresh-btn:hover {
          background: var(--primary);
          color: white;
        }

        @media (max-width: 768px) {
          .header h1 {
            font-size: 1.75rem;
          }

          .table-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .controls {
            width: 100%;
            flex-direction: column;
          }

          .filter-group {
            width: 100%;
          }

          .filter-btn {
            flex: 1;
          }

          .sort-select {
            width: 100%;
          }
        }
      `}</style>

      <div className="container">
        <div className="header">
          <h1>Admin Dashboard</h1>
          <p>Conference Registration Management System</p>
        </div>

        {error && (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card total">
            <div className="label">Total Registrations</div>
            <div className="value">{stats.total}</div>
          </div>
          <div className="stat-card students">
            <div className="label">Students</div>
            <div className="value">{stats.students}</div>
          </div>
          <div className="stat-card professionals">
            <div className="label">Professionals</div>
            <div className="value">{stats.professionals}</div>
          </div>
        </div>

        <div className="table-container">
          <div className="table-header">
            <h2>All Registrations</h2>
            <div className="controls">
              <div className="filter-group">
                <button
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${filter === 'student' ? 'active' : ''}`}
                  onClick={() => setFilter('student')}
                >
                  Students
                </button>
                <button
                  className={`filter-btn ${filter === 'professional' ? 'active' : ''}`}
                  onClick={() => setFilter('professional')}
                >
                  Professionals
                </button>
              </div>
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date-desc">Date (Newest First)</option>
                <option value="date-asc">Date (Oldest First)</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
              <button className="refresh-btn" onClick={fetchData}>
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Loading data...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="empty-state">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3>No Registrations Found</h3>
              <p>There are no registrations matching your filters.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>Company</th>
                    <th>Phone</th>
                    <th>Registration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg: any) => (
                    <tr key={reg.id}>
                      <td><strong>{reg.name}</strong></td>
                      <td>{reg.email}</td>
                      <td>
                        <span className={`badge ${reg.registration_type}`}>
                          {reg.registration_type}
                        </span>
                      </td>
                      <td>{reg.company || '-'}</td>
                      <td>{reg.phone || '-'}</td>
                      <td>{formatDate(reg.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}