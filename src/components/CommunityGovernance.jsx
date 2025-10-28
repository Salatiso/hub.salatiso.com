import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Vote,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Shield,
  MapPin,
  Clock,
  User,
  
  MessageSquare,
  Phone,
  Video,
  ArrowLeft,
  Eye,
  Flag,
  FileText,
  Send,
  Mic,
  Camera
} from 'lucide-react';

const CommunityGovernance = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const [voteHistory, setVoteHistory] = useState({});
  const [message, setMessage] = useState('');
  

  const community = {
    id: 1,
    name: 'Sandton Heights Community',
    location: 'Sandton, Johannesburg',
    population: 1247,
    households: 423,
    administrators: [
      { id: 1, name: 'Sarah Johnson', role: 'Community Manager', verified: true },
      { id: 2, name: 'Mike Thompson', role: 'Security Coordinator', verified: true },
      { id: 3, name: 'Lisa Chen', role: 'Emergency Response Lead', verified: true }
    ],
    activeIncidents: [
      {
        id: 1,
        type: 'Security',
        title: 'Suspicious Activity on Oak Street',
        description: 'Multiple reports of unknown individuals loitering near residential properties',
        reportedBy: 'John Smith',
        timestamp: '2025-01-15T14:30:00Z',
        severity: 'Medium',
        status: 'Under Investigation',
        votes: { yes: 23, no: 5, abstain: 12 },
        witnesses: 8,
        location: 'Oak Street, between Elm and Pine',
        evidence: ['photo1.jpg', 'video1.mp4']
      },
      {
        id: 2,
        type: 'Infrastructure',
        title: 'Street Light Outage',
        description: 'Street lights not functioning on Maple Avenue from 8 PM onwards',
        reportedBy: 'Community System',
        timestamp: '2025-01-15T13:15:00Z',
        severity: 'Low',
        status: 'Reported to Municipality',
        votes: { yes: 45, no: 2, abstain: 8 },
        witnesses: 15,
        location: 'Maple Avenue, entire block',
        evidence: []
      },
      {
        id: 3,
        type: 'Emergency',
        title: 'Medical Emergency Response',
        description: 'Elderly resident requires immediate medical attention',
        reportedBy: 'Emergency System',
        timestamp: '2025-01-15T12:45:00Z',
        severity: 'High',
        status: 'Resolved',
        votes: { yes: 67, no: 1, abstain: 3 },
        witnesses: 12,
        location: 'Pine Street, House 45',
        evidence: ['medical_report.pdf']
      }
    ],
    activeVotes: [
      {
        id: 1,
        title: 'Install Additional Security Cameras',
        description: 'Proposal to install 5 additional security cameras in high-risk areas',
        proposedBy: 'Security Committee',
        deadline: '2025-01-20T23:59:00Z',
        votes: { yes: 156, no: 34, abstain: 23 },
        totalEligible: 423,
        quorum: 106,
        status: 'Active'
      },
      {
        id: 2,
        title: 'Community Garden Maintenance Budget',
        description: 'Allocate R15,000 for community garden maintenance and improvements',
        proposedBy: 'Recreation Committee',
        deadline: '2025-01-18T23:59:00Z',
        votes: { yes: 89, no: 67, abstain: 45 },
        totalEligible: 423,
        quorum: 106,
        status: 'Active'
      }
    ],
    governanceRules: {
      votingQuorum: '25% of registered households',
      incidentValidation: '3 independent witnesses required',
      emergencyThreshold: 'Immediate action for high-severity incidents',
      fraudPrevention: 'Multi-signature verification required'
    }
  };

  const handleVote = (voteId, voteType) => {
    setVoteHistory(prev => ({
      ...prev,
      [voteId]: voteType
    }));
    // Here you would send the vote to the backend
    console.log(`Voted ${voteType} on proposal ${voteId}`);
  };

  const handleIncidentValidation = (incidentId, validation) => {
    console.log(`Incident ${incidentId} ${validation ? 'validated' : 'rejected'}`);
    // Here you would update the incident status
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending community message:', message);
      setMessage('');
      // Here you would send the message to all community members
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'under investigation': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'reported to municipality': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getVotePercentage = (votes, total) => {
    return Math.round((votes / total) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Users className="h-12 w-12 text-primary-500" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Community Governance</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                Democratic community management and incident response system
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 mb-8">
          <div className="flex space-x-1">
            {['overview', 'incidents', 'voting', 'communication'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-6 rounded-md text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Community Stats */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-primary-500" />
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{community.name}</h2>
                      <p className="text-gray-600 dark:text-gray-400">{community.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Verified Community</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-primary-600">{community.population}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Residents</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{community.households}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Households</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{community.activeIncidents.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Active Incidents</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{community.activeVotes.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Active Votes</div>
                  </div>
                </div>
              </div>

              {/* Governance Rules */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Governance Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Vote className="h-5 w-5 text-primary-500" />
                      <span className="font-medium text-gray-900 dark:text-white">Voting Quorum</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{community.governanceRules.votingQuorum}</p>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Eye className="h-5 w-5 text-primary-500" />
                      <span className="font-medium text-gray-900 dark:text-white">Incident Validation</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{community.governanceRules.incidentValidation}</p>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <span className="font-medium text-gray-900 dark:text-white">Emergency Threshold</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{community.governanceRules.emergencyThreshold}</p>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-5 w-5 text-green-500" />
                      <span className="font-medium text-gray-900 dark:text-white">Fraud Prevention</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{community.governanceRules.fraudPrevention}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Administrators */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Community Administrators</h3>
                <div className="space-y-3">
                  {community.administrators.map((admin) => (
                    <div key={admin.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{admin.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{admin.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{admin.role}</div>
                      </div>
                      {admin.verified && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/emergency-reporting"
                    className="flex items-center space-x-3 p-3 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Report Incident</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Emergency or security issue</div>
                    </div>
                  </Link>

                  <button className="flex items-center space-x-3 p-3 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors w-full text-left">
                    <Vote className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Propose Vote</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Community decision</div>
                    </div>
                  </button>

                  <button className="flex items-center space-x-3 p-3 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors w-full text-left">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Community Message</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Broadcast to all members</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Incidents Tab */}
        {activeTab === 'incidents' && (
          <div className="space-y-8">
            {/* Active Incidents */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Active Incidents</h2>
              <div className="space-y-4">
                {community.activeIncidents.map((incident) => (
                  <div key={incident.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{incident.title}</h3>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                            {incident.severity}
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                            {incident.status}
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{incident.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>Reported by {incident.reportedBy}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(incident.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{incident.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleIncidentValidation(incident.id, true)}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleIncidentValidation(incident.id, false)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Incident Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-lg font-bold text-primary-600">{incident.witnesses}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Witnesses</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{incident.votes.yes}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Supporting Votes</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{incident.evidence.length}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Evidence Files</div>
                      </div>
                    </div>

                    {/* Evidence */}
                    {incident.evidence.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Evidence</h4>
                        <div className="flex flex-wrap gap-2">
                          {incident.evidence.map((file, index) => (
                            <button
                              key={index}
                              className="flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              <FileText className="h-4 w-4" />
                              <span>{file}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Validation Actions */}
                    <div className="flex space-x-3">
                      <button className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                        Add Witness Statement
                      </button>
                      <button className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                        View Details
                      </button>
                      <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Flag className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Report New Incident */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Report New Incident</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option>Incident Type</option>
                    <option>Security Concern</option>
                    <option>Infrastructure Issue</option>
                    <option>Medical Emergency</option>
                    <option>Environmental Hazard</option>
                    <option>Community Dispute</option>
                  </select>
                  <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option>Severity Level</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Incident Title"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <textarea
                  placeholder="Describe the incident in detail..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Location (street address)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <div className="flex space-x-4">
                  <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                    Submit Report
                  </button>
                  <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
                    Emergency Report
                  </button>
                  <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                    Save as Draft
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voting Tab */}
        {activeTab === 'voting' && (
          <div className="space-y-8">
            {/* Active Votes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Active Community Votes</h2>
              <div className="space-y-6">
                {community.activeVotes.map((vote) => (
                  <div key={vote.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{vote.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{vote.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>Proposed by {vote.proposedBy}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Deadline: {new Date(vote.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        vote.status === 'Active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {vote.status}
                      </div>
                    </div>

                    {/* Vote Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Quorum: {vote.quorum} votes needed</span>
                        <span>{vote.votes.yes + vote.votes.no + vote.votes.abstain} / {vote.totalEligible} voted</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${getVotePercentage(vote.votes.yes + vote.votes.no + vote.votes.abstain, vote.totalEligible)}%` }}
                        />
                      </div>
                    </div>

                    {/* Vote Breakdown */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{vote.votes.yes}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Yes ({getVotePercentage(vote.votes.yes, vote.totalEligible)}%)</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{vote.votes.no}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">No ({getVotePercentage(vote.votes.no, vote.totalEligible)}%)</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600">{vote.votes.abstain}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Abstain ({getVotePercentage(vote.votes.abstain, vote.totalEligible)}%)</div>
                      </div>
                    </div>

                    {/* Voting Actions */}
                    {!voteHistory[vote.id] ? (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleVote(vote.id, 'yes')}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>Vote Yes</span>
                        </button>
                        <button
                          onClick={() => handleVote(vote.id, 'no')}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <ThumbsDown className="h-4 w-4" />
                          <span>Vote No</span>
                        </button>
                        <button
                          onClick={() => handleVote(vote.id, 'abstain')}
                          className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Abstain
                        </button>
                      </div>
                    ) : (
                      <div className="text-center p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                        <div className="text-lg font-semibold text-primary-600">
                          You voted: {voteHistory[vote.id].toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Thank you for participating in community governance
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Voting History */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Recent Voting Results</h2>
              <div className="space-y-4">
                {[
                  { title: 'Community Center Renovation', result: 'Passed', yes: 289, no: 45, date: '2025-01-10' },
                  { title: 'Security Camera Installation', result: 'Passed', yes: 312, no: 22, date: '2025-01-05' },
                  { title: 'Parking Fee Increase', result: 'Failed', yes: 156, no: 178, date: '2024-12-28' }
                ].map((pastVote, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{pastVote.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{pastVote.date}</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Yes: {pastVote.yes} | No: {pastVote.no}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        pastVote.result === 'Passed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {pastVote.result}
                      </div>
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
            {/* Community Chat */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Community Communication</h2>
              <div className="h-96 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">S</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">Sarah Johnson (Community Manager)</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Community meeting scheduled for Saturday at 10 AM in the community center. Please RSVP.</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">2 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">M</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">Mike Thompson (Security)</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Security update: All cameras are operational. New patrol schedule starts tomorrow.</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">1 hour ago</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">L</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">Lisa Chen (Emergency Response)</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Emergency drill reminder: Practice evacuation routes this weekend. Safety first!</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">30 min ago</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your community message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Communication Channels */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Communication Channels</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <MessageSquare className="h-8 w-8 text-primary-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Community Chat</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Real-time messaging</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm">
                      Join Chat
                    </button>
                    <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                      Settings
                    </button>
                  </div>
                </div>

                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <Phone className="h-8 w-8 text-green-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Emergency Calls</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Priority communication</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                      Call Now
                    </button>
                    <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                      <Mic className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <Video className="h-8 w-8 text-blue-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Video Conferencing</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Virtual meetings</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Start Meeting
                    </button>
                    <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityGovernance;
