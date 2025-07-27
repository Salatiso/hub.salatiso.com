/* ================================================================================= */
/* FILE: assets/js/services/camera-service.js                                        */
/* PURPOSE: Encapsulates all logic for interacting with the device's camera.         */
/* This service handles requesting camera access, streaming the video, capturing     */
/* a still image, and returning it as a Blob for uploading.                          */
/* ================================================================================= */

/**
 * A class to manage camera interactions.
 */
export default class CameraService {
    constructor(videoElementId = 'webcam-video', canvasElementId = 'capture-canvas') {
        this.videoElementId = videoElementId;
        this.canvasElementId = canvasElementId;
        this.videoElement = null;
        this.canvasElement = null;
        this.stream = null;
        
        // Wait for DOM to be ready before accessing elements
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initElements();
            });
        } else {
            this.initElements();
        }
    }

    initElements() {
        this.videoElement = document.getElementById(this.videoElementId);
        this.canvasElement = document.getElementById(this.canvasElementId);
        
        if (!this.videoElement || !this.canvasElement) {
            console.warn('CameraService: Video or Canvas element not found in the DOM. Elements will be initialized when needed.');
        } else {
            console.log('CameraService: Elements found and initialized.');
        }
    }

    ensureElements() {
        if (!this.videoElement || !this.canvasElement) {
            this.initElements();
        }
        return this.videoElement && this.canvasElement;
    }

    /**
     * Requests camera access and starts streaming the video feed to the video element.
     * @returns {Promise<void>} A promise that resolves when the stream starts, or rejects on error.
     */
    async start() {
        if (!this.ensureElements()) {
            throw new Error('Required video and canvas elements not found');
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            });
            this.videoElement.srcObject = this.stream;
            return true;
        } catch (error) {
            console.error('Error accessing camera:', error);
            throw error;
        }
    }

    /**
     * Stops the camera stream and releases the device.
     */
    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
    }

    /**
     * Captures a single frame from the video stream.
     * @returns {Promise<Blob>} A promise that resolves with the captured image as a Blob.
     */
    async capture() {
        if (!this.ensureElements() || !this.stream) {
            throw new Error('Camera not initialized or elements not found');
        }

        const context = this.canvasElement.getContext('2d');
        this.canvasElement.width = this.videoElement.videoWidth;
        this.canvasElement.height = this.videoElement.videoHeight;
        
        context.drawImage(this.videoElement, 0, 0);
        
        return new Promise(resolve => {
            this.canvasElement.toBlob(resolve, 'image/png');
        });
    }
}
