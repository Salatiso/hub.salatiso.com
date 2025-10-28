import { Shield, CheckCircle, Clock } from 'lucide-react';

const LifeSyncSeal = ({ event, size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-16 h-16 text-sm',
    medium: 'w-24 h-24 text-base',
    large: 'w-32 h-32 text-lg'
  };

  const isGranted = event?.seal?.granted;
  const validUntil = event?.seal?.validUntil;
  const isValid = validUntil && new Date(validUntil) > new Date();

  if (!isGranted || !isValid) {
    return (
      <div className={`${sizeClasses[size]} rounded-full border-4 border-gray-300 bg-gray-100 flex flex-col items-center justify-center text-gray-500`}>
        <Shield className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Pending</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={`${sizeClasses[size]} rounded-full border-4 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center text-blue-700 shadow-lg`}>
        <Shield className="w-8 h-8 mb-1" />
        <span className="font-bold text-xs">LifeSync</span>
        <span className="font-bold text-xs">Seal</span>
      </div>

      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
        <CheckCircle className="w-4 h-4 text-white" />
      </div>

      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-2 py-1 shadow-md border">
        <div className="flex items-center space-x-1 text-xs text-gray-600">
          <Clock className="w-3 h-3" />
          <span>Valid</span>
        </div>
      </div>
    </div>
  );
};

export const SealBadge = ({ event, showDetails = false }) => {
  const isGranted = event?.seal?.granted;
  const validUntil = event?.seal?.validUntil;
  const isValid = validUntil && new Date(validUntil) > new Date();

  if (!isGranted) {
    return (
      <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
        <Clock className="w-4 h-4 mr-1" />
        Seal Pending
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
        <Shield className="w-4 h-4 mr-1" />
        Seal Expired
      </div>
    );
  }

  return (
    <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
      <Shield className="w-4 h-4 mr-1" />
      LifeSync Seal
      {showDetails && (
        <span className="ml-2 text-xs">
          Valid until {new Date(validUntil).toLocaleDateString()}
        </span>
      )}
    </div>
  );
};

export const SealCriteria = ({ event }) => {
  const safetyMeasures = event?.safetyMeasures || [];

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
        <Shield className="w-5 h-5 mr-2" />
        LifeSync Seal Criteria
      </h4>

      <div className="space-y-2">
        <div className="flex items-center text-sm">
          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
          <span>Event created through LifeSync platform</span>
        </div>

        <div className="flex items-center text-sm">
          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
          <span>Governance approval flow completed</span>
        </div>

        <div className="flex items-center text-sm">
          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
          <span>Emergency contact synchronization</span>
        </div>

        <div className="flex items-center text-sm">
          {safetyMeasures.length >= 3 ? (
            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
          ) : (
            <Clock className="w-4 h-4 text-yellow-600 mr-2" />
          )}
          <span>Safety measures implemented ({safetyMeasures.length}/6)</span>
        </div>

        <div className="flex items-center text-sm">
          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
          <span>Host agreement to Safety Charter</span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Seal Status:</span>
          <SealBadge event={event} />
        </div>
        {event?.seal?.granted && (
          <div className="mt-2 text-xs text-gray-600">
            Event ID: {event.id} | Valid until event end
          </div>
        )}
      </div>
    </div>
  );
};

export default LifeSyncSeal;