// Directory: C:\cityjoblink\frontend\src\pages\SignUpPage.jsx
import React, { useState } from 'react'; 

function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault(); 
    if (password !== passwordConfirm) {
      alert("Passwords don't match!");
      return; 
    }
    console.log('--- SIGN UP FORM DATA ---');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('-------------------------');
    alert('Sign up successful! Check the console (F12) to see your data.');
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center pt-20">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Juan dela Cruz"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="you@example.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.gantarget.value)} 
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password-confirm">
              Confirm Password
            </label>
            <input
              type="password"
              id="password-confirm"
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="••••••••"
              value={passwordConfirm} 
              onChange={(e) => setPasswordConfirm(e.target.value)} 
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignUpPage;