import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function EmailValidationExcel() {
    const [processes, setProcesses] = useState([]);
    const [currentFile, setCurrentFile] = useState(null);

    const handleFileChange = (e) => {
        setCurrentFile(e.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!currentFile) {
            return;
        }

        const newProcess = {
            file: currentFile,
            loading: true,
            error: null,
            progress: 0, // Initialize progress at 0%
        };

        setProcesses((prevProcesses) => [...prevProcesses, newProcess]);

        const formData = new FormData();
        formData.append('file', currentFile);

        try {
            const response = await axios.post('http://localhost:5000/validate-emails', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProcesses((prevProcesses) =>
                        prevProcesses.map((process) =>
                            process.file === currentFile
                                ? { ...process, progress }
                                : process
                        )
                    );
                },
            });

            const { validatedData } = response.data;

            const newWorkbook = XLSX.utils.book_new();
            const newWorksheet = XLSX.utils.json_to_sheet(validatedData);
            XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Validated Emails');

            // Trigger download
            XLSX.writeFile(newWorkbook, `validated_${currentFile.name}`);

            setProcesses((prevProcesses) =>
                prevProcesses.map((process) =>
                    process.file === currentFile
                        ? { ...process, loading: false }
                        : process
                )
            );
        } catch (err) {
            setProcesses((prevProcesses) =>
                prevProcesses.map((process) =>
                    process.file === currentFile
                        ? { ...process, loading: false, error: 'Failed to process file' }
                        : process
                )
            );
        } finally {
            setCurrentFile(null); // Clear the selected file after processing
        }
    };

    return (
        <div className="flex flex-col items-center justify-center">
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
                    className={`w-full px-4 py-2 text-white rounded-lg ${currentFile ? 'bg-blue-600' : 'bg-blue-400 cursor-not-allowed'} transition-colors duration-300 ease-in-out`}
                    disabled={!currentFile}
                >
                    Upload and Validate
                </button>
            </div>
            <div className="w-full max-w-md mt-8 space-y-4">
                {processes.map((process, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-lg">
                        <h2 className="text-lg font-semibold text-gray-800">{process.file.name}</h2>
                        {process.loading && (
                            <div className="flex items-center mt-2">
                                <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                                    <div
                                        className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
                                        style={{ width: `${process.progress}%` }}
                                    >
                                        {process.progress}%
                                    </div>
                                </div>
                            </div>
                        )}
                        {process.error && (
                            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-lg text-red-800">
                                <p>{process.error}</p>
                            </div>
                        )}
                        {!process.loading && !process.error && (
                            <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded-lg text-green-800">
                                <p>File validated successfully</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default EmailValidationExcel;