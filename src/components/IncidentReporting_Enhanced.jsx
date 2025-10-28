import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  MapPin,
  Clock,
  User,
  Users,
  Shield,
  Camera,
  ArrowLeft,
  CheckSquare,
  Search,
  Plus,
  TrendingUp,
  Zap,
  Building,
  Car,
  TreePine,
  Wrench,
  HelpCircle,
  Lock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const IncidentReporting = () => {
  const [activeTab, setActiveTab] = useState('report');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [validationVotes, setValidationVotes] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  useTranslation();

  // Comprehensive incident report form
  const [reportForm, setReportForm] = useState({
    type: '',
    severity: 'Medium',
    title: '',
    description: '',
    location: '',
    gpsCoordinates: null,
    witnesses: [],
    evidence: [],
    anonymous: false,
    emergency: false,
    publicReport: false,
    contactInfo: {
      name: '',
      phone: '',
      email: ''
    },
    followUpRequired: false,
    officialReport: false
  });

  // Enhanced incident types with icons and descriptions
  const incidentTypes = [
    { id: 'security', name: 'Security Concern', icon: Shield, description: 'Suspicious activity, crime, safety threats' },
    { id: 'medical', name: 'Medical Emergency', icon: AlertTriangle, description: 'Health emergencies, accidents requiring medical attention' },
    { id: 'infrastructure', name: 'Infrastructure Issue', icon: Building, description: 'Roads, bridges, public facilities damage' },
    { id: 'environmental', name: 'Environmental Hazard', icon: TreePine, description: 'Pollution, hazardous materials, environmental damage' },
    { id: 'utilities', name: 'Utility Failure', icon: Zap, description: 'Power, water, gas, telecommunications outages' },
    { id: 'transport', name: 'Transport Incident', icon: Car, description: 'Traffic accidents, road hazards, vehicle issues' },
    { id: 'community', name: 'Community Issue', icon: Users, description: 'Disputes, noise complaints, community concerns' },
    { id: 'property', name: 'Property Crime', icon: Lock, description: 'Theft, vandalism, property damage' },
    { id: 'public_safety', name: 'Public Safety', icon: Eye, description: 'General safety concerns, hazards to public' },
    { id: 'maintenance', name: 'Maintenance Required', icon: Wrench, description: 'Repair needs, maintenance issues' },
    { id: 'other', name: 'Other', icon: HelpCircle, description: 'Issues not covered by other categories' }
  ];

  const severityLevels = [
    { 
      level: 'Low', 
      description: 'Minor issue, no immediate threat', 
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      priority: 1,
      response: '3-7 days'
    },
    { 
      level: 'Medium', 
      description: 'Moderate concern, monitor situation', 
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      priority: 2,
      response: '24-48 hours'
    },
    { 
      level: 'High', 
      description: 'Serious issue, requires attention', 
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      priority: 3,
      response: '2-6 hours'
    },
    { 
      level: 'Critical', 
      description: 'Immediate threat, emergency response needed', 
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      priority: 4,
      response: 'Immediate'
    }
  ];

  // Mock data for incidents with comprehensive fields
  const [incidents, setIncidents] = useState([
    {
      id: 1,
      referenceNumber: 'INC-2025-001',
      type: 'security',
      title: 'Suspicious Activity Near School',
      description: 'Unknown individual observed taking photos of children near the school entrance. Individual left when approached by security.',
      reportedBy: 'Jane Smith',
      reporterRole: 'Parent',
      timestamp: '2025-01-15T16:30:00Z',
      severity: 'High',
      location: 'Oakridge Primary School, Main Entrance',
      gpsCoordinates: { lat: -26.2041, lng: 28.0473 },
      status: 'Under Investigation',
      validationStatus: 'Validated',
      validationRequired: 3,
      currentValidations: 3,
      validators: [
        { name: 'Mike Johnson', role: 'Community Security Officer', vote: 'valid', timestamp: '2025-01-15T16:35:00Z', confidence: 95 },
        { name: 'Sarah Davis', role: 'Parent Representative', vote: 'valid', timestamp: '2025-01-15T16:40:00Z', confidence: 90 },
        { name: 'Officer Williams', role: 'SAPS Community Officer', vote: 'valid', timestamp: '2025-01-15T17:00:00Z', confidence: 98 }
      ],
      witnesses: [
        { name: 'John Doe', contact: '+27123456789', statement: 'Witnessed taking photos, left quickly' },
        { name: 'Mary Johnson', contact: '+27987654321', statement: 'Confirmed suspicious behavior' }
      ],
      evidence: [
        { type: 'photo', name: 'suspicious_individual.jpg', size: '2.3MB', uploadedBy: 'Jane Smith' },
        { type: 'video', name: 'security_footage.mp4', size: '45MB', uploadedBy: 'School Security' },
        { type: 'document', name: 'witness_statement.pdf', size: '0.8MB', uploadedBy: 'Mike Johnson' }
      ],
      priority: 'High',
      escalationLevel: 2,
      assignedTo: 'SAPS Sector 7',
      expectedResolution: '2025-01-17T16:30:00Z',
      publicReport: false,
      anonymous: false,
      fraudScore: 5, // Low fraud risk
      communityImpact: 'High',
      tags: ['school-safety', 'suspicious-activity', 'photography'],
      relatedIncidents: [],
      updates: [
        { timestamp: '2025-01-15T17:30:00Z', updatedBy: 'Officer Williams', note: 'Case assigned to detective unit', status: 'Under Investigation' },
        { timestamp: '2025-01-15T16:50:00Z', updatedBy: 'Mike Johnson', note: 'Additional witnesses identified', status: 'Investigating' }
      ]
    },
    {
      id: 2,
      referenceNumber: 'INC-2025-002',
      type: 'infrastructure',
      title: 'Broken Street Light - Main Street',
      description: 'Street light pole has been damaged, creating safety hazard for pedestrians and drivers. Light is completely non-functional.',
      reportedBy: 'Community Safety Team',
      reporterRole: 'Official',
      timestamp: '2025-01-14T20:15:00Z',
      severity: 'Medium',
      location: 'Main Street, between Oak and Maple',
      gpsCoordinates: { lat: -26.2055, lng: 28.0485 },
      status: 'Assigned',
      validationStatus: 'Validated',
      validationRequired: 2,
      currentValidations: 4,
      validators: [
        { name: 'City Maintenance', role: 'Municipal Officer', vote: 'valid', timestamp: '2025-01-14T21:00:00Z', confidence: 100 },
        { name: 'David Wilson', role: 'Ward Councilor', vote: 'valid', timestamp: '2025-01-14T21:15:00Z', confidence: 95 }
      ],
      witnesses: [],
      evidence: [
        { type: 'photo', name: 'broken_streetlight.jpg', size: '1.8MB', uploadedBy: 'Community Safety Team' }
      ],
      priority: 'Medium',
      escalationLevel: 1,
      assignedTo: 'City Power Maintenance',
      expectedResolution: '2025-01-16T16:00:00Z',
      publicReport: true,
      anonymous: false,
      fraudScore: 2,
      communityImpact: 'Medium',
      tags: ['infrastructure', 'street-lighting', 'safety-hazard'],
      relatedIncidents: ['INC-2025-003'],
      updates: [
        { timestamp: '2025-01-15T09:00:00Z', updatedBy: 'City Power', note: 'Work order created, scheduled for repair', status: 'Assigned' }
      ]
    },
    {
      id: 3,
      referenceNumber: 'INC-2025-003',
      type: 'utilities',
      title: 'Power Outage - Residential Block',
      description: 'Complete power failure affecting entire residential block. Multiple households without electricity for over 6 hours.',
      reportedBy: 'Multiple Residents',
      reporterRole: 'Community',
      timestamp: '2025-01-13T14:30:00Z',
      severity: 'High',
      location: 'Residential Block 7A, Maple Street Area',
      gpsCoordinates: { lat: -26.2068, lng: 28.0502 },
      status: 'Resolved',
      validationStatus: 'Validated',
      validationRequired: 2,
      currentValidations: 8,
      validators: [
        { name: 'Eskom Technical', role: 'Utility Provider', vote: 'valid', timestamp: '2025-01-13T15:00:00Z', confidence: 100 },
        { name: 'Community Leader', role: 'Area Representative', vote: 'valid', timestamp: '2025-01-13T15:30:00Z', confidence: 100 }
      ],
      witnesses: [],
      evidence: [
        { type: 'photo', name: 'transformer_damage.jpg', size: '2.1MB', uploadedBy: 'Eskom Technical' },
        { type: 'document', name: 'outage_report.pdf', size: '1.2MB', uploadedBy: 'Eskom Operations' }
      ],
      priority: 'High',
      escalationLevel: 3,
      assignedTo: 'Eskom Emergency Response',
      expectedResolution: '2025-01-13T22:00:00Z',
      actualResolution: '2025-01-13T21:45:00Z',
      publicReport: true,
      anonymous: false,
      fraudScore: 1,
      communityImpact: 'High',
      tags: ['power-outage', 'utilities', 'transformer-fault'],
      relatedIncidents: ['INC-2025-002'],
      updates: [
        { timestamp: '2025-01-13T21:45:00Z', updatedBy: 'Eskom Technical', note: 'Power restored, transformer replaced', status: 'Resolved' },
        { timestamp: '2025-01-13T18:30:00Z', updatedBy: 'Eskom Operations', note: 'Emergency crew on site, estimated 3 hours to repair', status: 'In Progress' }
      ]
    }
  ]);

  // Validation and voting system
  const handleValidationVote = (incidentId, vote, validatorInfo) => {
    setIncidents(prev => prev.map(incident => {
      if (incident.id === incidentId) {
        const newValidator = {
          name: validatorInfo.name || 'Current User',
          role: validatorInfo.role || 'Community Member',
          vote: vote,
          timestamp: new Date().toISOString(),
          confidence: validatorInfo.confidence || 85
        };

        const updatedValidators = [...incident.validators, newValidator];
        const currentValidations = updatedValidators.filter(v => v.vote === 'valid').length;
        
        let newStatus = incident.status;
        let newValidationStatus = incident.validationStatus;
        
        if (currentValidations >= incident.validationRequired) {
          newValidationStatus = 'Validated';
          if (incident.severity === 'Critical' || incident.severity === 'High') {
            newStatus = 'Escalated';
          } else {
            newStatus = 'Assigned';
          }
        }

        return {
          ...incident,
          validators: updatedValidators,
          currentValidations: currentValidations,
          status: newStatus,
          validationStatus: newValidationStatus
        };
      }
      return incident;
    }));

    setValidationVotes(prev => ({
      ...prev,
      [incidentId]: vote
    }));
  };

  // Form handling
  const handleFormChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setReportForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setReportForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmitReport = () => {
    // Validate required fields
    if (!reportForm.type || !reportForm.title || !reportForm.description) {
      alert('Please fill in all required fields');
      return;
    }

    const newIncident = {
      id: incidents.length + 1,
      referenceNumber: `INC-2025-${String(incidents.length + 1).padStart(3, '0')}`,
      type: reportForm.type,
      title: reportForm.title,
      description: reportForm.description,
      reportedBy: reportForm.anonymous ? 'Anonymous' : (reportForm.contactInfo.name || 'Current User'),
      reporterRole: 'Community Member',
      timestamp: new Date().toISOString(),
      severity: reportForm.severity,
      location: reportForm.location,
      gpsCoordinates: reportForm.gpsCoordinates,
      status: 'Pending Validation',
      validationStatus: 'Pending',
      validationRequired: reportForm.severity === 'Critical' ? 3 : 2,
      currentValidations: 0,
      validators: [],
      witnesses: reportForm.witnesses,
      evidence: reportForm.evidence,
      priority: reportForm.severity,
      escalationLevel: 0,
      assignedTo: null,
      expectedResolution: null,
      publicReport: reportForm.publicReport,
      anonymous: reportForm.anonymous,
      fraudScore: 15, // New reports start with moderate fraud score
      communityImpact: reportForm.severity === 'Critical' ? 'High' : 'Medium',
      tags: [],
      relatedIncidents: [],
      updates: []
    };

    setIncidents(prev => [newIncident, ...prev]);
    
    // Reset form
    setReportForm({
      type: '',
      severity: 'Medium',
      title: '',
      description: '',
      location: '',
      gpsCoordinates: null,
      witnesses: [],
      evidence: [],
      anonymous: false,
      emergency: false,
      publicReport: false,
      contactInfo: {
        name: '',
        phone: '',
        email: ''
      },
      followUpRequired: false,
      officialReport: false
    });

    setActiveTab('incidents');
  };

  // Get location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setReportForm(prev => ({
            ...prev,
            gpsCoordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
            }
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Filter and search functions
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || incident.status.toLowerCase().includes(filterStatus.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'under investigation': 
      case 'investigating':
      case 'in progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'assigned': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'escalated': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending validation': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSeverityColor = (severity) => {
    const severityConfig = severityLevels.find(s => s.level === severity);
    return severityConfig ? severityConfig.color : 'bg-gray-100 text-gray-800';
  };

  const getFraudRiskColor = (score) => {
    if (score <= 10) return 'text-green-600';
    if (score <= 25) return 'text-yellow-600';
    if (score <= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FileText className="h-12 w-12 text-primary-500" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Incident Reporting & Validation</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                  Community-driven incident tracking with multi-party validation and authority escalation
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/emergency-reporting"
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergency Report
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'report', name: 'Report Incident', icon: Plus },
                { id: 'incidents', name: 'All Incidents', icon: FileText },
                { id: 'validation', name: 'Pending Validation', icon: CheckSquare },
                { id: 'analytics', name: 'Analytics', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Report Incident Tab */}
        {activeTab === 'report' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Report New Incident</h2>
              
              {/* Incident Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Incident Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {incidentTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleFormChange('type', type.id)}
                      className={`p-4 border-2 rounded-lg transition-all text-left ${
                        reportForm.type === type.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <type.icon className={`h-5 w-5 ${
                          reportForm.type === type.id ? 'text-primary-600' : 'text-gray-600'
                        }`} />
                        <span className="font-medium text-gray-900 dark:text-white">{type.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity Level */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Severity Level *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {severityLevels.map((severity) => (
                    <button
                      key={severity.level}
                      onClick={() => handleFormChange('severity', severity.level)}
                      className={`p-4 border-2 rounded-lg transition-all text-left ${
                        reportForm.severity === severity.level
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className={`inline-block px-2 py-1 rounded text-sm font-medium mb-2 ${severity.color}`}>
                        {severity.level}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{severity.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Response: {severity.response}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Incident Title *
                  </label>
                  <input
                    type="text"
                    value={reportForm.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    placeholder="Brief, descriptive title of the incident"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={reportForm.location}
                    onChange={(e) => handleFormChange('location', e.target.value)}
                    placeholder="Specific location where incident occurred"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Provide detailed information about what happened, when it occurred, and any relevant circumstances..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Contact Information (if not anonymous) */}
              {!reportForm.anonymous && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={reportForm.contactInfo.name}
                        onChange={(e) => handleFormChange('contactInfo.name', e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={reportForm.contactInfo.phone}
                        onChange={(e) => handleFormChange('contactInfo.phone', e.target.value)}
                        placeholder="+27 xxx xxx xxxx"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={reportForm.contactInfo.email}
                        onChange={(e) => handleFormChange('contactInfo.email', e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Report Options</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportForm.anonymous}
                      onChange={(e) => handleFormChange('anonymous', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Submit anonymously (your identity will be protected)
                    </span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportForm.publicReport}
                      onChange={(e) => handleFormChange('publicReport', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Make this report public (visible to community members)
                    </span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportForm.emergency}
                      onChange={(e) => handleFormChange('emergency', e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      This is an emergency requiring immediate attention
                    </span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportForm.followUpRequired}
                      onChange={(e) => handleFormChange('followUpRequired', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      I would like to receive updates on this incident
                    </span>
                  </label>
                </div>
              </div>

              {/* GPS Information */}
              {reportForm.gpsCoordinates && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">GPS Location Captured</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Coordinates: {reportForm.gpsCoordinates.lat.toFixed(6)}, {reportForm.gpsCoordinates.lng.toFixed(6)}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Accuracy: ±{Math.round(reportForm.gpsCoordinates.accuracy)}m
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setReportForm({
                    type: '',
                    severity: 'Medium',
                    title: '',
                    description: '',
                    location: '',
                    gpsCoordinates: null,
                    witnesses: [],
                    evidence: [],
                    anonymous: false,
                    emergency: false,
                    publicReport: false,
                    contactInfo: { name: '', phone: '', email: '' },
                    followUpRequired: false,
                    officialReport: false
                  })}
                  className="px-6 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Clear Form
                </button>
                <button
                  onClick={handleSubmitReport}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* All Incidents Tab */}
        {activeTab === 'incidents' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search incidents by title, description, or reference number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending Validation</option>
                    <option value="investigating">Under Investigation</option>
                    <option value="assigned">Assigned</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Severity</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Incidents List */}
            <div className="space-y-4">
              {filteredIncidents.map((incident) => (
                <div key={incident.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{incident.title}</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">#{incident.referenceNumber}</span>
                        {incident.anonymous && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded dark:bg-gray-700 dark:text-gray-400">
                            Anonymous
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{incident.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{incident.reportedBy}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{incident.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(incident.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(incident.status)}`}>
                          {incident.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      </div>
                      {incident.fraudScore > 0 && (
                        <div className="text-xs text-right">
                          <span className="text-gray-500 dark:text-gray-400">Fraud Risk: </span>
                          <span className={getFraudRiskColor(incident.fraudScore)}>
                            {incident.fraudScore <= 10 ? 'Low' : 
                             incident.fraudScore <= 25 ? 'Medium' : 
                             incident.fraudScore <= 50 ? 'High' : 'Very High'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Validation Status */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Validation: {incident.currentValidations}/{incident.validationRequired}
                            {incident.validationStatus === 'Validated' && (
                              <CheckCircle className="inline h-4 w-4 ml-1 text-green-600" />
                            )}
                          </span>
                        </div>
                        
                        {incident.evidence.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <Camera className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {incident.evidence.length} evidence file(s)
                            </span>
                          </div>
                        )}

                        {incident.witnesses.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {incident.witnesses.length} witness(es)
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        {incident.validationStatus !== 'Validated' && !validationVotes[incident.id] && (
                          <>
                            <button
                              onClick={() => handleValidationVote(incident.id, 'valid', { name: 'Current User', role: 'Community Member', confidence: 85 })}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                            >
                              Validate
                            </button>
                            <button
                              onClick={() => handleValidationVote(incident.id, 'invalid', { name: 'Current User', role: 'Community Member', confidence: 85 })}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                            >
                              Dispute
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => setSelectedIncident(incident)}
                          className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validation Tab */}
        {activeTab === 'validation' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Pending Validation</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Help validate incident reports by reviewing the details and confirming their authenticity. 
                Multiple community members must validate reports before they can be escalated to authorities.
              </p>

              <div className="space-y-4">
                {incidents.filter(i => i.validationStatus !== 'Validated').map((incident) => (
                  <div key={incident.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{incident.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{incident.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>Reported by: {incident.reportedBy}</span>
                          <span>•</span>
                          <span>{new Date(incident.timestamp).toLocaleString()}</span>
                          <span>•</span>
                          <span>{incident.location}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </div>

                    {/* Validation Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Validation Progress</span>
                        <span>{incident.currentValidations}/{incident.validationRequired} required</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(incident.currentValidations / incident.validationRequired) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Current Validators */}
                    {incident.validators.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Current Validators:</h4>
                        <div className="space-y-2">
                          {incident.validators.map((validator, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-700 dark:text-gray-300">{validator.name}</span>
                                <span className="text-gray-500 dark:text-gray-400">({validator.role})</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  validator.vote === 'valid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                  {validator.vote}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 text-xs">
                                  {validator.confidence}% confidence
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Validation Actions */}
                    {!validationVotes[incident.id] && (
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleValidationVote(incident.id, 'invalid', { name: 'Current User', role: 'Community Member', confidence: 85 })}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Mark as Invalid
                        </button>
                        <button
                          onClick={() => handleValidationVote(incident.id, 'valid', { name: 'Current User', role: 'Community Member', confidence: 85 })}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Validate Incident
                        </button>
                      </div>
                    )}

                    {validationVotes[incident.id] && (
                      <div className="text-center py-3 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-5 w-5 inline mr-2" />
                        Thank you for your validation
                      </div>
                    )}
                  </div>
                ))}

                {incidents.filter(i => i.validationStatus !== 'Validated').length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No incidents pending validation</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Total Reports</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{incidents.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Resolved</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {incidents.filter(i => i.status === 'Resolved').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Pending</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {incidents.filter(i => i.validationStatus !== 'Validated').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">High Priority</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {incidents.filter(i => i.severity === 'High' || i.severity === 'Critical').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {incidents.slice(0, 5).map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{incident.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {incident.reportedBy} • {new Date(incident.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(incident.status)}`}>
                      {incident.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Selected Incident Modal (simplified for brevity) */}
        {selectedIncident && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Incident Details</h2>
                  <button
                    onClick={() => setSelectedIncident(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                {/* Display detailed incident information here */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{selectedIncident.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedIncident.description}</p>
                  </div>
                  
                  {/* Add more detailed views of evidence, validators, etc. */}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentReporting;
