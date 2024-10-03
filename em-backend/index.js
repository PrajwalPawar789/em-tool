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
            const { EmailID: email_address } = row;

            if (!email_address) {
                return { ...row, ValidationStatus: 'No Email ID Provided' };
            }

            // Check in-house database first
            const dbResult = await pool.query(
                'SELECT * FROM email_validation WHERE email_address = $1', 
                [email_address]
            );

            if (dbResult.rows.length > 0) {
                const dbData = dbResult.rows[0];
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                if (new Date(dbData.created_at) > thirtyDaysAgo) {
                    return {
                        ...row,
                        ValidationStatus: dbData.is_deliverable,
                        Score: dbData.score,
                        EmailCorrected: dbData.email_corrected,
                        Box: dbData.box,
                        Domain: dbData.domain,
                        TopLevelDomain: dbData.top_level_domain,
                        TopLevelDomainDescription: dbData.top_level_domain_description,
                        IsSMTPServerGood: dbData.is_smtp_server_good,
                        IsCatchAllDomain: dbData.is_catch_all_domain,
                        IsSMTPMailBoxGood: dbData.is_smtp_mailbox_good,
                        WarningCodes: dbData.warning_codes,
                        WarningDescriptions: dbData.warning_descriptions,
                        NotesCodes: dbData.notes_codes,
                        NotesDescriptions: dbData.notes_descriptions,
                        MXRecord: dbData.mx_record,
                    };
                }
            }

            // If not in database or outdated, make API call
            const apiUrl = `https://sws.serviceobjects.com/EV3/web.svc/JSON/ValidateEmailAddress?EmailAddress=${encodeURIComponent(email_address)}&AllowCorrections=true&Timeout=2000&LicenseKey=WS73-RYC3-ZFV2`;

            try {
                const response = await axios.get(apiUrl);
                const { ValidateEmailInfo } = response.data;

                if (!ValidateEmailInfo) {
                    throw new Error('Invalid API response structure');
                }

                // Store the result in the database
                await pool.query(
                    `INSERT INTO email_validation (
                        email_address, score, is_deliverable, email_corrected, box, 
                        domain, top_level_domain, top_level_domain_description, 
                        is_smtp_server_good, is_catch_all_domain, is_smtp_mailbox_good, 
                        warning_codes, warning_descriptions, notes_codes, notes_descriptions, 
                        mx_record, created_at
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP
                    )
                    ON CONFLICT (email_address) 
                    DO UPDATE SET 
                        score = EXCLUDED.score, 
                        is_deliverable = EXCLUDED.is_deliverable, 
                        email_corrected = EXCLUDED.email_corrected, 
                        box = EXCLUDED.box, 
                        domain = EXCLUDED.domain, 
                        top_level_domain = EXCLUDED.top_level_domain, 
                        top_level_domain_description = EXCLUDED.top_level_domain_description, 
                        is_smtp_server_good = EXCLUDED.is_smtp_server_good, 
                        is_catch_all_domain = EXCLUDED.is_catch_all_domain, 
                        is_smtp_mailbox_good = EXCLUDED.is_smtp_mailbox_good, 
                        warning_codes = EXCLUDED.warning_codes, 
                        warning_descriptions = EXCLUDED.warning_descriptions, 
                        notes_codes = EXCLUDED.notes_codes, 
                        notes_descriptions = EXCLUDED.notes_descriptions, 
                        mx_record = EXCLUDED.mx_record, 
                        created_at = CURRENT_TIMESTAMP`,
                    [
                        email_address, 
                        ValidateEmailInfo.Score, 
                        ValidateEmailInfo.IsDeliverable, 
                        ValidateEmailInfo.EmailCorrected, 
                        ValidateEmailInfo.Box,
                        ValidateEmailInfo.Domain, 
                        ValidateEmailInfo.TopLevelDomain, 
                        ValidateEmailInfo.TopLevelDomainDescription,
                        ValidateEmailInfo.IsSMTPServerGood, 
                        ValidateEmailInfo.IsCatchAllDomain, 
                        ValidateEmailInfo.IsSMTPMailBoxGood,
                        ValidateEmailInfo.WarningCodes, 
                        ValidateEmailInfo.WarningDescriptions, 
                        ValidateEmailInfo.NotesCodes,
                        ValidateEmailInfo.NotesDescriptions, 
                        ValidateEmailInfo.MXRecord
                    ]
                );

                return {
                    ...row,
                    ValidationStatus: ValidateEmailInfo.IsDeliverable,
                    Score: ValidateEmailInfo.Score,
                    EmailCorrected: ValidateEmailInfo.EmailCorrected,
                    Box: ValidateEmailInfo.Box,
                    Domain: ValidateEmailInfo.Domain,
                    TopLevelDomain: ValidateEmailInfo.TopLevelDomain,
                    TopLevelDomainDescription: ValidateEmailInfo.TopLevelDomainDescription,
                    IsSMTPServerGood: ValidateEmailInfo.IsSMTPServerGood,
                    IsCatchAllDomain: ValidateEmailInfo.IsCatchAllDomain,
                    IsSMTPMailBoxGood: ValidateEmailInfo.IsSMTPMailBoxGood,
                    WarningCodes: ValidateEmailInfo.WarningCodes,
                    WarningDescriptions: ValidateEmailInfo.WarningDescriptions,
                    NotesCodes: ValidateEmailInfo.NotesCodes,
                    NotesDescriptions: ValidateEmailInfo.NotesDescriptions,
                    MXRecord: ValidateEmailInfo.MXRecord,
                };
            } catch (error) {
                console.error(`Failed to validate email: ${email_address}`, error);
                return { ...row, ValidationStatus: 'Validation Failed' };
            }
        }));

        res.json({ validatedData });
    } catch (error) {
        console.error('Failed to process file', error);
        res.status(500).json({ error: 'Failed to process file' });
    }
});


