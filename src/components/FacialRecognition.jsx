import React, { useState, useRef, useCallback } from 'react';
import { Camera, CheckCircle, XCircle, AlertTriangle, Eye, RefreshCw, User } from 'lucide-react';

const FacialRecognition = ({
  onCapture,
  userType = 'participant',
  className = '',
  context = 'lifesync'
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasPermission(true);
      }
    } catch (err) {
      setError('Camera access denied or unavailable');
      console.error('Camera error:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setHasPermission(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    setError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);

        // Simulate face detection and liveness check
        setIsValidating(true);
        setTimeout(() => {
          // Mock validation result - in real implementation, this would call an API
          const mockResult = {
            isValid: true,
            confidence: 0.92,
            livenessVerified: true,
            faceDetected: true
          };

          setValidationResult(mockResult);
          setIsValidating(false);
          setIsCapturing(false);

          // Call the onCapture callback with the result
          if (onCapture) {
            onCapture({
              imageBlob: blob,
              imageUrl,
              validation: mockResult,
              timestamp: new Date().toISOString(),
              userType,
              context
            });
          }
        }, 2000);
      } else {
        setError('Failed to capture photo');
        setIsCapturing(false);
      }
    }, 'image/jpeg', 0.8);
  }, [onCapture, userType, context]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setValidationResult(null);
    setError(null);
  }, []);

  const resetProcess = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setValidationResult(null);
    setError(null);
    setIsCapturing(false);
    setIsValidating(false);
  }, [stopCamera]);

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className={`facial-recognition ${className}`}>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <User className="w-8 h-8 text-blue-600 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900">
              Facial Verification
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            Please ensure good lighting and remove glasses/sunglasses
          </p>
        </div>

        {/* Camera/Error State */}
        {!hasPermission && !capturedImage && (
          <div className="text-center mb-6">
            <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Camera className="w-12 h-12 text-gray-400" />
            </div>
            <button
              onClick={startCamera}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enable Camera
            </button>
          </div>
        )}

        {/* Video Stream */}
        {hasPermission && !capturedImage && (
          <div className="mb-6">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg border-2 border-gray-200"
                style={{ maxHeight: '300px' }}
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="mt-4 flex justify-center">
              <button
                onClick={capturePhoto}
                disabled={isCapturing}
                className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isCapturing ? (
                  <div className="flex items-center">
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Capturing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    Take Photo
                  </div>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Captured Image */}
        {capturedImage && (
          <div className="mb-6">
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full rounded-lg border-2 border-gray-200"
              />
              {validationResult && (
                <div className="absolute top-2 right-2">
                  {validationResult.isValid ? (
                    <CheckCircle className="w-8 h-8 text-green-500 bg-white rounded-full" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-500 bg-white rounded-full" />
                  )}
                </div>
              )}
            </div>

            {/* Validation Status */}
            {isValidating && (
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin text-blue-600" />
                  <span className="text-blue-600">Validating...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            )}

            {/* Validation Result */}
            {validationResult && !isValidating && (
              <div className="mt-4">
                {validationResult.isValid ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-800">Verification Successful</span>
                    </div>
                    <div className="text-sm text-green-700">
                      <p>Face detected: ✓</p>
                      <p>Liveness verified: ✓</p>
                      <p>Confidence: {(validationResult.confidence * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <XCircle className="w-5 h-5 text-red-600 mr-2" />
                      <span className="font-medium text-red-800">Verification Failed</span>
                    </div>
                    <p className="text-sm text-red-700">
                      Please ensure your face is clearly visible and try again.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={retakePhoto}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Retake
              </button>
              <button
                onClick={resetProcess}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800 font-medium">Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">
            <Eye className="w-4 h-4 inline mr-1" />
            Look directly at the camera
          </p>
          <p>Ensure good lighting and remove obstructions</p>
        </div>

      </div>
    </div>
  );
};

export default FacialRecognition;
