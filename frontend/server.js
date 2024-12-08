const express = require('express');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');


const app = express();
const PORT = process.env.PORT || 3000;
const FLASK_SERVER_URL = process.env.FLASK_SERVER_URL || 'http://localhost:5000';
//const FLASK_SERVER_URL = 'http://localhost:5000'

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '.')));

// Multer configuration
const upload = multer({ dest: 'uploads/' });

// Helper function for Flask server requests
async function flaskServerRequest(endpoint, method, data) {
    try {
        const response = await axios({
            method,
            url: `${FLASK_SERVER_URL}${endpoint}`,
            data,
            headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        console.error(`Error in Flask server request to ${endpoint}:`, error.message);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            return error.response.data;
        } else {
            // Something happened in setting up the request that triggered an Error
            throw error;
        }
    }
}

// Helper function to send alert and redirect
function sendAlertAndRedirect(res, message, redirectUrl) {
    res.send(`
        <script>
            alert("${message}");
            window.location.href = "${redirectUrl}";
        </script>
    `);
}

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '.', 'index.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, '.', 'register.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '.', 'dashboard.html')));

const FormData = require('form-data');

app.post('/upload-document', upload.single('file'), async (req, res) => {
    console.log('Received upload request');
    console.log('File:', req.file);

    if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path), {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });
        formData.append('email', req.body.email);

        const response = await axios.post(`${FLASK_SERVER_URL}/upload-document`, formData, {
            headers: {
                ...formData.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Failed to upload document to Flask server', error: error.message });
    } finally {
        // Clean up the uploaded file
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting uploaded file:', err);
        });
    }
});

app.post('/login', async (req, res) => {
    try {
        console.log('Login attempt for:', req.body.email);
        const response = await flaskServerRequest('/login', 'POST', req.body);
        console.log('Flask response:', response);

        if (response && response.message === 'Login successful') {

            // Store the email in localStorage
            // localStorage.setItem('userEmail', email);
            // window.location.href = '/dashboard';
            console.log('Login successful, redirecting to dashboard')
            res.redirect(`/dashboard?email=${encodeURIComponent(req.body.email)}`);
        } else {
            console.log('Login failed, showing alert');
            sendAlertAndRedirect(res, 'Invalid email or password. Please try again.', '/');
        }
    } catch (error) {
        console.error('Login error:', error);
        sendAlertAndRedirect(res, 'Login failed. Please try again later.', '/');
    }
});

app.post('/signup', async (req, res) => {
    try {
        const response = await flaskServerRequest('/register', 'POST', req.body);
        if (response && response.message === 'Successfully registered') {
            sendAlertAndRedirect(res, 'Registration successful! Please log in.', '/');
        } else {
            sendAlertAndRedirect(res, 'Registration failed. Please try again.', '/register');
        }
    } catch (error) {
        sendAlertAndRedirect(res, 'Registration failed. Please try again.', '/register');
    }
});

app.post('/list-documents', async (req, res) => {
    try {
        const response = await flaskServerRequest('/list-documents', 'POST', { email: req.body.email });
        res.json(response);
    } catch (error) {
        console.error('Error listing documents:', error);
        res.status(500).json({ message: 'Failed to list documents', error: error.message });
    }
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));