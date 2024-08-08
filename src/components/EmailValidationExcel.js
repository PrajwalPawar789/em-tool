import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function EmailValidationExcel() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!file) {
            setError('Please upload a file first.');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Send the file to the backend
            const response = await axios.post('http://localhost:5000/validate-emails', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const { validatedData } = response.data;

            // Create a new workbook and add the validated data
            const newWorkbook = XLSX.utils.book_new();
            const newWorksheet = XLSX.utils.json_to_sheet(validatedData);
            XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Validated Emails');

            // Write the file and trigger download
            XLSX.writeFile(newWorkbook, 'validated_emails.xlsx');
            setLoading(false);
        } catch (err) {
            setError('Failed to process file');
            setLoading(false);
        }
    };

    return (
        <div className="flex items-start justify-center min-h-screen bg-gray-100">
            <div className="mt-4 bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-semibold mb-4 text-gray-800">Email Validation with Excel</h1>
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                />
                <button
                    onClick={handleFileUpload}
                    className={`w-full px-4 py-2 text-white rounded-lg ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600'} transition-colors duration-300 ease-in-out`}
                    disabled={loading}
                >
                    {loading ? (
                        <svg className="animate-spin h-5 w-5 mx-auto text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="none" stroke="currentColor" strokeWidth="4" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                    ) : (
                        'Upload and Validate'
                    )}
                </button>
                {error && (
                    <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
                        <h2 className="text-lg font-semibold">Error</h2>
                        <p>{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EmailValidationExcel;
