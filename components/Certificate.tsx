
import React, { useRef, useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Result } from '../types';
import { Download, Award, GraduationCap } from './icons';
import { getCollegeName } from '../services/mockApi'; // Path is mockApi but it's the real api client

interface CertificateProps {
  result: Result;
}

const Certificate: React.FC<CertificateProps> = ({ result }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [collegeName, setCollegeName] = useState('Loading...');

  useEffect(() => {
    const fetchCollegeName = async () => {
        try {
            const data = await getCollegeName();
            setCollegeName(data.name);
        } catch (error) {
            console.error("Failed to fetch college name", error);
            setCollegeName("Institute of Excellence");
        }
    };
    fetchCollegeName();
  }, []);

  const handleDownload = () => {
    if (certificateRef.current) {
      html2canvas(certificateRef.current, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const width = pdfWidth - 20; // with margin
        const height = width / ratio;

        pdf.addImage(imgData, 'PNG', 10, 10, width, height);
        pdf.save(`Certificate-${result.student.name.replace(' ','-')}-${result.student.id}.pdf`);
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6">
        <div ref={certificateRef} className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg p-8 border-4 border-primary-500 relative overflow-hidden">
            <div className="absolute -top-16 -left-16 w-48 h-48 border-8 border-primary-200 dark:border-primary-700 rounded-full opacity-50"></div>
            <div className="absolute -bottom-24 -right-12 w-64 h-64 border-t-8 border-l-8 border-primary-200 dark:border-primary-700 rounded-full opacity-50 transform rotate-45"></div>
            
            <div className="text-center mb-8 relative z-10">
                <GraduationCap className="mx-auto text-primary-500" size={48} />
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mt-2">{collegeName}</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">Statement of Marks</p>
            </div>

            <div className="flex justify-between items-center mb-8 relative z-10">
                <div className="text-left">
                    <p><strong>Student Name:</strong> {result.student.name}</p>
                    <p><strong>User ID:</strong> {result.student.id}</p>
                    <p><strong>Date of Birth:</strong> {result.student.dob}</p>
                    <p><strong>Class:</strong> {result.class.name}</p>
                </div>
                <img src={result.student.profilePictureUrl} alt="Student" className="w-28 h-28 rounded-full border-4 border-primary-300 object-cover" />
            </div>

            <div className="mb-8 relative z-10">
                <p><strong>Exam:</strong> {result.exam.name}</p>
                <p><strong>Exam Date:</strong> {result.exam.date}</p>
            </div>

            <div className="relative z-10">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-primary-500 text-white">
                        <tr>
                            <th className="p-3 border-b-2 border-primary-600">Subject</th>
                            <th className="p-3 border-b-2 border-primary-600 text-right">Marks (out of 100)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {result.marks.map((mark, index) => (
                            <tr key={index} className="dark:bg-gray-700/50 even:bg-gray-100 dark:even:bg-gray-700">
                                <td className="p-3 border-b border-gray-200 dark:border-gray-600">{mark.subjectName}</td>
                                <td className="p-3 border-b border-gray-200 dark:border-gray-600 text-right font-mono">{mark.marks ?? 'Not Graded'}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="font-bold bg-primary-100 dark:bg-primary-900/50">
                        <tr>
                            <td className="p-3">Total Marks</td>
                            <td className="p-3 text-right font-mono">{result.totalMarks}</td>
                        </tr>
                        <tr>
                            <td className="p-3">Percentage</td>
                            <td className="p-3 text-right font-mono">{result.percentage}%</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="mt-12 flex justify-between items-end relative z-10">
                <div>
                    <p>Issued On: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-center">
                    <div className="w-48 h-12 border-b-2 border-gray-400"></div>
                    <p className="mt-2">Signature of Principal</p>
                </div>
            </div>
             <div className="absolute inset-0 flex items-center justify-center">
                <Award size={200} className="text-primary-500/10 dark:text-primary-400/10" />
            </div>
        </div>

        {result.allSubjectsPerfect && (
            <div className="text-center mt-6">
                <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                >
                    <Download size={20} />
                    Download Certificate
                </button>
                <p className="text-green-700 dark:text-green-300 mt-2 font-semibold">Congratulations on your perfect score!</p>
            </div>
        )}
    </div>
  );
};

export default Certificate;
