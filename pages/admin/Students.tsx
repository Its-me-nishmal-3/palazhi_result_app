
import React, { useState, useEffect, useCallback } from 'react';
import { getStudents, addStudent, updateStudent, deleteStudent, getClasses } from '../../services/mockApi'; // Path is mockApi but it's the real api client
import type { Student, Class } from '../../types';
import toast from 'react-hot-toast';

type StudentFormData = {
  _id?: string;
  name: string;
  dob: string;
  classId: string | null;
  profilePicture?: File | null;
  profilePictureUrl?: string;
};

const StudentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData, studentId?: string) => void;
  student: Student | null;
  classes: Class[];
}> = ({ isOpen, onClose, onSave, student, classes }) => {
  const [formData, setFormData] = useState<StudentFormData>({ name: '', dob: '', classId: null, profilePicture: null });

  useEffect(() => {
    if (student) {
      setFormData({
        _id: student._id,
        name: student.name,
        dob: student.dob,
        classId: student.classId,
        profilePictureUrl: student.profilePictureUrl
      });
    } else {
      setFormData({ name: '', dob: '', classId: null, profilePicture: null });
    }
  }, [student]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, profilePicture: e.target.files[0] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('dob', formData.dob);
    if(formData.classId) data.append('classId', formData.classId);
    if(formData.profilePicture) data.append('profilePicture', formData.profilePicture);
    
    onSave(data, formData._id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{student ? 'Edit Student' : 'Add Student'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"/>
          <input type="date" name="dob" value={formData.dob} onChange={handleChange} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"/>
          <div>
            <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture</label>
            <input type="file" name="profilePicture" id="profilePicture" onChange={handleFileChange} accept="image/*" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"/>
            {student && <p className="text-xs mt-1 text-gray-500">Leave blank to keep existing picture.</p>}
          </div>
          <select name="classId" value={formData.classId || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
            <option value="">Unassigned</option>
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

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [studentsData, classesData] = await Promise.all([getStudents(), getClasses()]);
      setStudents(studentsData);
      setClasses(classesData);
    } catch (error: any) {
      toast.error(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openModalForNew = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: FormData, studentId?: string) => {
    try {
      if (studentId) {
        await updateStudent(studentId, formData);
        toast.success('Student updated successfully!');
      } else {
        await addStudent(formData);
        toast.success('Student added successfully!');
      }
      loadData();
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
        try {
            await deleteStudent(id);
            toast.success('Student deleted successfully!');
            loadData();
        } catch(error: any) {
            toast.error(error.message);
        }
    }
  };

  const getClassName = (classId: string | null) => {
      if(!classId) return 'N/A';
      return classes.find(c => c._id === classId)?.name || 'Unknown';
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Students</h1>
        <button onClick={openModalForNew} className="px-4 py-2 bg-primary-500 text-white rounded-lg shadow hover:bg-primary-600">Add Student</button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">DOB</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {loading ? (
                <tr><td colSpan={5} className="text-center p-4">Loading students...</td></tr>
            ) : students.map(student => (
              <tr key={student._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{student.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm flex items-center">
                    <img src={student.profilePictureUrl} alt={student.name} className="w-8 h-8 rounded-full mr-3 object-cover" />
                    {student.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{getClassName(student.classId)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{student.dob}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                  <button onClick={() => openModalForEdit(student)} className="text-indigo-600 dark:text-indigo-400 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(student._id!)} className="text-red-600 dark:text-red-400 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <StudentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave}
        student={editingStudent}
        classes={classes}
      />
    </div>
  );
};

export default Students;
