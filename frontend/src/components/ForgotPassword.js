import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [message, setMessage] = useState('');

  const handleForgotPassword = async () => {
    try {
      await axios.post('http://localhost:3001/forgot-password', { email });
      setMessage('Reset email sent. Check your inbox.');
    } catch (error) {
      console.error(error.response.data.message);
      setMessage('Error sending reset email');
    }
  };

  const handleResetPassword = async () => {
    try {
      await axios.post('http://localhost:3001/reset-password', { token: resetToken, newPassword });
      setMessage('Password reset successful');
    } catch (error) {
      console.error(error.response.data.message);
      setMessage('Error resetting password');
    }
  };

  return (
    <div>
      <h1>Password Reset App</h1>
      <div>
        <h2>Forgot Password</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={handleForgotPassword}>Send Reset Email</button>
      </div>
      <div>
        <h2>Reset Password</h2>
        <input type="text" placeholder="Reset Token" value={resetToken} onChange={(e) => setResetToken(e.target.value)} />
        <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <button onClick={handleResetPassword}>Reset Password</button>
      </div>
      <p>{message}</p>
    </div>
  );
}

export default App;
