/**
 * Camera Service for handling webcam/phone camera capture and file uploads
 */
export class CameraService {
    constructor() {
        this.stream = null;
        this.video = null;
        this.canvas = null;
        this.context = null;
    }

    /**
     * Initialize camera access
     */
    async initializeCamera(videoElement) {
        try {
            this.video = videoElement;
            
            // Request camera access with preference for front camera on mobile
            const constraints = {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user' // Front camera
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            
            return new Promise((resolve, reject) => {
                this.video.onloadedmetadata = () => {
                    this.video.play();
                    resolve();
                };
                this.video.onerror = reject;
            });
        } catch (error) {
            console.error('Error accessing camera:', error);
            throw new Error('Unable to access camera. Please check permissions.');
        }
    }

    /**
     * Capture photo from video stream
     */
    capturePhoto() {
        if (!this.video || !this.stream) {
            throw new Error('Camera not initialized');
        }

        // Create canvas if not exists
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.context = this.canvas.getContext('2d');
        }

        // Set canvas dimensions to match video
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        // Draw current video frame to canvas
        this.context.drawImage(this.video, 0, 0);

        // Convert to blob
        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => {
                resolve({
                    blob: blob,
                    dataUrl: this.canvas.toDataURL('image/jpeg', 0.8),
                    width: this.canvas.width,
                    height: this.canvas.height
                });
            }, 'image/jpeg', 0.8);
        });
    }

    /**
     * Stop camera stream
     */
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.video) {
            this.video.srcObject = null;
        }
    }

    /**
     * Check if camera is supported
     */
    static isCameraSupported() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    /**
     * Process uploaded file
     */
    static processUploadedFile(file) {
        return new Promise((resolve, reject) => {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                reject(new Error('Please select an image file'));
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                reject(new Error('File size must be less than 5MB'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Create canvas for resizing
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Calculate new dimensions (max 800x800)
                    const maxDimension = 800;
                    let { width, height } = img;

                    if (width > height) {
                        if (width > maxDimension) {
                            height = (height * maxDimension) / width;
                            width = maxDimension;
                        }
                    } else {
                        if (height > maxDimension) {
                            width = (width * maxDimension) / height;
                            height = maxDimension;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // Draw and compress
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob((blob) => {
                        resolve({
                            blob: blob,
                            dataUrl: canvas.toDataURL('image/jpeg', 0.8),
                            width: width,
                            height: height,
                            originalFile: file
                        });
                    }, 'image/jpeg', 0.8);
                };
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Create circular crop of image
     */
    static createCircularCrop(imageDataUrl, size = 200) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = size;
                canvas.height = size;

                // Create circular clipping path
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();

                // Calculate crop dimensions (center crop)
                const minDimension = Math.min(img.width, img.height);
                const cropX = (img.width - minDimension) / 2;
                const cropY = (img.height - minDimension) / 2;

                // Draw cropped image
                ctx.drawImage(
                    img,
                    cropX, cropY, minDimension, minDimension,
                    0, 0, size, size
                );

                canvas.toBlob((blob) => {
                    resolve({
                        blob: blob,
                        dataUrl: canvas.toDataURL('image/jpeg', 0.9),
                        width: size,
                        height: size
                    });
                }, 'image/jpeg', 0.9);
            };
            img.src = imageDataUrl;
        });
    }

    /**
     * Upload image to Firebase Storage
     */
    static async uploadToFirebase(blob, userId, filename = null) {
        try {
            // Import Firebase Storage
            const { getStorage, ref, uploadBytes, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js');
            const { initializeApp } = await import('../firebase-config.js');
            
            const app = await initializeApp();
            const storage = getStorage(app);
            
            // Generate filename if not provided
            if (!filename) {
                filename = `profile-${Date.now()}.jpg`;
            }
            
            // Create storage reference
            const storageRef = ref(storage, `profile-pictures/${userId}/${filename}`);
            
            // Upload file
            const snapshot = await uploadBytes(storageRef, blob);
            
            // Get download URL
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            return {
                url: downloadURL,
                path: snapshot.ref.fullPath,
                size: snapshot.metadata.size
            };
        } catch (error) {
            console.error('Error uploading to Firebase:', error);
            throw new Error('Failed to upload image. Please try again.');
        }
    }

    /**
     * Delete image from Firebase Storage
     */
    static async deleteFromFirebase(imagePath) {
        try {
            const { getStorage, ref, deleteObject } = await import('https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js');
            const { initializeApp } = await import('../firebase-config.js');
            
            const app = await initializeApp();
            const storage = getStorage(app);
            
            const storageRef = ref(storage, imagePath);
            await deleteObject(storageRef);
            
            return true;
        } catch (error) {
            console.error('Error deleting from Firebase:', error);
            throw new Error('Failed to delete image.');
        }
    }
}

export default CameraService;