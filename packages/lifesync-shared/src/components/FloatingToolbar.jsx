import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Shield, MapPin, Users, ExternalLink, CreditCard, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FloatingToolbar = () => {
  const { t } = useTranslation();
  const [isMinimized, setIsMinimized] = useState(false);
  const [showIdValidator, setShowIdValidator] = useState(false);
  const [idInput, setIdInput] = useState('');
  const [validationResult, setValidationResult] = useState(null);

  const tools = [
    {
      name: 'ID Validator',
      icon: CreditCard,
      action: () => setShowIdValidator(true),
      description: 'Validate South African ID numbers'
    },
    {
      name: 'Follow Me Home',
      icon: MapPin,
      path: '/follow-me-home',
      description: 'Personal safety companion'
    },
    {
      name: 'Instant Trust',
      icon: Shield,
      external: 'https://lifesync-lifecv.web.app/instant-trust',
      description: 'Quick trust verification'
    },
    {
      name: 'SafetyHelp Hub',
      icon: Users,
      external: 'https://safetyhelp-lifecv.web.app/',
      description: 'Safety and emergency services'
    }
  ];

  // Luhn algorithm for checksum validation
  const luhnCheck = (digits) => {
    let sum = 0;
    let alternate = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits[i], 10);
      if (alternate) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  };

  // Validate South African ID number
  const validateSAID = (id) => {
    const cleanId = id.replace(/\s+/g, '');
    if (cleanId.length !== 13 || !/^\d+$/.test(cleanId)) {
      return {
        validStructure: false,
        errors: [{ code: 'INVALID_LENGTH', message: 'ID number must be 13 digits' }]
      };
    }

    const digits = cleanId.split('');
    const yy = parseInt(digits.slice(0, 2).join(''), 10);
    const mm = parseInt(digits.slice(2, 4).join(''), 10);
    const dd = parseInt(digits.slice(4, 6).join(''), 10);

    // Determine full year
    const currentYear = new Date().getFullYear();
    const currentYearShort = currentYear % 100;
    const fullYear = yy <= currentYearShort ? 2000 + yy : 1900 + yy;

    // Validate date
    const date = new Date(fullYear, mm - 1, dd);
    if (date.getFullYear() !== fullYear || date.getMonth() !== mm - 1 || date.getDate() !== dd) {
      return {
        validStructure: false,
        errors: [{ code: 'INVALID_DOB', message: 'Invalid date of birth' }]
      };
    }

    // Check age plausibility
    const age = currentYear - fullYear;
    if (age < 0 || age > 120) {
      return {
        validStructure: false,
        errors: [{ code: 'INVALID_DOB', message: 'Implausible age' }]
      };
    }

    // Citizenship digit
    const citizenship = parseInt(digits[10], 10);
    if (citizenship !== 0 && citizenship !== 1) {
      return {
        validStructure: false,
        errors: [{ code: 'INVALID_CITIZENSHIP_DIGIT', message: 'Invalid citizenship digit' }]
      };
    }

    // Checksum
    const checksumValid = luhnCheck(digits.slice(0, 12).join('') + digits[12]);

    const sequence = parseInt(digits.slice(6, 10).join(''), 10);
    const gender = sequence < 5000 ? 'Female' : 'Male';

    return {
      validStructure: true,
      checksumValid,
      dateOfBirth: `${fullYear}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`,
      age,
      gender,
      citizenship: citizenship === 0 ? 'South African' : 'Permanent resident',
      errors: []
    };
  };

  const handleIdValidation = () => {
    const result = validateSAID(idInput);
    setValidationResult(result);
  };

  const handleToolClick = (tool) => {
    if (tool.action) {
      tool.action();
    } else if (tool.external) {
      window.open(tool.external, '_blank');
    } else if (tool.path) {
      window.location.href = tool.path;
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full shadow-lg transition-all duration-300"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 bg-blue-500 dark:bg-blue-600 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">
              Quick Tools
            </h3>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-white hover:text-gray-200"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2">
            {tools.map((tool, index) => (
              <button
                key={index}
                onClick={() => handleToolClick(tool)}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-400 transition-colors text-left"
              >
                <tool.icon className="h-5 w-5 text-white flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-white">
                    {tool.name}
                  </div>
                  <div className="text-xs text-gray-200">
                    {tool.description}
                  </div>
                </div>
                {tool.external && <ExternalLink className="h-4 w-4 text-white" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ID Validator Modal */}
      {showIdValidator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  ID Number Validator
                </h3>
                <button
                  onClick={() => {
                    setShowIdValidator(false);
                    setIdInput('');
                    setValidationResult(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Enter a South African ID number for structural validation. This checks format, date plausibility, and checksum but does not verify against official records.
                </p>
                <input
                  type="text"
                  value={idInput}
                  onChange={(e) => setIdInput(e.target.value)}
                  placeholder="e.g., 8001015009087"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  maxLength={13}
                />
              </div>

              <button
                onClick={handleIdValidation}
                disabled={!idInput.trim()}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Validate ID
              </button>

              {validationResult && (
                <div className="mt-4 p-4 rounded-lg border">
                  {validationResult.validStructure ? (
                    <div className="text-green-600 dark:text-green-400">
                      <div className="font-semibold mb-2">✓ Structurally Valid</div>
                      <div className="text-sm space-y-1">
                        <div>Date of Birth: {validationResult.dateOfBirth}</div>
                        <div>Age: {validationResult.age}</div>
                        <div>Gender: {validationResult.gender}</div>
                        <div>Citizenship: {validationResult.citizenship}</div>
                        <div>Checksum: {validationResult.checksumValid ? 'Valid' : 'Invalid'}</div>
                      </div>
                      <div className="text-xs mt-2 text-gray-600 dark:text-gray-400">
                        This does not confirm the ID is issued by Home Affairs. For official verification, contact the relevant authorities.
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-600 dark:text-red-400">
                      <div className="font-semibold mb-2">✗ Invalid Structure</div>
                      <ul className="text-sm list-disc list-inside">
                        {validationResult.errors.map((error, index) => (
                          <li key={index}>{error.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingToolbar;
