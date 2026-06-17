import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { importIssues } from '../services/import.service';

export const ImportPage = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResult(null);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await importIssues(file);
            setResult(data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'An error occurred during file upload.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Import Issues</h1>
                <p className="text-gray-600">Upload a CSV or Excel file to batch import issues into the tracker.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors">
                    <FileSpreadsheet className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Upload your file</h3>
                    <p className="text-sm text-gray-500 mb-6">Supports .csv, .xls, and .xlsx files</p>
                    
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        onChange={handleFileChange}
                    />
                    <label
                        htmlFor="file-upload"
                        className="btn-primary cursor-pointer inline-flex items-center gap-2"
                    >
                        <Upload size={18} />
                        Select File
                    </label>

                    {file && (
                        <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md inline-block">
                            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader className="animate-spin" size={18} /> : <Upload size={18} />}
                        {loading ? 'Importing...' : 'Start Import'}
                    </button>
                </div>
                
                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
                        <AlertCircle className="shrink-0 mt-0.5" size={20} />
                        <p>{error}</p>
                    </div>
                )}
            </div>

            {result && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Import Results</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-100">
                            <p className="text-gray-500 text-sm font-medium mb-1">Total Rows</p>
                            <p className="text-3xl font-bold text-gray-900">{result.totalRows}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-6 text-center border border-green-100">
                            <p className="text-green-600 text-sm font-medium mb-1 flex items-center justify-center gap-1">
                                <CheckCircle size={16} /> Successful
                            </p>
                            <p className="text-3xl font-bold text-green-700">{result.successfulRows}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-6 text-center border border-red-100">
                            <p className="text-red-600 text-sm font-medium mb-1 flex items-center justify-center gap-1">
                                <AlertCircle size={16} /> Failed
                            </p>
                            <p className="text-3xl font-bold text-red-700">{result.failedRows}</p>
                        </div>
                    </div>

                    {result.errors && result.errors.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Error Details</h3>
                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Row</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error Message</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {result.errors.map((err, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    Row {err.rowNumber}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-red-600">
                                                    {err.errorMessage}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
