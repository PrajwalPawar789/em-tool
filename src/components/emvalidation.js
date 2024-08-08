import React, { useState } from 'react';
import axios from 'axios';

function EmailValidation() {
    const [email, setEmail] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const validateEmail = async () => {
        setError(null);
        setResult(null);
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/validate-email', { email });
            const { ValidateEmailInfo } = response.data;

            if (ValidateEmailInfo) {
                setResult(ValidateEmailInfo);
            } else {
                setError('Unexpected response from server');
            }
        } catch (err) {
            setError('Failed to validate email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-start justify-center min-h-screen bg-gray-100">
            <div className="mt-4 bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-semibold mb-4 text-gray-800">Email Validation</h1>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                />
                <button
                    onClick={validateEmail}
                    className={`w-full px-4 py-2 text-white rounded-lg ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600'} transition-colors duration-300 ease-in-out`}
                    disabled={loading}
                >
                    {loading ? (
                        <svg className="animate-spin h-5 w-5 mx-auto text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="none" stroke="currentColor" strokeWidth="4" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                    ) : (
                        'Validate'
                    )}
                </button>
                {result && (
                    <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg text-green-800">
                        <h2 className="text-lg font-semibold">Validation Result</h2>
                        <p className="mt-2"><strong>Score:</strong> {result.Score}</p>
                        <p className="mt-2"><strong>Deliverability:</strong> {result.IsDeliverable === "true" ? 'Deliverable' : 'Not Deliverable'}</p>
                    </div>
                )}
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

export default EmailValidation;
