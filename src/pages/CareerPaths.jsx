import { useState, useContext, useCallback, useMemo } from 'react';
import { Plus, Trash2, TrendingUp, Award, BookOpen } from 'lucide-react';
import GuestContext from '../contexts/GuestContext';
import { getPageContainerClasses, getPageHeaderClasses, getPageTitleClasses } from '../utils/layoutHelpers';

/**
 * Career Paths Page
 * Career development and progression tracking
 */
export default function CareerPaths() {
  const { guestData, updateGuestData } = useContext(GuestContext);
  const [careerPaths, setCareerPaths] = useState(guestData?.careerPaths || []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    startDate: '',
    endDate: '',
    salary: '',
    skills: '',
  });

  const saveCareerPaths = (updatedPaths) => {
    setCareerPaths(updatedPaths);
    updateGuestData(prev => ({
      ...prev,
      careerPaths: updatedPaths,
    }));
  };

  const handleAddPath = useCallback(() => {
    if (!formData.title) {
      alert('Please enter a job title');
      return;
    }
    const newPath = {
      id: Date.now(),
      ...formData,
      salary: formData.salary ? parseInt(formData.salary) : 0,
      createdAt: new Date().toISOString(),
    };
    saveCareerPaths([...careerPaths, newPath]);
    setFormData({
      title: '',
      company: '',
      description: '',
      startDate: '',
      endDate: '',
      salary: '',
      skills: '',
    });
    setShowForm(false);
  }, [formData, careerPaths, saveCareerPaths]);

  const handleDeletePath = useCallback((id) => {
    if (confirm('Delete this career entry?')) {
      saveCareerPaths(careerPaths.filter(p => p.id !== id));
    }
  }, [careerPaths, saveCareerPaths]);

  const avgSalary = useMemo(() =>
    careerPaths.length > 0 
      ? Math.round(careerPaths.reduce((sum, p) => sum + (p.salary || 0), 0) / careerPaths.length)
      : 0,
    [careerPaths]
  );

  const sortedPaths = useMemo(() =>
    careerPaths.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)),
    [careerPaths]
  );

  return (
    <div className={getPageContainerClasses()}>
      <div className={getPageHeaderClasses()}>
        <h1 className={getPageTitleClasses()}>Career Paths</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          aria-label="Add new career path"
        >
          <Plus className="w-4 h-4" />
          Add Path
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Add Career Path</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Job Title *"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Job title"
            />
            <input
              type="text"
              placeholder="Company"
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Company name"
            />
            <input
              type="number"
              placeholder="Salary"
              value={formData.salary}
              onChange={(e) => setFormData({...formData, salary: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Salary"
            />
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Start date"
            />
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="End date"
            />
            <input
              type="text"
              placeholder="Key Skills"
              value={formData.skills}
              onChange={(e) => setFormData({...formData, skills: e.target.value})}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Key skills"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              aria-label="Job description"
            />
          </div>
          <div className="flex gap-3 justify-end mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddPath}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              aria-label="Add career path"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="font-bold">Total Paths</span>
          </div>
          <div className="text-3xl font-bold">{careerPaths.length}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <Award className="w-5 h-5" />
            <span className="font-bold">Current Role</span>
          </div>
          <div className="text-lg font-bold">
            {careerPaths.length > 0 ? careerPaths[careerPaths.length - 1].title : 'None'}
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <BookOpen className="w-5 h-5" />
            <span className="font-bold">Avg Salary</span>
          </div>
          <div className="text-lg font-bold">
            ${avgSalary.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {careerPaths.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
            No career paths yet
          </div>
        ) : (
          sortedPaths.map((path, index) => (
            <div key={path.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{path.title}</h3>
                    <p className="text-gray-600">{path.company}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePath(path.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  aria-label={`Delete career path: ${path.title}`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {path.description && (
                <p className="text-gray-700 mb-4">{path.description}</p>
              )}

              <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                {path.salary > 0 && (
                  <div>
                    <span className="font-bold">Salary:</span> ${path.salary.toLocaleString()}
                  </div>
                )}
                {path.startDate && (
                  <div>
                    <span className="font-bold">Started:</span> {path.startDate}
                  </div>
                )}
                {path.endDate && (
                  <div>
                    <span className="font-bold">Ended:</span> {path.endDate}
                  </div>
                )}
              </div>

              {path.skills && (
                <div>
                  <span className="font-bold text-sm">Skills:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {path.skills.split(',').map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
