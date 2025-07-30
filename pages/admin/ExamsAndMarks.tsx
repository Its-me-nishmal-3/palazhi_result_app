
import React, { useState, useEffect, useCallback } from 'react';
import { getExams, addExam, updateExam, deleteExam, getClasses, getStudents, getMarksForExam, updateMark } from '../../services/mockApi'; // Path is mockApi but it's the real api client
import type { Exam, Class, Student, Mark } from '../../types';
import toast from 'react-hot-toast';

const ExamModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (exam: Omit<Exam, '_id' | 'isPublished'>) => void;
  classes: Class[];
}> = ({ isOpen, onClose, onSave, classes }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [classId, setClassId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date || !classId) {
      toast.error('All fields are required.');
      return;
    }
    onSave({ name, date, classId });
    setName(''); setDate(''); setClassId('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Add Exam</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Exam Name" required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"/>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"/>
          <select value={classId} onChange={e => setClassId(e.target.value)} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
            <option value="">Select a Class</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MarksEditor: React.FC<{
  exam: Exam;
  onClose: () => void;
  classes: Class[];
  students: Student[];
}> = ({ exam, onClose, classes, students }) => {
    const examClass = classes.find(c => c._id === exam.classId);
    const classStudents = students.filter(s => s.classId === exam.classId);
    const [marks, setMarks] = useState<Mark[]>([]);

    const fetchMarks = useCallback(async () => {
        try {
            const marksData = await getMarksForExam(exam._id);
            setMarks(marksData);
        } catch (error: any) {
            toast.error(`Failed to load marks: ${error.message}`);
        }
    }, [exam._id]);

    useEffect(() => {
        fetchMarks();
    }, [fetchMarks]);
    
    const handleMarkChange = async (studentId: number, subjectId: string, value: string) => {
        const markValue = value === '' ? null : parseInt(value);
        if (markValue !== null && (isNaN(markValue) || markValue < 0 || markValue > 100)) {
            toast.error("Marks must be between 0 and 100.");
            return;
        }

        const newMark: Omit<Mark, '_id'> = { studentId, examId: exam._id, subjectId, marks: markValue };
        try {
            await updateMark(newMark);
            // Debounced toast or selective success message might be better here to avoid spam
            // For now, let's just refetch
            fetchMarks();
        } catch (error: any) {
            toast.error(error.message);
        }
    };
    
    const getMark = (studentId: number, subjectId: string) => {
        const mark = marks.find(m => m.studentId === studentId && m.subjectId === subjectId);
        return mark?.marks?.toString() ?? '';
    }

    return (
        <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Marks for {exam.name} - {examClass?.name}</h3>
                <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800">Close</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-2 text-left">Student</th>
                            {examClass?.subjects.map(s => <th key={s._id} className="px-4 py-2 text-center">{s.name}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {classStudents.map(student => (
                            <tr key={student._id} className="border-t dark:border-gray-700">
                                <td className="px-4 py-2 font-medium whitespace-nowrap">{student.name}</td>
                                {examClass?.subjects.map(subject => (
                                    <td key={subject._id} className="px-4 py-2">
                                        <input 
                                            type="number" 
                                            min="0"
                                            max="100"
                                            defaultValue={getMark(student.id, subject._id)}
                                            onBlur={e => handleMarkChange(student.id, subject._id, e.target.value)}
                                            className="w-20 p-1 text-center border rounded dark:bg-gray-700 dark:border-gray-600"
                                            placeholder="N/A"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {classStudents.length === 0 && <p className="text-center text-gray-500 p-4">No students in this class.</p>}
            </div>
        </div>
    );
};


const ExamsAndMarks: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMarksFor, setEditingMarksFor] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  
  const loadData = useCallback(async () => {
    try {
        setLoading(true);
        const [examsData, classesData, studentsData] = await Promise.all([getExams(), getClasses(), getStudents()]);
        setExams(examsData);
        setClasses(classesData);
        setStudents(studentsData);
    } catch (error: any) {
        toast.error(`Failed to load data: ${error.message}`);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveExam = async (examData: Omit<Exam, '_id' | 'isPublished'>) => {
    try {
        await addExam(examData);
        toast.success('Exam added successfully!');
        loadData();
        setIsModalOpen(false);
    } catch(error: any) {
        toast.error(error.message);
    }
  };
  
  const handleDeleteExam = async (id: string) => {
      if (window.confirm('Are you sure you want to delete this exam? All associated marks will also be deleted.')) {
          try {
            await deleteExam(id);
            toast.success('Exam deleted successfully!');
            loadData();
          } catch(error: any) {
            toast.error(error.message);
          }
      }
  };

  const handlePublishToggle = async (exam: Exam) => {
      try {
        const updatedExam = await updateExam(exam._id, { isPublished: !exam.isPublished });
        toast.success(`Results for ${exam.name} have been ${updatedExam.isPublished ? 'published' : 'unpublished'}.`);
        loadData();
      } catch (error: any) {
        toast.error(error.message);
      }
  };
  
  const getClassName = (classId: string) => {
      return classes.find(c => c._id === classId)?.name || 'Unknown Class';
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Exams & Marks</h1>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary-500 text-white rounded-lg shadow hover:bg-primary-600">Add Exam</button>
      </div>
      
       {loading ? (
        <p>Loading exams...</p>
      ) : (
      <div className="space-y-4">
        {exams.map(exam => (
          <div key={exam._id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <p className="font-bold text-lg">{exam.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getClassName(exam.classId)} | Date: {exam.date}
                </p>
              </div>
              <div className="flex items-center space-x-2 flex-wrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${exam.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {exam.isPublished ? 'Published' : 'Unpublished'}
                </span>
                <button onClick={() => setEditingMarksFor(exam)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Manage Marks</button>
                <button onClick={() => handlePublishToggle(exam)} className="text-sm text-green-600 dark:text-green-400 hover:underline">{exam.isPublished ? 'Unpublish' : 'Publish'}</button>
                <button onClick={() => handleDeleteExam(exam._id)} className="text-sm text-red-600 dark:text-red-400 hover:underline">Delete</button>
              </div>
            </div>
            {editingMarksFor?._id === exam._id && (
                <MarksEditor exam={exam} onClose={() => setEditingMarksFor(null)} classes={classes} students={students} />
            )}
          </div>
        ))}
        {exams.length === 0 && <p className="text-center text-gray-500 py-8">No exams created yet.</p>}
      </div>
      )}

      <ExamModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveExam}
        classes={classes}
      />
    </div>
  );
};

export default ExamsAndMarks;
