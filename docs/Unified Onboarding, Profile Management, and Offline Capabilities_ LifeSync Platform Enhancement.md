# **Unified Onboarding, Profile Management, and Offline Capabilities: LifeSync Platform Enhancement**

Document Version: 1.0  
Date: 2025-09-20  
Target Platforms: LifeSync, Pigeeback, eKhaya, FamilyValue

## **1\. Executive Summary**

This document outlines the technical requirements for a significant overhaul of the LifeSync user onboarding process and core application architecture. The primary goal is to create a single, scalable, and intuitive entry point for all users, enhancing functionality for a global audience with a strong emphasis on offline-first capabilities and seamless integration with the entire LifeCV ecosystem (The Hub, Pigeeback, eKhaya, FamilyValue).

## **2\. Unified Onboarding & Authentication Flow**

### **2.1. Objective**

Consolidate the current fragmented registration paths (e.g., /onboarding, /instant-trust) into a single, mandatory, and streamlined user flow. This will serve as the sole entry point to the application's main dashboard.

### **2.2. New User Flow**

1. **Single Entry Point:** All new and returning users will be directed to a unified welcome screen. This screen will gate access to the rest of the application.  
2. **Authentication Options:** The screen will present two primary paths:  
   * **Guest Mode (Default):** For new users who want to start immediately with minimal setup.  
   * **Sign In / Register:** For returning users or new users who wish to create a cloud-synced account from the start.  
3. **Guest Mode Registration:**  
   * **Minimum Required Information:** To ensure core safety features are functional, the guest setup must capture:  
     * Full Names  
     * Contact Number or Email Address  
     * **Explicit** consent to share live **location.** This is non-negotiable for safety features.  
   * **Local Storage:** All guest data will be stored exclusively on the user's device. Leverage and extend the existing GuestContext for this purpose.  
   * **Feature Gating:** Guests can navigate and view the dashboard, but attempting to use interactive features (e.g., starting a trip, reporting an incident) will prompt them to complete their registration.

### **2.3. Progressive Profile Completion & Trust Score**

* Once a user (guest or registered) is on the dashboard, the UI should persistently encourage them to add more information to their profile.  
* This process should be gamified by linking it to the **LifeCV Trust Score**.  
* The existing FacialRecognition.jsx and IDVerification.jsx components should be integrated as optional steps in this progressive flow, not as initial blockers. Successful completion of these steps will significantly boost the user's Trust Score.

## **3\. Global and Offline-First Architecture**

### **3.1. Internationalization**

* **Global Address Fields:** All address input forms must be standardized for international use. Remove any South Africa-specific logic or fields. Use a generic structure:  
  * Address Line 1  
  * Address Line 2 (Optional)  
  * City / Town  
  * State / Province / Region  
  * Postal Code / ZIP Code  
  * Country (Dropdown)  
* **Mandatory GPS Location Confirmation:** This is a critical feature. Every address entered manually must have an accompanying "Confirm with GPS" button. This function will use the device's geolocation API to capture and store precise coordinates associated with the address, ensuring accuracy for safety features.

### **3.2. Offline-First Functionality**

* **Offline Registration:** Users must be able to complete the entire Guest Mode registration process without an internet connection.  
* **Offline Sync:** Core safety features (HitchhikingSafety, RideSharing, LocalNetworking, IncidentReporting) must be fully functional offline.  
  * Data should be queued locally for synchronization when a connection is available.  
  * Peer-to-peer data sharing via local networks (Bluetooth, Wi-Fi Mesh) must be implemented to allow for group synchronization in remote areas. The existing peer.js and syncQueue.js utilities should be reviewed and enhanced to support this.

## **4\. Account Management & Data Portability**

### **4.1. Local Account Enhancements**

* **Device Type Declaration:** During the guest setup process, add a simple step for users to declare their primary device type:  
  * Mobile Device (Phone / Tablet)  
  * Fixed Device (Desktop / Laptop)  
    This information should be stored as part of the local user profile.  
* **Profile Portability:**  
  * Implement an **"Export Profile"** feature that generates a downloadable JSON file containing the user's entire local profile data.  
  * Implement an **"Import Profile"** feature that allows a user to upload the exported JSON file on a different device to seamlessly restore their account. This ensures 100% data compatibility between devices for local accounts.

### **4.2. Ecosystem Compatibility**

* **Unified Data Schema:** The data structure for the LifeSync user profile (both local and registered) MUST be 100% compatible with the user schema on the-hub-lifecv.web.app. This is crucial for seamless data import when a guest user decides to register.  
* **Shared Authentication:** Ensure that a user's LifeSync account credentials can be used to authenticate across all ecosystem apps (Pigeeback, eKhaya, FamilyValue).

## **5\. Simplified & Versatile Profile Creation**

To accelerate profile completion, implement multiple data import methods.

### **5.1. Profile Creation Methods**

* **Manual Entry:** The existing form-based input.  
* **Import from Device Contacts:** Enhance the ContactImportWizard.jsx to allow users to pull in contacts to populate their network.  
* **Scan the Internet:** Allow users to sign in with their Google account to pre-fill basic information (name, email).  
* **Import from Resume (JSON Paste):** This is a key feature to simplify professional data entry.  
  * Create a UI component with a text area where users can paste a JSON object.  
  * Provide clear, step-by-step instructions on how to convert their existing resume into the required JSON format using a public AI tool.

### **5.2. Technical Details for Resume Import**

#### **5.2.1. User Instructions (To be displayed in the app)**

**Build Your Profile Instantly**

You can use any AI assistant (like Gemini, ChatGPT, etc.) to convert your resume into a format we can import instantly.

1. **Copy** your **resume text** from any source (Word, PDF, LinkedIn).  
2. **Open your chosen AI assistant.**  
3. **Paste the entire prompt below** into the AI, replacing \[PASTE YOUR RESUME TEXT HERE\] with your resume content.  
4. **Copy** the JSON **output** from the AI and paste it into the text box below.

**AI Prompt to Copy:**

Act as a data formatter. Convert the following resume text into a single, valid JSON object based on the schema provided. Ensure all keys are present. For dates, use 'YYYY-MM' or 'YYYY' format. For responsibilities, create a list of key achievements. The final output must be only the JSON object, without any surrounding  
