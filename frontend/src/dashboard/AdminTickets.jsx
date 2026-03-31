import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const loadTickets = async () => {
    try {
      setError('');
      const response = await fetch('/api/maintenance/tickets/', { headers: authHeaders() });
      if (!response.ok) throw new Error('Unable to load maintenance tickets.');
      const data = await response.json();
      setTickets(data.results || data);
    } catch (e) {
      setError(e.message || 'Could not fetch tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  const setStatus = async (id, status) => {
    const response = await fetch(`/api/maintenance/tickets/${id}/set_status/`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const err = await response.json();
      setError(err.detail || 'Failed to update ticket status.');
      return;
    }
    await loadTickets();
  };

  return (
    <DashboardLayout pageTitle="Maintenance Tickets">
      <div className="card overflow-x-auto">
        {loading && <p className="py-4 text-gray-500">Loading tickets...</p>}
        {!loading && error && <div className="mb-3 p-3 border border-red-200 bg-red-50 text-red-700 rounded">{error}</div>}
        {!loading && !error && (
          <table className="table w-full">
            <thead><tr><th>Ticket</th><th>Outlet</th><th>Priority</th><th>Status</th><th>Update</th></tr></thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.ticket_number}</td>
                  <td>{ticket.outlet_name || 'N/A'}</td>
                  <td>{ticket.priority}</td>
                  <td>{ticket.status}</td>
                  <td>
                    <select className="px-2 py-1 border rounded" value={ticket.status} onChange={(e) => setStatus(ticket.id, e.target.value)}>
                      <option value="open">Open</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
              {!tickets.length && <tr><td colSpan="5" className="text-center py-6 text-gray-500">No maintenance tickets available.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};
