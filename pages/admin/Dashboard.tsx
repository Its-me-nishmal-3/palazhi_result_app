
import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/mockApi'; // Path is mockApi but it's the real api client
import type { DashboardStats } from '../../types';
import { Users, Library, FileText, Award } from '../../components/icons';
import toast from 'react-hot-toast';

const StatCard = ({ icon, title, value, color }: { icon: React.ElementType, title: string, value: number, color: string }) => {
    const Icon = icon;
    return (
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center space-x-4 border-l-4 ${color}`}>
            <div className={`p-3 rounded-full ${color.replace('border', 'bg').replace('-500', '-100')} dark:${color.replace('border', 'bg').replace('-500', '-900')}`}>
                <Icon size={24} className={color.replace('border', 'text')} />
            </div>
            <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await getDashboardStats();
                setStats(data);
            } catch (error: any) {
                toast.error(`Failed to load dashboard stats: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            {loading ? (
                <p>Loading stats...</p>
            ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={Users} title="Total Students" value={stats.totalStudents} color="border-blue-500 text-blue-500" />
                    <StatCard icon={Library} title="Total Classes" value={stats.totalClasses} color="border-indigo-500 text-indigo-500" />
                    <StatCard icon={FileText} title="Exams Conducted" value={stats.totalExams} color="border-purple-500 text-purple-500" />
                    <StatCard icon={Award} title="Published Results" value={stats.publishedResults} color="border-green-500 text-green-500" />
                </div>
            ) : (
                 <p>Could not load dashboard statistics.</p>
            )}
             <div className="mt-12 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Welcome, Admin!</h2>
                <p className="text-gray-600 dark:text-gray-300">
                    From this panel, you can manage all aspects of the Marks Management System. Use the navigation on the left to:
                </p>
                <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600 dark:text-gray-300">
                    <li><strong className="text-gray-800 dark:text-white">Manage Students:</strong> Add new students, update their details, or remove them from the system.</li>
                    <li><strong className="text-gray-800 dark:text-white">Manage Classes:</strong> Create classes and assign subjects to them.</li>
                    <li><strong className="text-gray-800 dark:text-white">Manage Exams & Marks:</strong> Schedule new exams, assign them to classes, enter student marks, and publish results.</li>
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
