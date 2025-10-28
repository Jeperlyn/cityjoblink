// Directory: C:\cityjoblink\frontend\src\components\JobCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function JobCard({ job }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-1">{job.title}</h3>
        <p className="text-gray-600 mb-3">{job.company}</p>
        <p className="text-sm text-gray-500 mb-4">{job.location}</p>
        
        <div className="flex gap-2 mb-4">
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            {job.type}
          </span>
          <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            {job.salary}
          </span>
        </div>
        
        <Link 
          to={`/jobs/${job.id}`} 
          className="font-semibold text-blue-600 hover:underline"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default JobCard;