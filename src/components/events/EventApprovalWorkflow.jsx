import { useState } from 'react';
import { CheckCircle, XCircle, Clock, User, Home, AlertTriangle } from 'lucide-react';

const EventApprovalWorkflow = ({ event, onApprove, onReject, currentUserRole = 'parent' }) => {
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [showConditions, setShowConditions] = useState(false);
  const [showRequestInfo, setShowRequestInfo] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [conditions, setConditions] = useState('');
  const [requestInfo, setRequestInfo] = useState('');

  const governance = event?.governance || {};
  const currentStep = governance.currentStep || 'unit';
  const approvals = governance.approvals || [];
  const rejections = governance.rejections || [];

  const canApprove = () => {
    // Logic for who can approve at each step
    if (currentStep === 'unit' && ['parent', 'guardian'].includes(currentUserRole)) return true;
    if (currentStep === 'household' && ['parent', 'guardian', 'household_admin'].includes(currentUserRole)) return true;
    return false;
  };

  const handleApprove = (type = 'approve') => {
    let additionalData = {};
    if (type === 'conditions' && !conditions.trim()) return;
    if (type === 'request_info' && !requestInfo.trim()) return;

    if (type === 'conditions') additionalData = { conditions };
    if (type === 'request_info') additionalData = { requestInfo };

    const approval = {
      id: Date.now(),
      userId: 'current_user', // In real app, get from auth
      userRole: currentUserRole,
      step: currentStep,
      timestamp: Date.now(),
      approved: type !== 'reject',
      type,
      ...additionalData
    };

    onApprove(event.id, approval);
    setShowConditions(false);
    setShowRequestInfo(false);
    setConditions('');
    setRequestInfo('');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;

    const rejection = {
      id: Date.now(),
      userId: 'current_user',
      userRole: currentUserRole,
      step: currentStep,
      timestamp: Date.now(),
      reason: rejectReason,
      approved: false,
      type: 'reject'
    };

    onReject(event.id, rejection);
    setShowRejectReason(false);
    setRejectReason('');
  };

  const getStepStatus = (step) => {
    const stepApprovals = approvals.filter(a => a.step === step);
    const stepRejections = rejections.filter(r => r.step === step);

    if (stepRejections.length > 0) return 'rejected';
    if (stepApprovals.length > 0) return 'approved';
    if (step === currentStep) return 'pending';
    return 'waiting';
  };

  const steps = [
    {
      id: 'unit',
      label: 'Unit Approval',
      description: 'Parent/Guardian approval for child-initiated events',
      icon: User,
      requiredRole: ['parent', 'guardian']
    },
    {
      id: 'household',
      label: 'Household Approval',
      description: 'Main household validation and final approval',
      icon: Home,
      requiredRole: ['parent', 'guardian', 'household_admin']
    }
  ];

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 text-blue-600" />
        Event Approval Workflow
      </h3>

      <div className="mb-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium mb-2">{event.title}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><strong>Type:</strong> {event.type}</div>
            <div><strong>Date:</strong> {event.date}</div>
            <div><strong>Host Role:</strong> {event.hostRole}</div>
            <div><strong>Status:</strong> {event.status?.replace('_', ' ')}</div>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {steps.map((step) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                status === 'approved' ? 'bg-green-100 text-green-600' :
                status === 'rejected' ? 'bg-red-100 text-red-600' :
                status === 'pending' ? 'bg-blue-100 text-blue-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                {status === 'approved' && <CheckCircle className="w-5 h-5" />}
                {status === 'rejected' && <XCircle className="w-5 h-5" />}
                {status === 'pending' && <Clock className="w-5 h-5" />}
                {status === 'waiting' && <Icon className="w-5 h-5" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{step.label}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    status === 'approved' ? 'bg-green-100 text-green-800' :
                    status === 'rejected' ? 'bg-red-100 text-red-800' :
                    status === 'pending' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {step.description}
                </p>

                {status === 'pending' && canApprove() && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleApprove('approve')}
                      className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setShowConditions(true)}
                      className="px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                    >
                      Approve with Conditions
                    </button>
                    <button
                      onClick={() => setShowRequestInfo(true)}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Request More Info
                    </button>
                    <button
                      onClick={() => setShowRejectReason(true)}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {status === 'approved' && (
                  <div className="mt-2 text-sm text-green-600">
                    Approved by {approvals.filter(a => a.step === step.id).length} reviewer(s)
                  </div>
                )}

                {status === 'rejected' && (
                  <div className="mt-2 text-sm text-red-600">
                    Rejected: {rejections.find(r => r.step === step.id)?.reason}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {event.status === 'approved' && (
        <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
          <div className="flex items-center text-green-800 dark:text-green-200">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Event Approved!</span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            The event has completed the approval workflow and can now proceed with guest invitations.
          </p>
        </div>
      )}

      {event.status === 'rejected' && (
        <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-700">
          <div className="flex items-center text-red-800 dark:text-red-200">
            <XCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Event Rejected</span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            The event has been rejected. Please review the rejection reasons and modify the event if needed.
          </p>
        </div>
      )}

      {/* Approve with Conditions Modal */}
      {showConditions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Approve with Conditions</h3>
              <textarea
                className="w-full p-3 border rounded-lg"
                rows={4}
                placeholder="Please specify the conditions for approval..."
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
              />
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowConditions(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApprove('conditions')}
                  disabled={!conditions.trim()}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400"
                >
                  Approve with Conditions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request More Info Modal */}
      {showRequestInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Request More Information</h3>
              <textarea
                className="w-full p-3 border rounded-lg"
                rows={4}
                placeholder="Please specify what additional information is needed..."
                value={requestInfo}
                onChange={(e) => setRequestInfo(e.target.value)}
              />
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowRequestInfo(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApprove('request_info')}
                  disabled={!requestInfo.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Request Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectReason && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Reject Event</h3>
              <textarea
                className="w-full p-3 border rounded-lg"
                rows={4}
                placeholder="Please provide a reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowRejectReason(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                >
                  Reject Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventApprovalWorkflow;