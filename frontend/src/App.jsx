// Directory: C:\cityjoblink\frontend\src\App.jsx
import { Routes, Route } from 'react-router-dom';

// --- IMPORT YOUR PAGES ---
import HomePage from './pages/HomePage'; // The file we just created
import JobsPage from './pages/JobsPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

function App() {
  return (
    <Routes>
      {/* This route loads your new HomePage.jsx */}
      <Route path="/" element={<HomePage />} />

      {/* These are the routes for your other pages */}
      {/* We will need to add the <Header> to them later */}
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
    </Routes>
  );
}

export default App;