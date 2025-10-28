import { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { Plus, Edit2, Trash2, Calendar, Target, Users, AlertCircle, Check, Zap, X } from 'lucide-react';
import GuestContext from '../contexts/GuestContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import ProjectCard from '../components/common/ProjectCard';
import { getPageContainerClasses, getPageHeaderClasses, getPageTitleClasses } from '../utils/layoutHelpers';

/**
 * Projects Management Component
 * Advanced project tracking with:
 * - Status management (planned, in-progress, completed, on-hold, cancelled)
 * - Progress tracking and timeline
 * - Team collaboration support
 * - Firestore integration for cross-app sync
 */
export default function Projects() {
  const { guestData, updateGuestData } = useContext(GuestContext);
  const { user } = useAuth();
  const [projects, setProjects] = useState(guestData?.projects || []);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planned',
    startDate: '',
    endDate: '',
    progress: 0,
    team: '',
    priority: 'medium',
    category: 'other',
  });

  // Load projects from Firebase
  useEffect(() => {
    if (!user) return;

    const loadFromFirebase = async () => {
      try {
        setSyncStatus('syncing');
        const docRef = doc(db, 'users', user.uid, 'projects', 'all');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProjects(data.projects || []);
          setLastSyncTime(data.lastUpdatedAt);
        }
        setSyncStatus('success');
      } catch (error) {
        console.error('Error loading projects:', error);
        setSyncStatus('error');
      }
    };

    loadFromFirebase();

    // Real-time listener
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid, 'projects', 'all'),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setProjects(data.projects || []);
          setLastSyncTime(data.lastUpdatedAt);
        }
      },
      (error) => console.error('Error listening to projects:', error)
    );

    return unsubscribe;
  }, [user]);

  // Save projects to Firestore
  const saveToFirebase = async (updatedProjects) => {
    if (!user) return;
    try {
      setSyncStatus('syncing');
      const docRef = doc(db, 'users', user.uid, 'projects', 'all');
      await updateDoc(docRef, {
        projects: updatedProjects,
        lastUpdatedBy: 'lifesync',
        lastUpdatedAt: serverTimestamp(),
      });
      setLastSyncTime(new Date());
      setSyncStatus('success');
    } catch (error) {
      console.error('Error saving projects:', error);
      setSyncStatus('error');
    }
  };

  const saveProjects = (updatedProjects) => {
    setProjects(updatedProjects);
    updateGuestData(prev => ({
      ...prev,
      projects: updatedProjects,
    }));
    saveToFirebase(updatedProjects);
  };

  const handleSaveProject = useCallback(() => {
    if (!formData.name) {
      alert('Please enter a project name');
      return;
    }

    if (editingProject) {
      const updated = projects.map(p => p.id === editingProject.id ? {
        ...editingProject,
        ...formData,
        progress: parseInt(formData.progress),
        updatedAt: new Date().toISOString()
      } : p);
      saveProjects(updated);
      setEditingProject(null);
    } else {
      const newProject = {
        id: Date.now(),
        ...formData,
        progress: parseInt(formData.progress),
        createdAt: new Date().toISOString(),
      };
      saveProjects([...projects, newProject]);
    }

    setFormData({
      name: '',
      description: '',
      status: 'planned',
      startDate: '',
      endDate: '',
      progress: 0,
      team: '',
      priority: 'medium',
      category: 'other',
    });
    setShowForm(false);
  }, [formData, editingProject, projects]);

  const handleEditProject = useCallback((project) => {
    setEditingProject(project);
    setFormData(project);
    setShowForm(true);
  }, []);

  const handleDeleteProject = useCallback((id) => {
    if (confirm('Delete this project?')) {
      saveProjects(projects.filter(p => p.id !== id));
    }
  }, [projects]);

  const statusColors = {
    planned: 'bg-gray-100 text-gray-800 border-l-4 border-gray-500',
    inProgress: 'bg-blue-100 text-blue-800 border-l-4 border-blue-500',
    completed: 'bg-green-100 text-green-800 border-l-4 border-green-500',
    onHold: 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500',
    cancelled: 'bg-red-100 text-red-800 border-l-4 border-red-500',
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  const filteredProjects = useMemo(() =>
    filterStatus === 'all' ? projects : projects.filter(p => p.status === filterStatus),
    [filterStatus, projects]
  );

  const completedCount = useMemo(() => 
    projects.filter(p => p.status === 'completed').length,
    [projects]
  );

  const inProgressCount = useMemo(() =>
    projects.filter(p => p.status === 'inProgress').length,
    [projects]
  );

  const avgProgress = useMemo(() =>
    projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0,
    [projects]
  );

  return (
    <div className={getPageContainerClasses()}>
      {/* Header */}
      <div className={getPageHeaderClasses()}>
        <div>
          <h1 className={getPageTitleClasses()}>Projects</h1>
          {lastSyncTime && (
            <p className="text-sm text-gray-600 mt-1">
              Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingProject(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          aria-label="Add new project"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Sync Status */}
      {syncStatus !== 'idle' && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          syncStatus === 'success' ? 'bg-green-50 text-green-700' :
          syncStatus === 'error' ? 'bg-red-50 text-red-700' :
          'bg-blue-50 text-blue-700'
        }`}>
          {syncStatus === 'syncing' && <Zap className="w-4 h-4 animate-spin" />}
          {syncStatus === 'success' && <Check className="w-4 h-4" />}
          {syncStatus === 'error' && <AlertCircle className="w-4 h-4" />}
          <span className="text-sm">
            {syncStatus === 'syncing' ? 'Syncing with Firebase...' :
             syncStatus === 'success' ? 'Synced successfully!' :
             'Sync error - changes saved locally'}
          </span>
        </div>
      )}

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-gray-600 text-sm">Total Projects</p>
          <p className="text-3xl font-bold text-blue-600">{projects.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-gray-600 text-sm">Completed</p>
          <p className="text-3xl font-bold text-green-600">{completedCount}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-gray-600 text-sm">In Progress</p>
          <p className="text-3xl font-bold text-orange-600">{inProgressCount}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-gray-600 text-sm">Avg Progress</p>
          <p className="text-3xl font-bold text-purple-600">{avgProgress}%</p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
            <button onClick={() => { setShowForm(false); setEditingProject(null); }} aria-label="Close form">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Project Name *"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Project name"
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Project status"
            >
              <option value="planned">Planned</option>
              <option value="inProgress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="onHold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Project priority"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical</option>
            </select>
            <input
              type="number"
              placeholder="Progress (%)"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({...formData, progress: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Progress percentage"
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
              placeholder="Team (comma-separated)"
              value={formData.team}
              onChange={(e) => setFormData({...formData, team: e.target.value})}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Team members"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              aria-label="Project description"
            />
          </div>
          <div className="flex gap-3 justify-end mt-4">
            <button
              onClick={() => { setShowForm(false); setEditingProject(null); }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProject}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              aria-label={editingProject ? "Update project" : "Create project"}
            >
              <Plus className="w-4 h-4" />
              {editingProject ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Status Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'planned', 'inProgress', 'completed', 'onHold', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-pressed={filterStatus === status}
          >
            {status === 'all' ? 'All' : status.replace(/([A-Z])/g, ' $1').trim()}
          </button>
        ))}
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          No projects in this status. <button onClick={() => { setShowForm(true); setEditingProject(null); }} className="text-blue-600 underline">Create one!</button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              statusColors={statusColors}
              priorityColors={priorityColors}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
