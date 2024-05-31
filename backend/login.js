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

            // Vérifier si l'utilisateur est verrouillé
            if (user.lock_until && user.lock_until > new Date()) {
                const lockDuration = (new Date(user.lock_until) - new Date()) / 1000; // Convertir en secondes
                return res.status(403).json({ message: `Your account is locked. Try again in ${Math.ceil(lockDuration)} seconds.` });
            }

            if (await bcrypt.compare(password, user.password)) {
                // Réinitialiser les tentatives échouées après une connexion réussie
                await pool.query('UPDATE users SET failed_attempts = 0, lock_until = NULL WHERE email = $1', [email]);

                // Vérifiez et attribuez le rôle si nécessaire
                if (email === 'Nesrinedhaouadi@gmail.com' && user.role !== 'admin') {
                    user.role = 'admin';
                    await pool.query('UPDATE users SET role = $1 WHERE email = $2', [user.role, email]);
                }

                const payload = { id: user.id, username: user.username, role: user.role, is_verified: user.is_verified }; // Ajout du rôle et is_verified au payload
                const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });
                return res.json({ token, role: user.role, is_verified: user.is_verified }); // Retournez également le rôle de l'utilisateur et is_verified
            } else {
                // Incrémenter les tentatives échouées
                let failedAttempts = user.failed_attempts + 1;
                let lockUntil = null;
                let lockMessage = 'Invalid credentials';

                if (failedAttempts === 4) {
                    lockUntil = new Date(Date.now() + 15000); // 15 secondes
                    lockMessage = 'Your account is locked for 15 seconds due to multiple failed login attempts.';
                } else if (failedAttempts === 8) {
                    lockUntil = new Date(Date.now() + 7200000); // 2 heures
                    lockMessage = 'Your account is locked for 2 hours due to multiple failed login attempts.';
                }

                await pool.query('UPDATE users SET failed_attempts = $1, lock_until = $2 WHERE email = $3', [failedAttempts, lockUntil, email]);
                return res.status(400).json({ message: lockMessage });
            }
        } else {
            return res.status(400).json({ message: 'User does not exist' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

 
 
 
app.post('/register', async (req, res) => {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        return res.status(400).json({ message: 'Email, password, and username are required.' });
    }

    try {
        const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ message: 'This email is already registered.' });
        }

        let role = 'user';
        if (email === 'eyatrabelsi868@gmail.com' || email === 'manelbacha.master@gmail.com') {
            role = 'admin';
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (email, password, username, role, is_verified) VALUES ($1, $2, $3, $4, false) RETURNING id, email, role',
            [email, hashedPassword, username, role]
        );

        // Generate verification token
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send verification email
        const verificationUrl = `http://localhost:3003/verify-email?token=${token}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your Email',
            html: `
            <p>Welcome to the analyzer application!</p>
            <p>Please verify your email by clicking the following link:</p>
            <a href="${verificationUrl}">${verificationUrl}</a>`
        });

        console.log('User registered:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ message: err.message });
    }
});


  app.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).send('Token is required');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { email } = decoded;

        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (rows.length === 0 || rows[0].is_verified) {
            return res.status(400).send('Email is already verified or user not found');
        }

        await pool.query('UPDATE users SET is_verified = true WHERE email = $1', [email]);
        
        // Redirect to the login page after verification
        res.redirect('http://localhost:3000/login?verified=true');
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});




 
 
app.post('/send-verification-email', async (req, res) => {
    const { email } = req.body;
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const verificationLink = `http://localhost:3000/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification',
        html: `
        <p>Hello,</p>
        <p>Please verify your email by clicking on the following link:</p>
        <a href="${verificationLink}">${verificationLink}</a>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send('Verification email sent');
    } catch (error) {
        console.error('Error sending verification email:', error);
        res.status(500).send('Error sending email');
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
                text: `Hello, Click the link to reset your password: ${resetLink}`
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
    const { password } = req.body;
 
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashedPassword = await bcrypt.hash(password, 10);
 
        const result = await pool.query(
            'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiration = NULL WHERE id = $2 RETURNING *',
            [hashedPassword, decoded.id]
        );
 
        res.json({ message: 'Password has been reset' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// Middleware pour vérifier l'authentification
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.sendStatus(401);
 
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};
 
// Route pour changer le rôle d'un utilisateur
app.post('/change-role', authenticateToken, async (req, res) => {
    const { email, newRole } = req.body;
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
 
    try {
        const result = await pool.query(
            'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, username, email, role',
            [newRole, email]
        );
 
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
 
 
        // Options de l'email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Role Change within QA Automation Team',
            html: `
        <p>Hello Dear,</p>
        <p>We are pleased to inform you that your role within our QA Automation team has been successfully changed. You are now holding the position of ${newRole}.</p>
        <p>We are confident that your expertise and dedication will make a significant contribution to our QA Automation team.</p>
        <p>Please feel free to contact us if you have any questions or concerns regarding this change.</p>
        <p>Best regards,</p>
        <br>
        <p>Neoxam</p>
       
    `,
        };
 
        // Envoyer l'email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: 'Error sending email', error });
            } else {
                res.json(result.rows[0]);
            }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
 
 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 