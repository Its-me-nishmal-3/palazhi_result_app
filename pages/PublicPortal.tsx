
import React, { useState } from 'react';
import { findResult } from '../services/mockApi'; // Path is mockApi but it's the real api client
import type { Result } from '../types';
import Certificate from '../components/Certificate';
import { GraduationCap } from '../components/icons';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const PublicPortal: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!userId || !dob) {
      setError('Please enter both User ID and Date of Birth.');
      return;
    }
    setLoading(true);
    try {
        const foundResult = await findResult(parseInt(userId), dob);
        if (foundResult) {
            setResult(foundResult);
        } else {
            setError('No published result found for the given credentials. Please check the details or contact the administration.');
        }
    } catch (err: any) {
        setError(err.message || 'An error occurred while searching for the result.');
        toast.error(err.message || 'Search failed.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <GraduationCap className="mx-auto text-primary-500" size={64}/>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-4">Result & Certificate Portal</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Check your exam results and download your certificate.</p>
        </div>
        
        {!result && (
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 max-w-md mx-auto">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">User ID</label>
                            <input
                                type="number"
                                id="userId"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                placeholder="e.g., 1001"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                            <input
                                type="date"
                                id="dob"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>
                    </div>
                    {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
                    <div className="mt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Searching...' : 'Find Result'}
                        </button>
                    </div>
                </form>
            </div>
        )}
        
        {result && (
            <div>
                <Certificate result={result} />
                 <div className="text-center mt-6">
                    <button
                        onClick={() => { setResult(null); setUserId(''); setDob(''); setError(''); }}
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                        Search for another result
                    </button>
                </div>
            </div>
        )}
      </div>
      <footer className="absolute bottom-4 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>Marks Management System &copy; {new Date().getFullYear()}</p>
        <Link to="/admin/login" className="hover:underline">Admin Login</Link>
      </footer>
    </div>
  );
};

export default PublicPortal;
