import { useState, useContext, useEffect, useCallback } from 'react';
import { Plus, Trash2, FileDown, Cloud, RefreshCw, AlertCircle, ExternalLink, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import GuestContext from '../contexts/GuestContext';
import { getPageContainerClasses, getPageTitleClasses } from '../utils/layoutHelpers';

/**
 * Advanced LifeCV Component with Ecosystem Sync
 * 
 * This is the central hub for professional data across the Salatiso Ecosystem.
 * - Syncs with Firebase for availability across all apps
 * - Tracks which app made updates
 * - Real-time updates from other ecosystem apps
 * - Integrates with user profile
 */
const LifeCV = () => {
  const { guestData, updateGuestData } = useContext(GuestContext);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [syncMessage, setSyncMessage] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [appUpdates, setAppUpdates] = useState([]); // Track which apps made updates

  // LifeCV data state
  const [lifeCV, setLifeCV] = useState({
    // Personal & Identity
    fullName: 'Salatiso Lonwabo Mdeni',
    email: 'salatiso@salatiso.com',
    phone: '084 652 9115',
    location: 'Johannesburg, Gauteng, South Africa',

    // Professional Profile
    personalProfile: '',
    careerVision: '',
    workStyle: '',
    missionStatement: '',
    coreValues: [
      'Equality Before the Law',
      'The Golden Rule',
      'Self-Sufficiency & Resilience',
      'Family & Legacy',
      'Meritocracy'
    ],

    // Career Data
    education: [],
    experience: [],
    skills: [],
    certifications: [],
    projects: [],

    // Metadata for ecosystem sync
    lastUpdatedBy: 'lifesync',
    lastUpdatedAt: Date.now(),
    syncedApps: ['lifesync'],
    dataVersion: 1
  });

  // Initialize with your actual data on first load
  useEffect(() => {
    const initializeData = () => {
      setLifeCV(prev => ({
        ...prev,
        personalProfile: 'A seasoned OHS and Risk Management expert with over two decades of experience across diverse industries. A passionate author, social entrepreneur, and staunch advocate for fathers\', boys\', and family rights.',
        careerVision: 'To leverage expertise in risk management, law, and social advocacy to dismantle systemic discrimination, particularly within family law. To empower individuals and communities through accessible knowledge.',
        workStyle: 'A proactive and strategic thinker who thrives on complex challenges. Combines deep understanding of technical and regulatory landscapes with strong leadership and communication skills.',
        missionStatement: 'I am a father to my son; all else is a means to this end. I strive to create a better future for him by confronting societal injustices.'
      }));
      setLoading(false);
    };

    const timer = setTimeout(initializeData, 500);
    return () => clearTimeout(timer);
  }, []);

  // Load LifeCV from Firebase on component mount
  useEffect(() => {
    if (!user) return;

    const loadFromFirebase = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'profile', 'lifecv');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setLifeCV(prev => ({ ...prev, ...data }));
          setLastSyncTime(data.lastUpdatedAt);
          
          // Check if update came from different app
          if (data.lastUpdatedBy !== 'lifesync') {
            setAppUpdates(prev => [...prev, {
              app: data.lastUpdatedBy,
              timestamp: data.lastUpdatedAt,
              fields: 'Profile updated'
            }]);
          }
        }

        // Set up real-time listener for updates from other apps
        const unsubscribe = onSnapshot(docRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.lastUpdatedBy !== 'lifesync' && data.lastUpdatedAt > lifeCV.lastUpdatedAt) {
              setLifeCV(prev => ({ ...prev, ...data }));
              setSyncStatus('success');
              setSyncMessage(`Updated from ${data.lastUpdatedBy}!`);
              setTimeout(() => setSyncStatus('idle'), 3000);
            }
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error loading LifeCV from Firebase:', error);
        setSyncStatus('error');
        setSyncMessage('Failed to load data from Firebase');
      }
    };

    loadFromFirebase();
  }, [user]);

  // Sync to Firebase
  const syncToFirebase = async () => {
    if (!user) {
      setSyncStatus('error');
      setSyncMessage('Not logged in');
      return;
    }

    setSyncing(true);
    setSyncStatus('syncing');
    setSyncMessage('Syncing to cloud...');

    try {
      const docRef = doc(db, 'users', user.uid, 'profile', 'lifecv');
      
      const updateData = {
        ...lifeCV,
        lastUpdatedAt: serverTimestamp(),
        lastUpdatedBy: 'lifesync',
        syncedApps: Array.from(new Set([...(lifeCV.syncedApps || []), 'lifesync'])),
        userId: user.uid
      };

      await updateDoc(docRef, updateData);

      setSyncStatus('success');
      setSyncMessage('✓ Synced successfully! Available across ecosystem');
      setLastSyncTime(Date.now());

      // Update GuestContext as well
      updateGuestData(prev => ({
        ...prev,
        lifeCV: lifeCV
      }));

      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('Error syncing to Firebase:', error);
      setSyncStatus('error');
      setSyncMessage('Failed to sync. Check your connection.');
    } finally {
      setSyncing(false);
    }
  };

  // Add education entry
  const handleAddEducation = useCallback(() => {
    const newEducation = {
      id: Date.now(),
      school: 'Tshwane University of Technology (TUT)',
      degree: 'B-Tech',
      field: 'Environmental Health',
      graduationDate: '2008',
      description: ''
    };
    setLifeCV(prev => ({
      ...prev,
      education: [...(prev.education || []), newEducation],
      lastUpdatedAt: Date.now(),
      lastUpdatedBy: 'lifesync'
    }));
  }, []);

  const handleUpdateEducation = useCallback((id, field, value) => {
    setLifeCV(prev => ({
      ...prev,
      education: prev.education.map(e => 
        e.id === id ? { ...e, [field]: value } : e
      ),
      lastUpdatedAt: Date.now(),
      lastUpdatedBy: 'lifesync'
    }));
  }, []);

  const handleDeleteEducation = useCallback((id) => {
    setLifeCV(prev => ({
      ...prev,
      education: prev.education.filter(e => e.id !== id),
      lastUpdatedAt: Date.now(),
      lastUpdatedBy: 'lifesync'
    }));
  }, []);

  // Add experience
  const handleAddExperience = useCallback(() => {
    const newExperience = {
      id: Date.now(),
      company: 'Flamea',
      jobTitle: 'Founder & Advocate',
      startDate: 'Jan 2023',
      endDate: 'Present',
      isCurrent: true,
      description: 'Founded Flamea, a father-driven advocacy movement to challenge and dismantle systemic biases in South Africa\'s family law system.',
      skills: ['Leadership', 'Advocacy', 'Strategic Planning']
    };
    setLifeCV(prev => ({
      ...prev,
      experience: [...(prev.experience || []), newExperience],
      lastUpdatedAt: Date.now(),
      lastUpdatedBy: 'lifesync'
    }));
  }, []);

  const handleUpdateExperience = useCallback((id, field, value) => {
    setLifeCV(prev => ({
      ...prev,
      experience: prev.experience.map(e => 
        e.id === id ? { ...e, [field]: value } : e
      ),
      lastUpdatedAt: Date.now(),
      lastUpdatedBy: 'lifesync'
    }));
  }, []);

  const handleDeleteExperience = useCallback((id) => {
    setLifeCV(prev => ({
      ...prev,
      experience: prev.experience.filter(e => e.id !== id),
      lastUpdatedAt: Date.now(),
      lastUpdatedBy: 'lifesync'
    }));
  }, []);

  // Add certification
  const handleAddCertification = useCallback(() => {
    const newCert = {
      id: Date.now(),
      name: 'Google Cybersecurity Professional Certificate',
      issuer: 'Google',
      issueDate: '2024',
      expiryDate: 'N/A',
      credentialUrl: ''
    };
    setLifeCV(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), newCert],
      lastUpdatedAt: Date.now(),
      lastUpdatedBy: 'lifesync'
    }));
  }, []);

  const handleUpdateCertification = useCallback((id, field, value) => {
    setLifeCV(prev => ({
      ...prev,
      certifications: prev.certifications.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      ),
      lastUpdatedAt: Date.now(),
      lastUpdatedBy: 'lifesync'
    }));
  }, []);

  const handleDeleteCertification = useCallback((id) => {
    setLifeCV(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c.id !== id),
      lastUpdatedAt: Date.now(),
      lastUpdatedBy: 'lifesync'
    }));
  }, []);

  // Export as JSON
  const handleExportJSON = useCallback(() => {
    const dataStr = JSON.stringify(lifeCV, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifecv-${lifeCV.fullName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [lifeCV]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading LifeCV...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={getPageContainerClasses({ bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800' })}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={getPageTitleClasses()}>LifeCV</h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            Professional Record - Synced Across Ecosystem
          </p>
        </div>

        {/* Sync Status Alert */}
        {syncStatus !== 'idle' && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            syncStatus === 'syncing' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
            syncStatus === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {syncStatus === 'syncing' && <RefreshCw className="w-5 h-5 animate-spin" />}
            {syncStatus === 'success' && <Check className="w-5 h-5" />}
            {syncStatus === 'error' && <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{syncMessage}</span>
          </div>
        )}

        {/* App Updates Alert */}
        {appUpdates.length > 0 && (
          <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Updates from Other Apps
            </h3>
            {appUpdates.map((update, idx) => (
              <p key={idx} className="text-sm text-indigo-700">
                • <strong>{update.app}</strong> - {update.fields} · {new Date(update.timestamp).toLocaleString()}
              </p>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={syncToFirebase}
              disabled={syncing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
              aria-label="Sync to cloud"
            >
              <Cloud className="w-5 h-5 mr-2" />
              {syncing ? 'Syncing...' : 'Sync to Cloud'}
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              aria-label="Export as JSON"
            >
              <FileDown className="w-5 h-5 mr-2" />
              Export
            </button>
          </div>
          {lastSyncTime && (
            <p className="text-sm text-gray-500">
              Last synced: {new Date(lastSyncTime).toLocaleString()}
            </p>
          )}
        </div>

        {/* Personal Information Card */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{lifeCV.fullName}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm text-gray-600">
            <div>📧 {lifeCV.email}</div>
            <div>📱 {lifeCV.phone}</div>
            <div>📍 {lifeCV.location}</div>
          </div>

          {/* Synced Apps Status */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Synced Across:</p>
            <div className="flex flex-wrap gap-2">
              {lifeCV.syncedApps?.map(app => (
                <span key={app} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {app}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 bg-white rounded-t-lg shadow border-b border-gray-200 overflow-hidden">
          <div className="flex flex-wrap">
            {['overview', 'education', 'experience', 'certifications', 'skills'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-max px-6 py-4 font-medium border-b-2 transition ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
                aria-selected={activeTab === tab}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow p-6 space-y-4">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Professional Profile</label>
                <textarea
                  value={lifeCV.personalProfile}
                  onChange={(e) => setLifeCV(prev => ({
                    ...prev,
                    personalProfile: e.target.value,
                    lastUpdatedAt: Date.now(),
                    lastUpdatedBy: 'lifesync'
                  }))}
                  placeholder="Write your professional profile..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Career Vision</label>
                <textarea
                  value={lifeCV.careerVision}
                  onChange={(e) => setLifeCV(prev => ({
                    ...prev,
                    careerVision: e.target.value,
                    lastUpdatedAt: Date.now(),
                    lastUpdatedBy: 'lifesync'
                  }))}
                  placeholder="Describe your career vision..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Work Style</label>
                <textarea
                  value={lifeCV.workStyle}
                  onChange={(e) => setLifeCV(prev => ({
                    ...prev,
                    workStyle: e.target.value,
                    lastUpdatedAt: Date.now(),
                    lastUpdatedBy: 'lifesync'
                  }))}
                  placeholder="Describe your work style..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mission Statement</label>
                <textarea
                  value={lifeCV.missionStatement}
                  onChange={(e) => setLifeCV(prev => ({
                    ...prev,
                    missionStatement: e.target.value,
                    lastUpdatedAt: Date.now(),
                    lastUpdatedBy: 'lifesync'
                  }))}
                  placeholder="Your personal mission statement..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Education Tab */}
          {activeTab === 'education' && (
            <div className="space-y-4">
              {lifeCV.education?.map(edu => (
                <div key={edu.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{edu.school}</h3>
                      <p className="text-gray-700">{edu.degree} in {edu.field}</p>
                      <p className="text-sm text-gray-500">Graduated: {edu.graduationDate}</p>
                      {edu.description && <p className="mt-2 text-gray-600">{edu.description}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteEducation(edu.id)}
                      className="text-red-600 hover:text-red-800 transition"
                      aria-label="Delete education"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={handleAddEducation}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Education
              </button>
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              {lifeCV.experience?.map(exp => (
                <div key={exp.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{exp.jobTitle}</h3>
                      <p className="text-gray-700">{exp.company}</p>
                      <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate || 'Present'}</p>
                      {exp.description && <p className="mt-2 text-gray-600">{exp.description}</p>}
                      {exp.skills?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {exp.skills.map(skill => (
                            <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="text-red-600 hover:text-red-800 transition"
                      aria-label="Delete experience"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={handleAddExperience}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Experience
              </button>
            </div>
          )}

          {/* Certifications Tab */}
          {activeTab === 'certifications' && (
            <div className="space-y-4">
              {lifeCV.certifications?.map(cert => (
                <div key={cert.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{cert.name}</h3>
                      <p className="text-gray-700">{cert.issuer}</p>
                      <p className="text-sm text-gray-500">Issued: {cert.issueDate} {cert.expiryDate !== 'N/A' && `• Expires: ${cert.expiryDate}`}</p>
                      {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                          View Credential <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteCertification(cert.id)}
                      className="text-red-600 hover:text-red-800 transition"
                      aria-label="Delete certification"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={handleAddCertification}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Certification
              </button>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Core Skills</label>
                <div className="flex flex-wrap gap-2">
                  {['Risk Management', 'OHS', 'Auditing', 'Leadership', 'Communication', 'Python', 'SQL'].map(skill => (
                    <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-blue-600">{lifeCV.education?.length || 0}</div>
            <div className="text-sm text-gray-600">Education</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-green-600">{lifeCV.experience?.length || 0}</div>
            <div className="text-sm text-gray-600">Experience</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-purple-600">{lifeCV.certifications?.length || 0}</div>
            <div className="text-sm text-gray-600">Certifications</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-indigo-600">{lifeCV.syncedApps?.length || 1}</div>
            <div className="text-sm text-gray-600">Synced Apps</div>
          </div>
        </div>
    </div>
  );
};

export default LifeCV;
