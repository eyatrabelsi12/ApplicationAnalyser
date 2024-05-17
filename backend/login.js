require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');
const nodemailer = require('nodemailer');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use(cors());


// Configuration du transporteur de messagerie
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Par exemple, 'smtp.example.com'
  port: 465, // Par exemple, 587 pour TLS ou 465 pour SSL
  secure: true, // true pour le port 465, false pour le port 587
  auth: {
    user: 'islemkorbi02@gmail.com', // Votre adresse e-mail
    pass: 'wecw lfyg iiym oksd' // Votre mot de passe e-mail
  }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
  
    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (rows.length > 0) {
        const user = rows[0];
        if (await bcrypt.compare(password, user.password)) {
          // Vérifiez et attribuez le rôle si nécessaire
          if (email === 'Nesrinedhaouadi@gmail.com' && user.role !== 'admin') {
            user.role = 'admin';
            await pool.query('UPDATE users SET role = $1 WHERE email = $2', [user.role, email]);
          }
  
          const payload = { id: user.id, username: user.username, role: user.role }; // Ajout du rôle au payload
          const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });
          res.json({ token, role: user.role }); // Retournez également le rôle de l'utilisateur
        } else {
          res.status(400).json({ message: 'Invalid credentials' });
        }
      } else {
        res.status(400).json({ message: 'User does not exist' });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  app.post('/register', async (req, res) => {
    const { email, password, username } = req.body;
  
    // Vérification de la présence des champs email, password et username
    if (!email || !password || !username) {
      return res.status(400).json({ message: 'Email, password, and username are required.' });
    }
  
    try {
      // Définir le rôle en fonction de l'email
      let role = 'user';
      if (email === 'Nesrinedhaouadi@gmail.com') {
        role = 'admin';
      }
  
      // Hashage du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Insertion de l'utilisateur dans la table users
      const result = await pool.query(
        'INSERT INTO users (email, password, username, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET password = $2, username = $3, role = $4 RETURNING id, email, role',
        [email, hashedPassword, username, role]
      );
  
      console.log('User registered:', result.rows[0]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error during registration:', err);
      res.status(500).json({ message: err.message });
    }
  });

  




  app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
 
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
 
        if (user) {
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '2h' });
            const resetLink = `http://localhost:3000/reset-password/${token}`;
 
            await pool.query('UPDATE users SET reset_token = $1, reset_token_expiration = $2 WHERE email = $3',
                [token, new Date(Date.now() + 3600000), email]);
 
            // Options de l'e-mail à envoyer
            const mailOptions = {
                from: process.env.EMAIL_USER, // Votre adresse e-mail
                to: email, // Adresse e-mail du destinataire
                subject: 'Password Reset',
                text: `Click the link to reset your password: ${resetLink}`
            };
 
            // Envoi de l'e-mail
            await transporter.sendMail(mailOptions);
 
            res.json({ message: 'Password reset email sent' });
        } else {
            res.status(400).json({ error: 'Email not found' });
        }
        console.log("Received email:", email);
 
    } catch (err) {
        console.error("Error during password reset process:", err);
        res.status(400).json({ error: err.message });
    }
});
 
app.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { email, password } = req.body;
 
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
 
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
       
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1 AND email = $2', [decoded.id, email]);
        const user = userResult.rows[0];
 
        if (!user) {
            return res.status(400).json({ error: 'Invalid token or email' });
        }
 
        const hashedPassword = await bcrypt.hash(password, 10);
 
        await pool.query(
            'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiration = NULL WHERE id = $2',
            [hashedPassword, decoded.id]
        );
 
        res.json({ message: 'Password has been reset' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
 

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});