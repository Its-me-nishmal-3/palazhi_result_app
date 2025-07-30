
import React, { useState, useEffect, useCallback } from 'react';
import { getClasses, addClass, updateClass, deleteClass } from '../../services/mockApi'; // Path is mockApi but it's the real api client
import type { Class, Subject } from '../../types';
import toast from 'react-hot-toast';

const ClassModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, classId?: string) => void;
  classData: Class | null;
}> = ({ isOpen, onClose, onSave, classData }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    setName(classData ? classData.name : '');
  }, [classData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, classData?._id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{classData ? 'Edit Class' : 'Add Class'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Class Name" required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [subjectInputs, setSubjectInputs] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(true);

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getClasses();
      setClasses(data);
    } catch (error: any) {
      toast.error(`Failed to load classes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleSaveClass = async (name: string, classId?: string) => {
    try {
      if (classId) {
        await updateClass(classId, { name });
        toast.success('Class updated successfully!');
      } else {
        await addClass({ name });
        toast.success('Class added successfully!');
      }
      loadClasses();
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  const handleDeleteClass = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this class? This will also unassign students and delete related exams.')) {
        try {
            await deleteClass(id);
            toast.success('Class deleted successfully!');
            loadClasses();
        } catch(error: any) {
            toast.error(error.message);
        }
    }
  };
  
  const handleAddSubject = async (classId: string) => {
    const subjectName = subjectInputs[classId];
    if (!subjectName) {
        toast.error('Subject name cannot be empty.');
        return;
    }
    const targetClass = classes.find(c => c._id === classId);
    if(targetClass) {
        try {
            const updatedSubjects = [...targetClass.subjects, { name: subjectName, id: '', _id: '' }]; // Dummy ids
            await updateClass(classId, { subjects: updatedSubjects });
            toast.success(`Subject "${subjectName}" added to ${targetClass.name}.`);
            loadClasses();
            setSubjectInputs({...subjectInputs, [classId]: ''});
        } catch(error: any) {
            toast.error(error.message);
        }
    }
  };

  const handleRemoveSubject = async (classId: string, subjectId: string) => {
    const targetClass = classes.find(c => c._id === classId);
    if(targetClass) {
      try {
        const updatedSubjects = targetClass.subjects.filter(s => s._id !== subjectId);
        await updateClass(classId, { subjects: updatedSubjects });
        toast.success('Subject removed.');
        loadClasses();
      } catch(error: any) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Classes</h1>
        <button onClick={() => { setEditingClass(null); setIsModalOpen(true); }} className="px-4 py-2 bg-primary-500 text-white rounded-lg shadow hover:bg-primary-600">Add Class</button>
      </div>
      
      {loading ? (
        <p>Loading classes...</p>
      ) : (
      <div className="space-y-6">
        {classes.map(c => (
          <div key={c._id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{c.name}</h2>
              <div className="space-x-2">
                <button onClick={() => { setEditingClass(c); setIsModalOpen(true); }} className="text-indigo-600 dark:text-indigo-400 hover:underline">Edit Name</button>
                <button onClick={() => handleDeleteClass(c._id)} className="text-red-600 dark:text-red-400 hover:underline">Delete Class</button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Subjects:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4">
                {c.subjects.map(s => (
                  <li key={s._id} className="flex justify-between items-center">
                    <span>{s.name}</span>
                    <button onClick={() => handleRemoveSubject(c._id, s._id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </li>
                ))}
                {c.subjects.length === 0 && <p className="text-sm text-gray-500">No subjects assigned.</p>}
              </ul>
              <div className="flex space-x-2 mt-4">
                <input 
                  type="text" 
                  placeholder="New Subject Name" 
                  value={subjectInputs[c._id] || ''}
                  onChange={e => setSubjectInputs({...subjectInputs, [c._id]: e.target.value})}
                  className="flex-grow p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <button onClick={() => handleAddSubject(c._id)} className="px-4 py-2 bg-green-500 text-white rounded">Add Subject</button>
              </div>
            </div>
          </div>
        ))}
         {classes.length === 0 && <p className="text-center text-gray-500 py-8">No classes created yet. Add one to begin.</p>}
      </div>
      )}

      <ClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClass}
        classData={editingClass}
      />
    </div>
  );
};

export default Classes;
