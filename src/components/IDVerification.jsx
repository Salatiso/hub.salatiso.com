import { useState, useContext } from 'react';
import { Shield, CheckCircle, AlertTriangle, Camera, Globe } from 'lucide-react';
import GuestContext from '../contexts/GuestContext';
import FacialRecognition from './FacialRecognition';

const IDVerification = ({
  onVerificationComplete,
  context = 'general',
  requireFacial = true,
  requireNationality = false,
  className = ''
}) => {
  const { guestData, setGuestData } = useContext(GuestContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState({
    idNumber: '',
    idType: 'south-african',
    nationality: '',
    workPermit: '',
    facialVerified: false,
    idVerified: false,
    nationalityConfirmed: false
  });
  const [validationResult, setValidationResult] = useState(null);
  const [showFacialRecognition, setShowFacialRecognition] = useState(false);

  const idTypes = [
    { value: 'south-african', label: 'South African ID' },
    { value: 'passport', label: 'Passport' },
    { value: 'drivers-license', label: 'Driver\'s License' },
    { value: 'work-permit', label: 'Work Permit' }
  ];

  const nationalities = [
    'South African',
    'Zimbabwean',
    'Mozambican',
    'Botswanan',
    'Namibian',
    'Lesotho',
    'Swazi',
    'Malawian',
    'Zambian',
    'Angolan',
    'Other'
  ];

  const validateSouthAfricanID = (id) => {
    if (!/^\d{13}$/.test(id)) {
      return { valid: false, errors: [{ message: 'ID must be exactly 13 digits' }] };
    }

    const year = parseInt(id.substring(0, 2));
    const month = parseInt(id.substring(2, 4));
    const day = parseInt(id.substring(4, 6));
    const gender = parseInt(id.substring(6, 10)) < 5000 ? 'Female' : 'Male';
    const citizenship = parseInt(id.substring(10, 11)) === 0 ? 'South African' : 'Permanent Resident';

    // Basic date validation
    const currentYear = new Date().getFullYear() % 100;
    const birthYear = year > currentYear ? 1900 + year : 2000 + year;

    if (month < 1 || month > 12) {
      return { valid: false, errors: [{ message: 'Invalid birth month' }] };
    }

    if (day < 1 || day > 31) {
      return { valid: false, errors: [{ message: 'Invalid birth day' }] };
    }

    // Luhn algorithm for checksum
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      let digit = parseInt(id[i]);
      if (i % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    const checksum = (10 - (sum % 10)) % 10;
    const checksumValid = checksum === parseInt(id[12]);

    const age = new Date().getFullYear() - birthYear;

    return {
      valid: checksumValid,
      dateOfBirth: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${birthYear}`,
      age,
      gender,
      citizenship,
      checksumValid
    };
  };

  const handleIdValidation = () => {
    setIsVerifying(true);

    setTimeout(() => {
      if (verificationData.idType === 'south-african') {
        const result = validateSouthAfricanID(verificationData.idNumber);
        setValidationResult(result);
        if (result.valid) {
          setVerificationData(prev => ({ ...prev, idVerified: true }));
          setCurrentStep(2);
        }
      } else {
        // For other ID types, basic validation
        const result = {
          valid: verificationData.idNumber.length >= 5,
          message: verificationData.idNumber.length >= 5 ? 'ID format accepted' : 'ID too short'
        };
        setValidationResult(result);
        if (result.valid) {
          setVerificationData(prev => ({ ...prev, idVerified: true }));
          setCurrentStep(2);
        }
      }
      setIsVerifying(false);
    }, 1500);
  };

  const handleFacialComplete = () => {
    setVerificationData(prev => ({ ...prev, facialVerified: true }));
    setShowFacialRecognition(false);
    setCurrentStep(requireNationality ? 3 : 4);
  };

  const handleNationalityConfirm = () => {
    if (verificationData.nationality && (verificationData.nationality === 'South African' || verificationData.workPermit)) {
      setVerificationData(prev => ({ ...prev, nationalityConfirmed: true }));
      setCurrentStep(4);
    }
  };

  const handleCompleteVerification = () => {
    const verificationRecord = {
      ...verificationData,
      verifiedAt: Date.now(),
      context,
      trustScore: calculateTrustScore()
    };

    const updatedGuestData = {
      ...guestData,
      verifications: [...(guestData.verifications || []), verificationRecord],
      trustScore: Math.max(guestData.trustScore || 0, verificationRecord.trustScore)
    };

    setGuestData(updatedGuestData);

    if (onVerificationComplete) {
      onVerificationComplete(verificationRecord);
    }
  };

  const calculateTrustScore = () => {
    let score = 0;
    if (verificationData.idVerified) score += 40;
    if (verificationData.facialVerified) score += 35;
    if (verificationData.nationalityConfirmed) score += 25;
    return Math.min(score, 100);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= step
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-12 h-0.5 mx-2 ${
              currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className={`max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="text-center mb-6">
        <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Identity Verification
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Complete verification to enhance trust and safety
        </p>
      </div>

      {renderStepIndicator()}

      {currentStep === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ID Type
            </label>
            <select
              value={verificationData.idType}
              onChange={(e) => setVerificationData(prev => ({ ...prev, idType: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {idTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ID Number
            </label>
            <input
              type="text"
              value={verificationData.idNumber}
              onChange={(e) => setVerificationData(prev => ({ ...prev, idNumber: e.target.value }))}
              placeholder={verificationData.idType === 'south-african' ? 'e.g., 8001015009087' : 'Enter ID number'}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              maxLength={verificationData.idType === 'south-african' ? 13 : 20}
            />
          </div>

          <button
            onClick={handleIdValidation}
            disabled={!verificationData.idNumber.trim() || isVerifying}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {isVerifying ? 'Validating...' : 'Validate ID'}
          </button>

          {validationResult && (
            <div className="mt-4 p-4 rounded-lg border">
              {validationResult.valid ? (
                <div className="text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5 inline mr-2" />
                  <span className="font-semibold">ID Validated Successfully</span>
                  {validationResult.dateOfBirth && (
                    <div className="text-sm mt-2 space-y-1">
                      <div>DOB: {validationResult.dateOfBirth}</div>
                      <div>Age: {validationResult.age}</div>
                      <div>Gender: {validationResult.gender}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-5 h-5 inline mr-2" />
                  <span className="font-semibold">Validation Failed</span>
                  <ul className="text-sm mt-2 list-disc list-inside">
                    {validationResult.errors?.map((error, index) => (
                      <li key={index}>{error.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {currentStep === 2 && requireFacial && (
        <div className="space-y-6">
          <div className="text-center">
            <Camera className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Facial Verification
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Take a photo to verify your identity
            </p>
          </div>

          {!showFacialRecognition ? (
            <button
              onClick={() => setShowFacialRecognition(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Start Facial Verification
            </button>
          ) : (
            <FacialRecognition
              onCapture={handleFacialComplete}
              userType="verifier"
              context={context}
            />
          )}
        </div>
      )}

      {currentStep === 3 && requireNationality && (
        <div className="space-y-6">
          <div className="text-center">
            <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Nationality & Work Status
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Confirm your nationality and work authorization
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nationality
            </label>
            <select
              value={verificationData.nationality}
              onChange={(e) => setVerificationData(prev => ({ ...prev, nationality: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select nationality</option>
              {nationalities.map(nat => (
                <option key={nat} value={nat}>{nat}</option>
              ))}
            </select>
          </div>

          {verificationData.nationality && verificationData.nationality !== 'South African' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Work Permit Number
              </label>
              <input
                type="text"
                value={verificationData.workPermit}
                onChange={(e) => setVerificationData(prev => ({ ...prev, workPermit: e.target.value }))}
                placeholder="Enter work permit number"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Required for non-South African citizens working in South Africa
              </p>
            </div>
          )}

          <button
            onClick={handleNationalityConfirm}
            disabled={!verificationData.nationality || (verificationData.nationality !== 'South African' && !verificationData.workPermit)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Confirm Nationality
          </button>
        </div>
      )}

      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Verification Complete
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your identity has been verified successfully
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Verification Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>ID Verification:</span>
                <span className={verificationData.idVerified ? 'text-green-600' : 'text-red-600'}>
                  {verificationData.idVerified ? '✓ Verified' : '✗ Not Verified'}
                </span>
              </div>
              {requireFacial && (
                <div className="flex justify-between">
                  <span>Facial Verification:</span>
                  <span className={verificationData.facialVerified ? 'text-green-600' : 'text-red-600'}>
                    {verificationData.facialVerified ? '✓ Verified' : '✗ Not Verified'}
                  </span>
                </div>
              )}
              {requireNationality && (
                <div className="flex justify-between">
                  <span>Nationality Confirmed:</span>
                  <span className={verificationData.nationalityConfirmed ? 'text-green-600' : 'text-red-600'}>
                    {verificationData.nationalityConfirmed ? '✓ Confirmed' : '✗ Not Confirmed'}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Trust Score:</span>
                <span className="text-blue-600">{calculateTrustScore()}%</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCompleteVerification}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Complete Verification
          </button>
        </div>
      )}
    </div>
  );
};

export default IDVerification;
