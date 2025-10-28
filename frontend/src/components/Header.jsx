// Directory: C:\cityjoblink\frontend\src\components\Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    // This 'text-white' class is the fix
    <nav className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-6 bg-black text-white">
      
      {/* Left Side: Title */}
      <h1 className="text-3xl font-bold">
        <Link to="/">CityJobLink</Link>
      </h1>

      {/* Middle: Links */}
      <div className="flex gap-8 items-center text-lg">
        <Link to="/" className="font-semibold hover:underline">Home</Link>
        <Link to="/jobs" className="hover:underline">Jobs</Link>
        <Link to="/job-fairs" className="hover:underline">Job Fairs</Link>
        <Link to="/trainings" className="hover:underline">Trainings</Link>
      </div>

      {/* Right Side: Buttons */}
      <div className="flex gap-4">
        <Link 
          to="/signup" 
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700"
        >
          SIGN UP
        </Link>
        <Link 
          to="/login" 
          className="bg-gray-700 bg-opacity-50 text-white px-5 py-2 rounded-lg font-semibold hover:bg-gray-600"
        >
          LOGIN
        </Link>
      </div>
    </nav>
  );
}

export default Header;