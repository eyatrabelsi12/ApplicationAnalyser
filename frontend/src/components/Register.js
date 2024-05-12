import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (password.length < 8 || password.length > 15) {
      alert('Password must be between 8 and 15 characters.');
      return;
    }

    if (!/^[a-zA-Z0-9@#$%^&+=]{8,15}$/.test(password)) {
      alert('Password must contain only letters, numbers, and symbols.');
      return;
    }

    if (!email.includes('@gmail.com')) {
      alert('Email must contain "@gmail.com".');
      return;
    }

    const url = 'http://localhost:3006/register';
    const data = { email, password, confirmPassword };

    try {
      const response = await axios.post(url, data);
      console.log(response.data);
      alert('Success! Registered successfully.');
      navigate('/login');
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Error: Unable to register. Please try again.');
    }
  };

  return (
    <div class="container mt-3" >
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
      <div class="mb-3 mt-3">
        <label>
          Adresse Email:
          <input type="text"  class="form-control"   placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
</div>
       
        
<div class="mb-3">
        <label>
          Password:
          <input type="password"  class="form-control"  placeholder="Enter password"value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        </div>
        <div class="mb-3">
        <label>
          Confirm Password:
          <input type="password"  class="form-control"  placeholder="confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </label>
        </div>
        <button type="submit" class="btn btn-primary">Register</button>
      </form>
    </div>
    </div>
  );
};

export default Register;
