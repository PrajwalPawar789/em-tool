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
            const response = await axios.get('http://localhost:5001/validate-email-single', {
                params: {
                    email: email,
                    AllowCorrections: true,
                    Timeout: 200,
                    LicenseKey: 'WS73-RYC3-ZFV2'
                }
            });

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
        <div className="flex flex-row items-center justify-center">
            <div className="mt-8 bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Email Validation</h1>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={validateEmail}
                    className={`w-full px-4 py-3 text-white font-semibold rounded-lg transition-colors duration-300 ease-in-out ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    disabled={loading}
                >
                    {loading ? (
                        <svg className="animate-spin h-5 w-5 mx-auto text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                    ) : (
                        'Validate'
                    )}
                </button>
                {result && (
                    <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-800">
                        <h2 className="text-lg font-semibold">Validation Result</h2>
                        <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto text-sm">{JSON.stringify(result, null, 2)}</pre>
                    </div>
                )}
                {error && (
                    <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
                        <h2 className="text-lg font-semibold">Error</h2>
                        <p>{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EmailValidation;
