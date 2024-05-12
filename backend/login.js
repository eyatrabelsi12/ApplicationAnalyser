require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');
const generateRandomPassword = require('./utils');
const nodemailer = require('nodemailer');
 
 
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
 
const app = express();
const PORT = process.env.PORT || 3003;
 
app.use(express.json());
app.use(cors());
 
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
 
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}
 
 
 
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
 
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
 
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET password = $2 RETURNING id, email',
            [email, hashedPassword]
        );
 
        console.log('User registered:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ message: err.message });
    }
});
 
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
 
    if (!email || !password) {
        return res.status(400).json({ message: 'email and password are required.' });
    }
 
    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (rows.length > 0) {
            const user = rows[0];
            if (await bcrypt.compare(password, user.password)) {
                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '2h' });
                res.json({ token });
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
 
app.post('/reset-password-request', async (req, res) => {
    const { email } = req.body;
 
    try {
        const newPassword = generateRandomPassword(); // Générer un nouveau mot de passe aléatoire
        const hashedPassword = await bcrypt.hash(newPassword, 10);
       
        await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
 
        // Envoyer l'email contenant le nouveau mot de passe à l'utilisateur
        sendPasswordResetEmail(email, newPassword);
 
        res.status(200).json({ message: 'Demande de réinitialisation de mot de passe envoyée avec succès.' });
    } catch (err) {
        console.error('Erreur lors de la demande de réinitialisation de mot de passe:', err);
        res.status(500).json({ message: 'Une erreur s\'est produite lors de la demande de réinitialisation de mot de passe. Veuillez réessayer plus tard.' });
    }
});
 
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
 
function sendPasswordResetEmail(email, newPassword) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Réinitialisation de mot de passe',
        text: `Votre nouveau mot de passe est : ${newPassword}. Veuillez le changer dès que possible après la connexion.`
    };
 
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
        } else {
            console.log('Email envoyé à:', email);
            console.log('Email envoyé:', info.response);
        }
    });
}
 
 
 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});