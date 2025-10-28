import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ChevronDown, ChevronUp, Check } from 'lucide-react';

const TermsOfReciprocityModal = ({ isOpen, onClose, onAccept, onDecline }) => {
  const { t } = useTranslation();
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    setIsScrolledToBottom(isAtBottom);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleAccept = () => {
    if (isScrolledToBottom && hasAccepted) {
      onAccept();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold">Terms of Reciprocity</h2>
            <p className="text-blue-100 mt-1">Salatiso Ecosystem - Building Trust Through Mutual Benefit</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Progress indicator */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Please read all terms carefully</span>
              <span className={`font-medium ${isScrolledToBottom ? 'text-green-600' : 'text-orange-600'}`}>
                {isScrolledToBottom ? '✓ Fully Read' : 'Scroll to continue'}
              </span>
            </div>
          </div>

          {/* Scrollable content */}
          <div
            className="flex-1 overflow-y-auto px-6 py-4"
            onScroll={handleScroll}
            style={{ maxHeight: '60vh' }}
          >
            <div className="space-y-6">

              {/* Introduction */}
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Welcome to the Salatiso Ecosystem</h3>
                <p className="text-blue-800">
                  The Salatiso Ecosystem is built on principles of mutual benefit, trust, and reciprocity.
                  By participating, you agree to contribute positively to the community while benefiting from
                  the collective strength of our network.
                </p>
              </div>

              {/* Expandable Sections */}
              <div className="space-y-4">

                {/* Section 1 */}
                <div className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleSection('trust')}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">1. Trust & Safety Principles</span>
                    {expandedSections.trust ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.trust && (
                    <div className="px-4 pb-4 text-gray-700">
                      <p className="mb-3">
                        Trust is the foundation of our ecosystem. All participants must:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Maintain honest and transparent communication</li>
                        <li>Respect the privacy and dignity of all members</li>
                        <li>Report suspicious activities promptly</li>
                        <li>Contribute positively to community safety</li>
                        <li>Use verification systems appropriately</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Section 2 */}
                <div className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleSection('reciprocity')}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">2. Principle of Reciprocity</span>
                    {expandedSections.reciprocity ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.reciprocity && (
                    <div className="px-4 pb-4 text-gray-700">
                      <p className="mb-3">
                        Reciprocity means mutual benefit and responsibility:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Benefits received should be balanced with contributions made</li>
                        <li>Support fellow community members in times of need</li>
                        <li>Share knowledge and resources appropriately</li>
                        <li>Participate in community governance</li>
                        <li>Maintain positive community standing</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Section 3 */}
                <div className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleSection('data')}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">3. Data Privacy & Protection</span>
                    {expandedSections.data ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.data && (
                    <div className="px-4 pb-4 text-gray-700">
                      <p className="mb-3">
                        Your privacy is protected under POPIA and our community standards:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Data is encrypted and securely stored</li>
                        <li>Information is only shared with explicit consent</li>
                        <li>You control your privacy settings</li>
                        <li>Regular security audits ensure protection</li>
                        <li>Data is automatically deleted when no longer needed</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Section 4 */}
                <div className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleSection('safety')}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">4. Safety & Emergency Protocols</span>
                    {expandedSections.safety ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.safety && (
                    <div className="px-4 pb-4 text-gray-700">
                      <p className="mb-3">
                        Safety is our highest priority:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Emergency contacts are verified and secure</li>
                        <li>Location sharing is opt-in and time-limited</li>
                        <li>Safety features work offline when possible</li>
                        <li>Community validation enhances security</li>
                        <li>Regular safety drills and training</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Section 5 */}
                <div className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleSection('verification')}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">5. Identity Verification & Trust Building</span>
                    {expandedSections.verification ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.verification && (
                    <div className="px-4 pb-4 text-gray-700">
                      <p className="mb-3">
                        Building trust through verification:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>ID validation uses secure, private methods</li>
                        <li>Trust scores are community-validated</li>
                        <li>Verification enhances but doesn't guarantee trust</li>
                        <li>Appeals process for verification disputes</li>
                        <li>Regular trust score recalibration</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Section 6 */}
                <div className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleSection('community')}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">6. Community Participation</span>
                    {expandedSections.community ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.community && (
                    <div className="px-4 pb-4 text-gray-700">
                      <p className="mb-3">
                        Active participation strengthens our community:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Vote in community governance decisions</li>
                        <li>Participate in safety and trust validations</li>
                        <li>Contribute to community knowledge base</li>
                        <li>Support fellow members when possible</li>
                        <li>Provide constructive feedback</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Section 7 */}
                <div className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleSection('liability')}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">7. Liability & Dispute Resolution</span>
                    {expandedSections.liability ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.liability && (
                    <div className="px-4 pb-4 text-gray-700">
                      <p className="mb-3">
                        Understanding responsibilities and recourse:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Community arbitration for disputes</li>
                        <li>Escalation to formal mediation when needed</li>
                        <li>Clear liability boundaries for all parties</li>
                        <li>Insurance coverage for verified activities</li>
                        <li>Regular review of dispute resolution processes</li>
                      </ul>
                    </div>
                  )}
                </div>

              </div>

              {/* Important Notice */}
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <h4 className="text-lg font-semibold text-yellow-900 mb-2">Important Notice</h4>
                <p className="text-yellow-800 text-sm">
                  These terms create a binding agreement between you and the Salatiso Ecosystem.
                  By accepting, you agree to abide by our community standards and contribute positively
                  to the mutual benefit of all members. Violation of these terms may result in
                  temporary or permanent suspension from the ecosystem.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Acceptance checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={hasAccepted}
                onChange={(e) => setHasAccepted(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-700">
                I have read and agree to the Terms of Reciprocity
              </label>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={onDecline}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                disabled={!isScrolledToBottom || !hasAccepted}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  isScrolledToBottom && hasAccepted
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Accept Terms
              </button>
            </div>
          </div>

          {/* Status indicator */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              {!isScrolledToBottom && "Please scroll to the bottom to continue"}
              {isScrolledToBottom && !hasAccepted && "Please check the acceptance box to continue"}
              {isScrolledToBottom && hasAccepted && "Ready to accept - click the button above"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfReciprocityModal;
