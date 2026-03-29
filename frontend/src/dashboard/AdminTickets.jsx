import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const loadTickets = async () => {
    const response = await fetch('/api/maintenance/tickets/', { headers: authHeaders() });
    const data = response.ok ? await response.json() : [];
    setTickets(data.results || data);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const setStatus = async (id, status) => {
    const response = await fetch(`/api/maintenance/tickets/${id}/set_status/`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const err = await response.json();
      alert(err.detail || 'Failed to update ticket status');
      return;
    }
    loadTickets();
  };

  return (
    <DashboardLayout pageTitle="Maintenance Tickets">
      <div className="card overflow-x-auto">
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
                  <select className="px-2 py-1 border rounded" defaultValue={ticket.status} onChange={(e) => setStatus(ticket.id, e.target.value)}>
                    <option value="open">open</option>
                    <option value="acknowledged">acknowledged</option>
                    <option value="in_progress">in_progress</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};
