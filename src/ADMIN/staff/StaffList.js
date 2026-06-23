import React from 'react';
import { Users } from 'lucide-react';

const StaffList = () => (
  <div className="admin-screen p-6">
    <h1 className="text-2xl font-bold text-slate-800 mb-4 flex items-center"><Users className="mr-2" size={24} /> Staff Management</h1>
    <p className="text-slate-600 mb-6">View, edit, and remove staff members.</p>
    <div className="glass-card p-4 rounded-xl shadow-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Role</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {[{id: 'ST-001', name: 'Anita Sharma', role: 'Manager', status: 'Active'},
            {id: 'ST-002', name: 'Rohit Patel', role: 'Sales', status: 'Inactive'}].map(staff => (
            <tr key={staff.id} className="hover:bg-slate-50/60 transition-colors">
              <td className="px-4 py-2">{staff.id}</td>
              <td className="px-4 py-2">{staff.name}</td>
              <td className="px-4 py-2">{staff.role}</td>
              <td className="px-4 py-2">
                <span className={`status-badge ${staff.status === 'Active' ? 'active' : 'inactive'}`}>{staff.status}</span>
              </td>
              <td className="px-4 py-2 text-right">
                <button className="text-emerald-600 hover:underline mr-2">Edit</button>
                <button className="text-rose-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default StaffList;