// New endpoint for single email validation
app.get('/validate-email-single', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'No email provided' });
    }

    try {
        // Check if the email is already in the database
        const dbResult = await pool.query('SELECT * FROM email_validation WHERE email_address = $1', [email]);

        if (dbResult.rows.length > 0) {
            // Email found in the database, return the stored result
            return res.json({ ValidateEmailInfo: dbResult.rows[0] });
        } else {
            // Email not found, make API call
            const apiUrl = `http://155.130.19.10/ev3/web.svc/json/ValidateEmailAddress`;
            const params = {
                EmailAddress: email,
                AllowCorrections: true,
                Timeout: 2000,
                LicenseKey: 'WS73-RYC3-ZFV2'
            };

            const response = await axios.get(apiUrl, { params });
            const { ValidateEmailInfo } = response.data;

            if (ValidateEmailInfo) {
                // Store the result in the database
                await pool.query(
                    `INSERT INTO email_validation (
                        email_address, score, is_deliverable, email_corrected, box, domain,
                        top_level_domain, top_level_domain_description, is_smtp_server_good,
                        is_catch_all_domain, is_smtp_mailbox_good, warning_codes, warning_descriptions,
                        notes_codes, notes_descriptions, mx_record
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
                    [
                        ValidateEmailInfo.EmailAddressIn,
                        ValidateEmailInfo.Score,
                        ValidateEmailInfo.IsDeliverable,
                        ValidateEmailInfo.EmailCorrected,
                        ValidateEmailInfo.Box,
                        ValidateEmailInfo.Domain,
                        ValidateEmailInfo.TopLevelDomain,
                        ValidateEmailInfo.TopLevelDomainDescription,
                        ValidateEmailInfo.IsSMTPServerGood,
                        ValidateEmailInfo.IsCatchAllDomain,
                        ValidateEmailInfo.IsSMTPMailBoxGood,
                        ValidateEmailInfo.WarningCodes,
                        ValidateEmailInfo.WarningDescriptions,
                        ValidateEmailInfo.NotesCodes,
                        ValidateEmailInfo.NotesDescriptions,
                        ValidateEmailInfo.MXRecord
                    ]
                );

                // Return the API response
                return res.json({ ValidateEmailInfo });
            } else {
                return res.status(500).json({ error: 'Unexpected response from server' });
            }
        }
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ error: 'Failed to validate email' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
