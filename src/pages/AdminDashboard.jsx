// src/pages/AdminDashboard.jsx
import React from 'react';
import { File } from 'lucide-react';

const AdminDashboard = ({ employers, onVerifyEmployer }) => (
  <div className="max-w-6xl mx-auto p-6">
    <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">PESO Admin Portal</h1>
    <div className="bg-white rounded-lg shadow border overflow-hidden">
       <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 border-b text-gray-600 uppercase text-xs"><tr><th className="px-6 py-3">Company</th><th className="px-6 py-3">Documents</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Action</th></tr></thead>
          <tbody>{employers.map(e => (<tr key={e.id} className="border-b"><td className="px-6 py-4 font-bold">{e.companyName}</td><td className="px-6 py-4">{e.uploadedDocs ? <button onClick={()=>alert("Opening PDF Viewer...")} className="text-blue-600 flex gap-1 items-center font-bold hover:underline bg-blue-50 px-2 py-1 rounded"><File size={14}/> View Docs</button> : "None"}</td><td className="px-6 py-4">{e.isVerified ? <span className="text-green-600 font-bold">Verified</span> : <span className="text-orange-500 font-bold">Pending</span>}</td><td className="px-6 py-4">{e.uploadedDocs && !e.isVerified && <div className="flex gap-2"><button onClick={()=>onVerifyEmployer(e.id, true)} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">Approve</button><button onClick={()=>onVerifyEmployer(e.id, false)} className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold">Reject</button></div>}</td></tr>))}</tbody>
       </table>
    </div>
  </div>
);

export default AdminDashboard;