import { useState, useRef } from 'react';
import { QrCode, Camera, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const QRTrustProfileScanner = ({ onScanSuccess, onScanError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // Simulate QR code detection (in real implementation, use a QR library)
        setTimeout(() => {
          const mockTrustData = {
            userId: 'LS-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
            trustScore: Math.floor(Math.random() * 40) + 60,
            verificationTier: ['basic', 'confirmed', 'enhanced'][Math.floor(Math.random() * 3)],
            lastVerified: Date.now(),
            context: 'sync-verification'
          };

          setScanResult(mockTrustData);
          onScanSuccess?.(mockTrustData);
          stopScanning();
        }, 3000);
      }
    } catch (err) {
      setError('Camera access denied or not available');
      setIsScanning(false);
      onScanError?.(err);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
    setIsScanning(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="text-center mb-6">
        <QrCode className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Trust Profile Scanner
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Scan a partner's trust QR code to verify their profile
        </p>
      </div>

      <div className="space-y-4">
        {!isScanning && !scanResult && !error && (
          <div className="text-center">
            <button
              onClick={startScanning}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Camera className="h-5 w-5 mr-2" />
              Start Scanning
            </button>
          </div>
        )}

        {isScanning && (
          <div className="text-center">
            <div className="relative inline-block">
              <video
                ref={videoRef}
                className="w-64 h-64 border-2 border-blue-300 rounded-lg"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-32 h-32 border-2 border-white rounded-lg opacity-50"></div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Position QR code within the frame
            </p>
            <button
              onClick={stopScanning}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Stop Scanning
            </button>
          </div>
        )}

        {scanResult && (
          <div className="text-center">
            <div className="mb-4">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-2" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Trust Profile Verified
              </h4>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Trust ID:</span>
                  <p className="text-gray-900 dark:text-white font-mono">{scanResult.userId}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Trust Score:</span>
                  <p className={`font-bold ${
                    scanResult.trustScore >= 80 ? 'text-green-600' :
                    scanResult.trustScore >= 60 ? 'text-blue-600' :
                    'text-yellow-600'
                  }`}>
                    {scanResult.trustScore}/100
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Tier:</span>
                  <p className={`font-medium ${
                    scanResult.verificationTier === 'enhanced' ? 'text-green-600' :
                    scanResult.verificationTier === 'confirmed' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {scanResult.verificationTier}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Last Verified:</span>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(scanResult.lastVerified).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 justify-center">
              <button
                onClick={() => onScanSuccess?.(scanResult)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Confirm & Continue
              </button>
              <button
                onClick={resetScanner}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Scan Another
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-2" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Scanning Error
            </h4>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              {error}
            </p>
            <button
              onClick={resetScanner}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Security Note</p>
            <p>QR codes contain encrypted trust data. Only scan codes from verified partners during sync setup.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRTrustProfileScanner;
