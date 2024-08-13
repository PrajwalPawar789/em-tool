import React from 'react';

const Support = () => {
    return (
        <div className="min-h-screen  text-white flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-2xl">
                <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">
                    Support
                </h1>
                
                {/* Support Form */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Submit an Issue</h2>
                    <form className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-lg font-medium text-gray-800">Email</label>
                            <input
                                type="email"
                                id="email"
                                className="w-full text-black  px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-lg font-medium text-gray-800">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                className="w-full px-4 text-black py-3 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                                placeholder="Enter the subject"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-lg font-medium text-gray-800">Message</label>
                            <textarea
                                id="message"
                                className="w-full px-4 py-3 text-black rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                                placeholder="Describe your issue"
                                rows="6"
                                required
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold transition-all duration-300 hover:from-blue-700 hover:to-blue-900"
                        >
                            Submit
                        </button>
                    </form>
                </div>

                {/* FAQ Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-100 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-800">How do I validate an email?</h3>
                            <p className="mt-2 text-gray-700">
                                You can validate an email by navigating to the Email Validation section of our application and entering the email address you wish to validate.
                            </p>
                        </div>
                        <div className="p-4 bg-gray-100 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-800">How do I upload an Excel file for validation?</h3>
                            <p className="mt-2 text-gray-700">
                                Navigate to the Email Validation Excel section, select your file, and click the upload button to start the validation process.
                            </p>
                        </div>
                        <div className="p-4 bg-gray-100 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-800">What types of files are supported?</h3>
                            <p className="mt-2 text-gray-700">
                                Our application currently supports .xlsx and .xls file formats for email validation.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Need Further Assistance?</h2>
                    <p className="text-lg mb-6 text-gray-700">Contact us at:</p>
                    <p className="text-xl font-bold text-blue-600">prajwal_pawar@manlitics.com</p>
                </div>
            </div>
        </div>
    );
};

export default Support;
