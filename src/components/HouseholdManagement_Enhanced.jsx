import { useState } from 'react';
import {
  Home,
  Users,
  UserPlus,
  Crown,
  MessageSquare,
  Phone,
  Video,
  Wifi,
  Bluetooth,
  Settings,
  Vote,
  ThumbsUp,
  ThumbsDown,
  Shield,
  AlertTriangle,
  MapPin,
  Send,
  Mic,
  Camera,
  Plus,
  Signal,
  RotateCcw,
  Hash,
  Zap,
  Droplets,
  Building,
  
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HouseholdManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [showCreateHousehold, setShowCreateHousehold] = useState(false);
  const [showJoinCommunity, setShowJoinCommunity] = useState(false);
  const [emergencyCode, setEmergencyCode] = useState('SUNSET-2025');
  const [lastCodeUpdate, setLastCodeUpdate] = useState('2025-01-15');
  const { t } = useTranslation();

  // Household data with comprehensive structure
  const [household, setHousehold] = useState({
    id: 1,
    name: 'Doe Family Home',
    address: '123 Main Street, Johannesburg, GP',
    gpsCoordinates: { lat: -26.2041, lng: 28.0473 },
    administrator: 'John Doe',
    createdDate: '2024-12-01',
    households: [ // Multiple families in one property
      {
        id: 1,
        name: 'Main House - Doe Family',
        type: 'main',
        members: [
          {
            id: 1,
            name: 'John Doe',
            role: 'Administrator',
            status: 'online',
            lastSeen: '2 min ago',
            permissions: ['manage_members', 'emergency_alert', 'settings', 'invite_community'],
            phone: '+27123456789',
            emergencyContact: true
          },
          {
            id: 2,
            name: 'Jane Doe',
            role: 'Member',
            status: 'online',
            lastSeen: '1 min ago',
            permissions: ['emergency_alert', 'communication', 'service_status'],
            phone: '+27123456788',
            emergencyContact: true
          }
        ]
      },
      {
        id: 2,
        name: 'Cottage A - Smith Family',
        type: 'cottage',
        members: [
          {
            id: 3,
            name: 'Bob Smith',
            role: 'Tenant',
            status: 'offline',
            lastSeen: '1 hour ago',
            permissions: ['communication', 'service_status'],
            phone: '+27123456787',
            emergencyContact: false
          }
        ]
      },
      {
        id: 3,
        name: 'Cottage B - Available',
        type: 'cottage',
        members: []
      }
    ],
    communication: {
      wifiNetwork: 'DoeFamily_WiFi',
      bluetoothEnabled: true,
      emergencyCode: emergencyCode,
      lastCodeUpdate: lastCodeUpdate,
      channels: [
        { id: 'wifi', name: 'WiFi Network', status: 'active', strength: 5 },
        { id: 'bluetooth', name: 'Bluetooth Mesh', status: 'active', strength: 4 },
        { id: 'cellular', name: 'Cellular Backup', status: 'standby', strength: 3 }
      ]
    }
  });

  // Community/Street management
  const [community, setCommunity] = useState({
    id: 1,
    name: 'Maple Street Community',
    type: 'street',
    established: '2024-11-15',
    governance: {
      votingThreshold: 60, // 60% majority required
      proposalCooldown: 7, // days between proposals
      emergencyThreshold: 80, // 80% for emergency actions
    },
    households: [
      {
        id: 1,
        address: '123 Main Street',
        name: 'Doe Family Home',
        administrator: 'John Doe',
        joinedDate: '2024-11-15',
        status: 'active',
        members: 4
      },
      {
        id: 2,
        address: '125 Main Street',
        name: 'Johnson Residence',
        administrator: 'Mary Johnson',
        joinedDate: '2024-11-16',
        status: 'active',
        members: 3
      },
      {
        id: 3,
        address: '127 Main Street',
        name: 'Williams Home',
        administrator: 'David Williams',
        joinedDate: '2024-11-20',
        status: 'pending_approval',
        members: 2
      }
    ],
    serviceProviders: [
      { id: 'municipality', name: 'City of Johannesburg', type: 'municipality', contact: '011-407-7000', status: 'active' },
      { id: 'eskom', name: 'Eskom', type: 'electricity', contact: '086-003-7566', status: 'active' },
      { id: 'citypower', name: 'City Power', type: 'electricity', contact: '011-490-7911', status: 'active' },
      { id: 'joburg_water', name: 'Johannesburg Water', type: 'water', contact: '011-688-1699', status: 'active' },
      { id: 'local_school', name: 'Maple Primary School', type: 'education', contact: '011-123-4567', status: 'active' },
      { id: 'security', name: 'ADT Security', type: 'security', contact: '086-123-4567', status: 'active' }
    ]
  });

  // Service status tracking
  const [serviceStatus, setServiceStatus] = useState({
    electricity: { status: 'online', reportedBy: [], lastUpdate: new Date(), confidence: 100 },
    water: { status: 'online', reportedBy: [], lastUpdate: new Date(), confidence: 100 },
    internet: { status: 'partial', reportedBy: ['John Doe'], lastUpdate: new Date(), confidence: 75 },
    security: { status: 'online', reportedBy: [], lastUpdate: new Date(), confidence: 100 },
    streetLights: { status: 'offline', reportedBy: ['John Doe', 'Mary Johnson'], lastUpdate: new Date(), confidence: 85 }
  });

  // Active proposals and voting
  const [proposals, setProposals] = useState([
    {
      id: 1,
      title: 'Install Speed Bumps on Main Street',
      description: 'Install 3 speed bumps to reduce vehicle speed in our residential area',
      proposedBy: 'Mary Johnson',
      proposedDate: '2024-12-01',
      type: 'infrastructure',
      status: 'voting',
      votingDeadline: '2024-12-08',
      votes: {
        yes: 8,
        no: 2,
        abstain: 1
      },
      totalEligible: 15,
      threshold: 60
    },
    {
      id: 2,
      title: 'Community Garden Project',
      description: 'Create a shared vegetable garden in the vacant lot at the end of the street',
      proposedBy: 'David Williams',
      proposedDate: '2024-12-03',
      type: 'community',
      status: 'voting',
      votingDeadline: '2024-12-10',
      votes: {
        yes: 5,
        no: 1,
        abstain: 3
      },
      totalEligible: 15,
      threshold: 60
    }
  ]);

  // Communication and messaging
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'John Doe',
      message: 'Street lights are out again on the north side of Main Street',
      timestamp: new Date('2024-12-04T08:30:00'),
      type: 'service_alert',
      channel: 'household'
    },
    {
      id: 2,
      sender: 'Mary Johnson',
      message: 'Community meeting this Saturday at 10 AM - Community Center',
      timestamp: new Date('2024-12-04T14:15:00'),
      type: 'announcement',
      channel: 'community'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [messageChannel, setMessageChannel] = useState('household');
  const [newMember, setNewMember] = useState({ name: '', email: '', phone: '', role: 'Member' });

  // Emergency protocols
  const emergencyProtocols = [
    {
      code: 'SUNSET',
      description: 'All clear - normal situation',
      level: 'normal',
      action: 'Continue normal communication'
    },
    {
      code: 'STORM',
      description: 'Under duress - forced to respond',
      level: 'duress',
      action: 'Silently alert security and neighbors'
    },
    {
      code: 'THUNDER',
      description: 'Immediate danger - cannot speak freely',
      level: 'critical',
      action: 'Immediate dispatch of security and emergency services'
    }
  ];

  // Communication modes for different scenarios
  const communicationModes = [
    { id: 'wifi', name: 'WiFi Network', icon: Wifi, status: 'active', description: 'Local network communication' },
    { id: 'bluetooth', name: 'Bluetooth Mesh', icon: Bluetooth, status: 'active', description: 'Device-to-device connection' },
    { id: 'cellular', name: 'Cellular Backup', icon: Phone, status: 'standby', description: 'Mobile network fallback' },
    { id: 'satellite', name: 'Emergency Satellite', icon: Signal, status: 'available', description: 'Emergency communication' }
  ];

  // Utility functions
  const getAllMembers = () => {
    return household.households.flatMap(h => h.members);
  };

  const getTotalMembers = () => {
    return getAllMembers().length;
  };

  const getOnlineMembers = () => {
    return getAllMembers().filter(m => m.status === 'online');
  };

  const handleAddMember = (householdId) => {
    if (newMember.name && newMember.email && newMember.phone) {
      const member = {
        id: Date.now(),
        name: newMember.name,
        email: newMember.email,
        phone: newMember.phone,
        role: newMember.role,
        status: 'pending',
        lastSeen: 'Just added',
        permissions: newMember.role === 'Administrator' ? ['manage_members', 'emergency_alert', 'settings'] :
                     newMember.role === 'Member' ? ['emergency_alert', 'communication', 'service_status'] :
                     ['communication']
      };

      setHousehold(prev => ({
        ...prev,
        households: prev.households.map(h => 
          h.id === householdId 
            ? { ...h, members: [...h.members, member] }
            : h
        )
      }));

      setNewMember({ name: '', email: '', phone: '', role: 'Member' });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        sender: 'You', // In real app, this would be current user
        message: newMessage,
        timestamp: new Date(),
        type: 'message',
        channel: messageChannel
      };

      setMessages(prev => [message, ...prev]);
      setNewMessage('');
    }
  };

  const updateServiceStatus = (service, status, reporter) => {
    setServiceStatus(prev => ({
      ...prev,
      [service]: {
        status: status,
        reportedBy: status === 'offline' ? [reporter] : [],
        lastUpdate: new Date(),
        confidence: status === 'offline' ? 85 : 100
      }
    }));
  };

  const voteOnProposal = (proposalId, vote) => {
    setProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        return {
          ...p,
          votes: {
            ...p.votes,
            [vote]: p.votes[vote] + 1
          }
        };
      }
      return p;
    }));
  };

  const getServiceStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'offline': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'partial': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getProposalStatusColor = (proposal) => {
    const yesPercentage = (proposal.votes.yes / proposal.totalEligible) * 100;
    if (yesPercentage >= proposal.threshold) {
      return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
    } else if (yesPercentage >= proposal.threshold * 0.7) {
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
    } else {
      return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
    }
  };

  const updateEmergencyCode = () => {
    const words = ['SUNRISE', 'SUNSET', 'OCEAN', 'MOUNTAIN', 'GARDEN', 'BRIDGE', 'RIVER', 'FOREST'];
    const years = ['2025', '2026'];
    const newCode = `${words[Math.floor(Math.random() * words.length)]}-${years[Math.floor(Math.random() * years.length)]}`;
    
    setEmergencyCode(newCode);
    setLastCodeUpdate(new Date().toISOString().split('T')[0]);
    
    // Update household data
    setHousehold(prev => ({
      ...prev,
      communication: {
        ...prev.communication,
        emergencyCode: newCode,
        lastCodeUpdate: new Date().toISOString().split('T')[0]
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Home className="h-12 w-12 text-primary-500" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Household & Community Management</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                  Comprehensive family safety, community governance, and emergency coordination
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateHousehold(true)}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Household
              </button>
              <button
                onClick={() => setShowJoinCommunity(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Users className="h-4 w-4 mr-2" />
                Join Community
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Household Overview', icon: Home },
                { id: 'communication', name: 'Communication', icon: MessageSquare },
                { id: 'community', name: 'Community Governance', icon: Vote },
                { id: 'services', name: 'Service Status', icon: Zap },
                { id: 'emergency', name: 'Emergency Protocols', icon: AlertTriangle },
                { id: 'settings', name: 'Settings', icon: Settings }
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Household Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Household Overview</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{getTotalMembers()} Total Members</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{getOnlineMembers().length} Online</span>
                  </div>
                </div>
              </div>

              {/* Property Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Home className="h-5 w-5 text-primary-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Property Details</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">Address: {household.address}</p>
                    <p className="text-gray-600 dark:text-gray-400">Administrator: {household.administrator}</p>
                    <p className="text-gray-600 dark:text-gray-400">Established: {household.createdDate}</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Users className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Community Status</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">Street: {community.name}</p>
                    <p className="text-gray-600 dark:text-gray-400">Households: {community.households.length}</p>
                    <p className="text-gray-600 dark:text-gray-400">Joined: {community.households[0]?.joinedDate}</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Shield className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Emergency Status</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">Code: {emergencyCode}</p>
                    <p className="text-gray-600 dark:text-gray-400">Updated: {lastCodeUpdate}</p>
                    <button 
                      onClick={updateEmergencyCode}
                      className="text-primary-600 hover:text-primary-700 text-xs"
                    >
                      Rotate Code
                    </button>
                  </div>
                </div>
              </div>

              {/* Households/Units */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Property Units</h3>
                {household.households.map((unit) => (
                  <div key={unit.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          unit.type === 'main' ? 'bg-primary-100 dark:bg-primary-900' : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <Home className={`h-5 w-5 ${
                            unit.type === 'main' ? 'text-primary-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{unit.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {unit.members.length} members
                          </p>
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <UserPlus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Unit Members */}
                    <div className="space-y-2">
                      {unit.members.length > 0 ? (
                        unit.members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900 dark:text-white">{member.name}</span>
                                  {member.role === 'Administrator' && <Crown className="h-4 w-4 text-yellow-500" />}
                                  {member.emergencyContact && <Shield className="h-4 w-4 text-blue-500" />}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {member.role} • {member.lastSeen}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button className="p-1 text-gray-400 hover:text-blue-500 transition-colors">
                                <MessageSquare className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-green-500 transition-colors">
                                <Phone className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-purple-500 transition-colors">
                                <Video className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <Home className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p>Unit available for occupancy</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Communication Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Communication Channels</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {communicationModes.map((mode) => (
                  <div key={mode.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        mode.status === 'active' ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <mode.icon className={`h-5 w-5 ${
                          mode.status === 'active' ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{mode.name}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{mode.description}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      mode.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      mode.status === 'standby' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {mode.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Communication Tab */}
        {activeTab === 'communication' && (
          <div className="space-y-8">
            {/* Message Composer */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Send Message</h2>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <select
                    value={messageChannel}
                    onChange={(e) => setMessageChannel(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="household">Household Only</option>
                    <option value="community">Community Broadcast</option>
                    <option value="emergency">Emergency Alert</option>
                  </select>
                  <div className="flex-1 flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Mic className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <MapPin className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Message History */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Recent Messages</h2>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900 dark:text-white">{msg.sender}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          msg.channel === 'household' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          msg.channel === 'community' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {msg.channel}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Community Governance Tab */}
        {activeTab === 'community' && (
          <div className="space-y-8">
            {/* Community Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Community Governance</h2>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  New Proposal
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Users className="h-5 w-5 text-primary-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Community Info</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">Name: {community.name}</p>
                    <p className="text-gray-600 dark:text-gray-400">Type: {community.type}</p>
                    <p className="text-gray-600 dark:text-gray-400">Established: {community.established}</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Vote className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Voting Rules</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">Threshold: {community.governance.votingThreshold}%</p>
                    <p className="text-gray-600 dark:text-gray-400">Emergency: {community.governance.emergencyThreshold}%</p>
                    <p className="text-gray-600 dark:text-gray-400">Cooldown: {community.governance.proposalCooldown} days</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Home className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Participation</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">Total Households: {community.households.length}</p>
                    <p className="text-gray-600 dark:text-gray-400">Active: {community.households.filter(h => h.status === 'active').length}</p>
                    <p className="text-gray-600 dark:text-gray-400">Pending: {community.households.filter(h => h.status === 'pending_approval').length}</p>
                  </div>
                </div>
              </div>

              {/* Households in Community */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Community Households</h3>
                <div className="space-y-3">
                  {community.households.map((house) => (
                    <div key={house.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          house.status === 'active' ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'
                        }`}>
                          <Home className={`h-5 w-5 ${
                            house.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{house.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {house.address} • Admin: {house.administrator}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{house.members} members</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          house.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {house.status}
                        </span>
                        {house.status === 'pending_approval' && (
                          <div className="flex space-x-1">
                            <button className="p-1 text-green-600 hover:text-green-700">
                              <ThumbsUp className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-red-600 hover:text-red-700">
                              <ThumbsDown className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Proposals */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Active Proposals</h2>
              <div className="space-y-6">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{proposal.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{proposal.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>By: {proposal.proposedBy}</span>
                          <span>•</span>
                          <span>Proposed: {proposal.proposedDate}</span>
                          <span>•</span>
                          <span>Deadline: {proposal.votingDeadline}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getProposalStatusColor(proposal)}`}>
                        {Math.round((proposal.votes.yes / proposal.totalEligible) * 100)}% Support
                      </span>
                    </div>

                    {/* Voting Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Progress ({proposal.votes.yes + proposal.votes.no + proposal.votes.abstain}/{proposal.totalEligible} voted)</span>
                        <span>Requires {proposal.threshold}% to pass</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${(proposal.votes.yes / proposal.totalEligible) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Vote Counts */}
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Yes: {proposal.votes.yes}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">No: {proposal.votes.no}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Abstain: {proposal.votes.abstain}</span>
                        </div>
                      </div>

                      {/* Voting Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => voteOnProposal(proposal.id, 'yes')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          Vote Yes
                        </button>
                        <button
                          onClick={() => voteOnProposal(proposal.id, 'no')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                        >
                          Vote No
                        </button>
                        <button
                          onClick={() => voteOnProposal(proposal.id, 'abstain')}
                          className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                        >
                          Abstain
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Service Status Tab */}
        {activeTab === 'services' && (
          <div className="space-y-8">
            {/* Service Status Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Community Service Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(serviceStatus).map(([service, status]) => (
                  <div key={service} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          service === 'electricity' ? 'bg-yellow-100 dark:bg-yellow-900' :
                          service === 'water' ? 'bg-blue-100 dark:bg-blue-900' :
                          service === 'internet' ? 'bg-purple-100 dark:bg-purple-900' :
                          service === 'security' ? 'bg-red-100 dark:bg-red-900' :
                          'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {service === 'electricity' && <Zap className="h-5 w-5 text-yellow-600" />}
                          {service === 'water' && <Droplets className="h-5 w-5 text-blue-600" />}
                          {service === 'internet' && <Wifi className="h-5 w-5 text-purple-600" />}
                          {service === 'security' && <Shield className="h-5 w-5 text-red-600" />}
                          {service === 'streetLights' && <Building className="h-5 w-5 text-gray-600" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{service}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {status.reportedBy.length > 0 ? `Reported by ${status.reportedBy.length} residents` : 'No issues reported'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getServiceStatusColor(status.status)}`}>
                        {status.status}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Confidence</span>
                        <span>{status.confidence}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            status.confidence >= 80 ? 'bg-green-500' :
                            status.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${status.confidence}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Updated: {status.lastUpdate.toLocaleTimeString()}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => updateServiceStatus(service, 'online', 'You')}
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Working
                        </button>
                        <button
                          onClick={() => updateServiceStatus(service, 'offline', 'You')}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Issue
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Providers */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Service Providers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {community.serviceProviders.map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{provider.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{provider.type}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">{provider.contact}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                        <Phone className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-500 transition-colors">
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Emergency Protocols Tab */}
        {activeTab === 'emergency' && (
          <div className="space-y-8">
            {/* Emergency Codes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Emergency Protocols</h2>
                <button
                  onClick={updateEmergencyCode}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Rotate Code
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {emergencyProtocols.map((protocol) => (
                  <div key={protocol.code} className={`p-4 border-2 rounded-lg ${
                    protocol.level === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                    protocol.level === 'duress' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                    'border-green-500 bg-green-50 dark:bg-green-900/20'
                  }`}>
                    <div className="flex items-center space-x-2 mb-3">
                      <Hash className={`h-5 w-5 ${
                        protocol.level === 'critical' ? 'text-red-600' :
                        protocol.level === 'duress' ? 'text-yellow-600' :
                        'text-green-600'
                      }`} />
                      <h3 className={`font-bold text-lg ${
                        protocol.level === 'critical' ? 'text-red-900 dark:text-red-100' :
                        protocol.level === 'duress' ? 'text-yellow-900 dark:text-yellow-100' :
                        'text-green-900 dark:text-green-100'
                      }`}>
                        {protocol.code}
                      </h3>
                    </div>
                    <p className={`text-sm mb-3 ${
                      protocol.level === 'critical' ? 'text-red-800 dark:text-red-200' :
                      protocol.level === 'duress' ? 'text-yellow-800 dark:text-yellow-200' :
                      'text-green-800 dark:text-green-200'
                    }`}>
                      {protocol.description}
                    </p>
                    <p className={`text-xs ${
                      protocol.level === 'critical' ? 'text-red-700 dark:text-red-300' :
                      protocol.level === 'duress' ? 'text-yellow-700 dark:text-yellow-300' :
                      'text-green-700 dark:text-green-300'
                    }`}>
                      Action: {protocol.action}
                    </p>
                  </div>
                ))}
              </div>

              {/* Current Emergency Code */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">Current Emergency Code</h3>
                    <p className="text-blue-700 dark:text-blue-300 mt-1">
                      Use this code to confirm all-clear status during emergencies
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{emergencyCode}</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      Last updated: {lastCodeUpdate}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Emergency Contacts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getAllMembers().filter(m => m.emergencyContact).map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                        <Shield className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{contact.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{contact.phone}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                        <Phone className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-500 transition-colors">
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HouseholdManagement;
