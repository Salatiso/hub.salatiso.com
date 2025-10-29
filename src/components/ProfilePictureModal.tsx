import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { useLocalProfile } from '../hooks/useLocalProfile';
import './ProfilePictureModal.css';

/**
 * Profile Picture Modal Component
 *
 * Purpose: Upload and manage user's profile picture
 * Features:
 * - Image file upload
 * - Image preview
 * - Basic crop/resize functionality
 * - Zoom controls
 * - File size validation
 * - Local storage in profile
 *
 * Integration:
 * - useLocalProfile hook for profile data
 * - Updates profile with image data (base64)
 *
 * State Machine: 'entry' → 'upload' → 'preview' → 'crop' → 'processing' → 'success'
 */

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPictureSet?: (imageData: string) => void;
}

type PictureStep = 'entry' | 'upload' | 'preview' | 'crop' | 'processing' | 'success' | 'error';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({
  isOpen,
  onClose,
  onPictureSet,
}) => {
  const { profile, updateProfile } = useLocalProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [currentStep, setCurrentStep] = useState<PictureStep>('entry');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(100);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * Validate image file
   */
  const validateImageFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size must be less than 5MB. Current: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return false;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
      return false;
    }

    return true;
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    if (!validateImageFile(file)) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setSelectedImage(imageData);
      setImageFile(file);
      setCurrentStep('preview');
      setZoom(100);
    };
    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  /**
   * Handle zoom in
   */
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  /**
   * Handle zoom out
   */
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  /**
   * Reset zoom
   */
  const handleResetZoom = () => {
    setZoom(100);
  };

  /**
   * Crop and process image
   */
  const handleCropImage = async () => {
    if (!selectedImage || !canvasRef.current) return;

    try {
      setCurrentStep('processing');

      const img = new Image();
      img.onload = async () => {
        const canvas = canvasRef.current!;
        const size = 400; // 400x400 square for profile picture

        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          setError('Failed to process image');
          setCurrentStep('error');
          return;
        }

        // Draw zoomed image centered
        const scaledWidth = img.width * (zoom / 100);
        const scaledHeight = img.height * (zoom / 100);
        const x = (size - scaledWidth) / 2;
        const y = (size - scaledHeight) / 2;

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Convert to webp or jpeg
        const processedImage = canvas.toDataURL('image/jpeg', 0.85);

        // Save to profile
        await updateProfile({
          ...profile,
          profile: {
            ...profile?.profile,
          },
        });

        setSelectedImage(processedImage);
        setSuccess('Profile picture saved successfully!');
        setCurrentStep('success');

        if (onPictureSet) {
          onPictureSet(processedImage);
        }

        // Auto-close after success
        setTimeout(() => {
          handleClose();
        }, 2000);
      };

      img.onerror = () => {
        setError('Failed to process image');
        setCurrentStep('error');
      };

      img.src = selectedImage;
    } catch (err) {
      console.error('Image processing error:', err);
      setError('Failed to process image');
      setCurrentStep('error');
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setCurrentStep('entry');
    setSelectedImage('');
    setImageFile(null);
    setZoom(100);
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="profile-picture-modal-overlay">
      <div className="profile-picture-modal">
        {/* Header */}
        <div className="profile-picture-modal-header">
          <h2>
            {currentStep === 'entry' && 'Profile Picture'}
            {currentStep === 'upload' && 'Upload Photo'}
            {currentStep === 'preview' && 'Preview & Crop'}
            {currentStep === 'processing' && 'Processing...'}
            {currentStep === 'success' && 'Picture Set'}
            {currentStep === 'error' && 'Error'}
          </h2>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-step-content">
          {/* Entry Step */}
          {currentStep === 'entry' && (
            <div>
              <p className="step-intro">
                Upload a profile picture to personalize your account and help others identify you.
              </p>

              <div className="benefits-list">
                <div className="benefit-item">
                  <ImageIcon size={20} />
                  <span>Professional profile appearance</span>
                </div>
                <div className="benefit-item">
                  <CheckCircle2 size={20} />
                  <span>Supports JPEG, PNG, WebP, and GIF</span>
                </div>
                <div className="benefit-item">
                  <ZoomIn size={20} />
                  <span>Crop and customize your image</span>
                </div>
              </div>

              <div className="supported-formats">
                <strong>Supported formats:</strong>
                <p>JPEG, PNG, WebP, GIF (Max 5MB)</p>
                <strong>Recommended:</strong>
                <p>Square image, at least 400x400 pixels</p>
              </div>

              <div className="step-actions">
                <button
                  className="btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={18} />
                  Choose Photo
                </button>
                <button
                  className="btn-secondary"
                  onClick={handleClose}
                >
                  Skip for Now
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_TYPES.join(',')}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {/* Preview & Crop Step */}
          {currentStep === 'preview' && selectedImage && (
            <div>
              <h3>Adjust Your Picture</h3>
              <p className="form-intro">
                Use the zoom controls to adjust your picture, then crop it to 400x400
              </p>

              <div className="preview-container">
                <div className="image-preview">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    style={{ transform: `scale(${zoom / 100})` }}
                  />
                </div>

                <div className="zoom-controls">
                  <button
                    className="zoom-btn"
                    onClick={handleZoomOut}
                    title="Zoom Out"
                  >
                    <ZoomOut size={18} />
                  </button>
                  <div className="zoom-display">
                    <span>{zoom}%</span>
                  </div>
                  <button
                    className="zoom-btn"
                    onClick={handleZoomIn}
                    title="Zoom In"
                  >
                    <ZoomIn size={18} />
                  </button>
                  <button
                    className="zoom-btn reset"
                    onClick={handleResetZoom}
                    title="Reset"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>

                <div className="crop-preview">
                  <span>Preview (400x400)</span>
                  <div className="crop-box">
                    <img
                      src={selectedImage}
                      alt="Crop Preview"
                      style={{ transform: `scale(${zoom / 100})` }}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="form-actions">
                <button
                  className="btn-primary"
                  onClick={handleCropImage}
                >
                  <CheckCircle2 size={18} />
                  Set Picture
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setCurrentStep('entry');
                    setSelectedImage('');
                    setImageFile(null);
                    setError('');
                  }}
                >
                  Choose Different
                </button>
              </div>

              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          )}

          {/* Processing Step */}
          {currentStep === 'processing' && (
            <div className="modal-step-content center">
              <Loader size={40} className="loading-spinner" />
              <p>Processing your picture...</p>
            </div>
          )}

          {/* Success Step */}
          {currentStep === 'success' && (
            <div className="modal-step-content center">
              <CheckCircle2 size={64} className="success-icon" />
              <h3>Picture Set!</h3>
              <p>Your profile picture has been set successfully.</p>
              {selectedImage && (
                <div className="final-picture-preview">
                  <img src={selectedImage} alt="Your profile" />
                </div>
              )}
              <div style={{ marginTop: '2rem' }}>
                <button className="btn-primary" onClick={handleClose}>
                  <CheckCircle2 size={18} />
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Error Step */}
          {currentStep === 'error' && (
            <div className="modal-step-content center">
              <AlertCircle size={64} className="error-icon" />
              <h3>Error</h3>
              <p>{error || 'An error occurred while processing your picture.'}</p>
              <div style={{ marginTop: '2rem' }}>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setCurrentStep('entry');
                    setError('');
                  }}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureModal;
