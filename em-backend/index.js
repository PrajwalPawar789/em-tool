const express = require('express');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'prajwal.pawar',
    host: '192.168.1.39',
    database: 'LeadDB',
    password: 'PPIndia@098',
    port: 5432,
});

const app = express();
app.use(cors()); 
app.use(express.json());

const SECRET_KEY = "your_secret_key"; // Replace with a secure key

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

const PORT = 5001;

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            if (user.password === password) {
                const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
                res.json({ token }); // Send token
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Protected route (example)
app.get('/protected', (req, res) => {
    // This route is no longer using token authentication
    res.json({ message: 'Protected data' });
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

            const apiUrl = `https://sws.serviceobjects.com/EV3/web.svc/JSON/ValidateEmailAddress?EmailAddress=${encodeURIComponent(EmailID)}&AllowCorrections=true&Timeout=200&LicenseKey=WS73-RYC3-ZFV2`;

            try {
                const response = await axios.get(apiUrl);
                const { ValidateEmailInfo } = response.data;
                return {
                    ...row,
                    ValidationStatus: ValidateEmailInfo.IsDeliverable ? 'Deliverable' : 'Not Deliverable',
                    Score: ValidateEmailInfo.Score,
                    EmailAddressIn:ValidateEmailInfo.EmailAddressIn,
                    EmailAddressOut:ValidateEmailInfo.EmailAddressOut,
                    EmailCorrected:ValidateEmailInfo.EmailCorrected,
                    Box:ValidateEmailInfo.Box,
                    Domain:ValidateEmailInfo.Domain,
                    TopLevelDomain:ValidateEmailInfo.TopLevelDomain,
                    TopLevelDomainDescription:ValidateEmailInfo.TopLevelDomainDescription,
                    IsSMTPServerGood:ValidateEmailInfo.IsSMTPServerGood,
                    IsCatchAllDomain:ValidateEmailInfo.IsCatchAllDomain,
                    IsSMTPMailBoxGood:ValidateEmailInfo.IsSMTPMailBoxGood,
                    WarningCodes:ValidateEmailInfo.WarningCodes,
                    WarningDescriptions:ValidateEmailInfo.WarningDescriptions,
                    NotesCodes:ValidateEmailInfo.NotesCodes,
                    NotesDescriptions:ValidateEmailInfo.NotesDescriptions,
                    MXRecord:ValidateEmailInfo.MXRecord

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
app.get('/validate-email-single', async (req, res) => {
    const { email } = req.query;

    console.log('Received email:', email); // Log the received email

    if (!email) {
        return res.status(400).json({ error: 'No email provided' });
    }

    const apiUrl = `http://155.130.19.10/ev3/web.svc/json/ValidateEmailAddress`;
    const params = {
        EmailAddress: email,
        AllowCorrections: true,
        Timeout: 200,
        LicenseKey: 'WS73-RYC3-ZFV2'
    };

    try {
        const response = await axios.get(apiUrl, { params });
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
