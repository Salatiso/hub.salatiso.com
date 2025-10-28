import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG as QRCode } from 'react-qr-code';
import { useTranslation } from 'react-i18next';
import { HubClient } from '../utils/hubClient';
import { Shield, QrCode, Camera, Upload, Share2, Clock, UserCheck } from 'lucide-react';

const SafetyExchange = () => {
  const { t } = useTranslation();
  const [qrPayload, setQrPayload] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [consentEvents, setConsentEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadConsentData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const mockData = [
          {
            id: '1',
            timestamp: new Date().toISOString(),
            participants: ['user1', 'user2'],
            status: 'confirmed',
            type: 'safety_exchange'
          }
        ];
        setConsentEvents(mockData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadConsentData();
  }, []);

  const generateQrCode = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockPayload = {
        id: `safety_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'safety_exchange'
      };
      setQrPayload(mockPayload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = useCallback((data) => {
    try {
      if (!data) return;
      
      const parsed = JSON.parse(data);
      if (!parsed?.id || !parsed?.type) {
        throw new Error(t('safetyExchange.invalidQrCode'));
      }
      
      setShowScanner(false);
      setScanResult(parsed);
    } catch (err) {
      setError(err.message || t('safetyExchange.scanError'));
      setShowScanner(false);
    }
  }, [t]);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => handleScan(e.target.result);
      reader.readAsText(file);
    }
  }, [handleScan]);

  const shareViaMesh = async () => {
    try {
      setLoading(true);
      await HubClient.shareViaMesh(qrPayload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="safety-exchange-container p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Shield className="w-8 h-8 text-blue-600" />
        {t('safetyExchange.title')}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* QR Generation Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-green-600" />
            {t('safetyExchange.generateQR')}
          </h2>
          {qrPayload ? (
            <div className="text-center">
              <div className="mb-4">
                <QRCode value={JSON.stringify(qrPayload)} size={256} />
              </div>
              <button
                onClick={() => setQrPayload(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              >
                {t('safetyExchange.clearQR')}
              </button>
            </div>
          ) : (
            <button
              onClick={generateQrCode}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? t('common.loading') : t('safetyExchange.generateButton')}
            </button>
          )}
        </div>

        {/* QR Scan Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Camera className="w-6 h-6 text-purple-600" />
            {t('safetyExchange.scanQR')}
          </h2>
          <div className="space-y-4">
            {showScanner ? (
              <div className="relative">
                <QrScanner
                  ref={scannerRef}
                  onDecode={handleScan}
                  onError={handleScanError}
                  constraints={{ facingMode }}
                  className="qr-scanner rounded-lg overflow-hidden"
                />
                <button
                  onClick={toggleCamera}
                  className="absolute bottom-4 right-4 bg-white/80 text-gray-800 p-2 rounded-full hover:bg-white/90"
                  title={t('safetyExchange.switchCamera')}
                >
                  <FlipCamera className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowScanner(true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
                disabled={loading}
              >
                <Camera className="inline-block mr-2 w-5 h-5" />
                {t('safetyExchange.useCamera')}
              </button>
            )}
            <label className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full inline-block text-center cursor-pointer">
              <Upload className="inline-block mr-2 w-5 h-5" />
              {t('safetyExchange.uploadQR')}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>
          {scanResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <pre className="whitespace-pre-wrap break-words">{JSON.stringify(scanResult, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      {/* Mesh Sharing Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Share2 className="w-6 h-6 text-orange-600" />
          {t('safetyExchange.meshShare')}
        </h2>
        <button
          onClick={shareViaMesh}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
          disabled={loading || !qrPayload}
        >
          {loading ? t('common.loading') : t('safetyExchange.shareButton')}
        </button>
      </div>

      {/* Consent Ledger Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-teal-600" />
          {t('safetyExchange.consentLedger')}
        </h2>
        {loading ? (
          <div>{t('common.loading')}...</div>
        ) : (
          <div className="space-y-4">
            {consentEvents.map((event) => (
              <div key={event.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{new Date(event.timestamp).toLocaleString()}</div>
                    <div className="text-sm text-gray-600">{event.type}</div>
                  </div>
                  <span className="px-2 py-1 text-sm rounded-full bg-green-100 text-green-800">
                    {event.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyExchange;