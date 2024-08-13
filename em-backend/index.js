const express = require('express');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors()); 
app.use(express.json());

const SECRET_KEY = "your_secret_key"; // Replace with a secure key

// Dummy user data
const dummyUser = {
    username: "prajwal",
    password: "123" // In production, never store passwords in plain text
};

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

const PORT = 5000;

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === dummyUser.username && password === dummyUser.password) {
        // Generate a token
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Protected route (example)
app.get('/protected', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ message: 'Protected data', user: decoded });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});


// Existing endpoint for bulk validation
app.post('/validate-emails', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const validatedData = await Promise.all(jsonData.map(async (row) => {
            const { EmailID } = row;

            if (!EmailID) {
                return { ...row, ValidationStatus: 'No Email ID Provided' };
            }

            const apiUrl = `https://trial.serviceobjects.com/ev3/web.svc/json/ValidateEmailAddress?EmailAddress=${encodeURIComponent(EmailID)}&AllowCorrections=true&Timeout=5000&LicenseKey=WS73-ZGM1-JYF3`;

            try {
                const response = await axios.get(apiUrl);
                const { ValidateEmailInfo } = response.data;
                return {
                    ...row,
                    ValidationStatus: ValidateEmailInfo.IsDeliverable === "true" ? 'Deliverable' : 'Not Deliverable',
                    Score: ValidateEmailInfo.Score
                };
            } catch (error) {
                return { ...row, ValidationStatus: 'Validation Failed' };
            }
        }));
 
        res.json({ validatedData });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process file' });
    }
});

// New endpoint for single email validation
app.post('/validate-email-single', async (req, res) => {
    const { email } = req.body;

    console.log('Received email:', email); // Log the received email

    if (!email) {
        return res.status(400).json({ error: 'No email provided' });
    }

    const apiUrl = `https://trial.serviceobjects.com/ev3/web.svc/json/ValidateEmailAddress?EmailAddress=${encodeURIComponent(email)}&AllowCorrections=true&Timeout=5000&LicenseKey=WS73-ZGM1-JYF3`;

    try {
        const response = await axios.get(apiUrl);
        const { ValidateEmailInfo } = response.data;

        if (ValidateEmailInfo) {
            return res.json({ ValidateEmailInfo });
        } else {
            console.error('Unexpected response:', response.data); // Log unexpected response
            return res.status(500).json({ error: 'Unexpected response from server' });
        }
    } catch (error) {
        console.error('API call failed:', error.message); // Log API errors
        return res.status(500).json({ error: 'Failed to validate email' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
