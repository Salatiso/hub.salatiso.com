# **LifeCV \- Modular Technical Specification v2.0**

Document Version: 2.0  
Date: 2025-07-27

## **1\. Introduction**

This document outlines the refactored, modular architecture for the LifeCV module. The primary goal is to enhance maintainability, scalability, and performance by breaking down the monolithic life-cv.js file into a collection of specialized modules following a controller-service-UI pattern. This specification supersedes previous architectural plans.

## **2\. Architectural Overview**

The new architecture is designed around the principle of **Separation of Concerns**. Each module has a single, well-defined responsibility, making the system easier to understand, debug, and extend.

### **2.1. New File Structure**

The following file structure will be implemented within the /assets/js/ directory:

/assets/js/  
|-- /modules/  
|   |-- life-cv.js               \# CONTROLLER: Main entry point, orchestrates other modules.  
|  
|-- /services/  
|   |-- life-cv-data-service.js  \# SERVICE: Handles all Firestore data interactions.  
|   |-- camera-service.js        \# SERVICE: Manages webcam functionality.  
|   |-- lifesync-service.js      \# SERVICE: (Placeholder) Manages LifeSync logic.  
|  
|-- /ui/  
|   |-- lifecv-renderer.js       \# UI: Builds and renders the main accordion sections.  
|   |-- lifecv-dashboard.js      \# UI: Manages the dashboard component.  
|   |-- lifecv-modals.js         \# UI: Manages all modals (PII, Camera, Public Presence).  
|   |-- lifecv-events.js         \# UI: Handles all user event listeners (clicks, inputs).  
|  
|-- /utils/  
|   |-- qr-code-generator.js     \# UTILITY: (Placeholder) Generates QR codes.  
|   |-- helpers.js               \# UTILITY: Common, reusable functions.

### **2.2. Data Flow**

The flow of information is now standardized:

1. **Events Module (lifecv-events.js)** captures user interactions (e.g., a key press).  
2. It calls a function in the **Data Service (life-cv-data-service.js)** to update the local data state and save it to Firestore.  
3. The **Data Service**'s real-time listener receives the updated data from Firestore.  
4. The **Controller (life-cv.js)** is notified of the new data.  
5. The **Controller** passes the new data to the **UI Modules** (lifecv-renderer.js, lifecv-dashboard.js) to update the screen.

This creates a predictable, one-way data flow that prevents bugs and makes the application easier to reason about.

## **3\. Module API Definitions**

### **3.1. life-cv.js (Controller)**

* **init(user)**: The main entry point. Initializes all other modules in the correct order.  
* **handleDataUpdate(data)**: A callback function passed to the data service. It triggers UI updates in the renderer and dashboard when data changes.

### **3.2. life-cv-data-service.js (Data Service)**

* **init(userId, onDataUpdateCallback)**: Sets up the real-time Firestore listener for the user's LifeCV document. Calls the provided callback whenever data is updated.  
* **getLifeCvData()**: Returns the current local cache of the user's LifeCV data.  
* **getLifeCvSections()**: Returns the static configuration object for the LifeCV sections.  
* **saveLifeCvData()**: Saves the entire local data cache to Firestore.  
* **updateField(path, value)**: A debounced function to update a specific field in the local cache and then save the entire document.

### **3.3. lifecv-renderer.js (UI Renderer)**

* **renderAllSections(data, sectionsConfig)**: Clears and redraws the entire accordion section container based on the provided data.

### **3.4. lifecv-dashboard.js (Dashboard UI)**

* **init()**: Fetches the lifecv-dashboard.html component and injects it into the main page.  
* **update(data, sectionsConfig)**: Populates the dashboard with fresh data, calculating completeness and generating recommendations.

### **3.5. lifecv-modals.js (Modals UI)**

* **init()**: Attaches event listeners for all modal trigger buttons.  
* **showPiiConfirmModal(path, callback)**: Displays the PII confirmation modal and executes the callback upon successful confirmation.  
* **showCameraModal(uploadCallback)**: Manages the camera modal, using the camera-service to capture an image and executing the upload callback with the resulting blob.  
* **showPublicPresenceModal()**: Shows the placeholder modal for public profile management.

### **3.6. lifecv-events.js (Event Handler)**

* **init()**: Attaches the primary event listeners for clicks and inputs to the main LifeCV container. It will import and use functions from the data service and modal modules to respond to user actions.

### **3.7. helpers.js (Utilities)**

* **setObjectValueByPath(obj, path, value)**: Exported utility function.  
* **getObjectValueByPath(obj, path)**: Exported utility function.

### **2\. Full Code Implementation**

Here is the complete, refactored code based on the new modular architecture.

/\* \================================================================================= \*/  
/\* FILE: assets/js/utils/helpers.js                                                  \*/  
/\* PURPOSE: Contains small, reusable utility functions that can be imported and    \*/  
/\* used by any module across the application.                                        \*/  
/\* \================================================================================= \*/

/\*\*  
 \* Sets a value in a nested object using a dot-notation path.  
 \* Creates nested objects if they don't exist.  
 \* @param {object} obj \- The object to modify.  
 \* @param {string} path \- The path to the property (e.g., 'a.b.c').  
 \* @param {\*} value \- The value to set.  
 \*/  
export function setObjectValueByPath(obj, path, value) {  
    const keys \= path.split('.');  
    let current \= obj;  
    for (let i \= 0; i \< keys.length \- 1; i++) {  
        if (\!current\[keys\[i\]\] || typeof current\[keys\[i\]\] \!== 'object') {  
            current\[keys\[i\]\] \= {};  
        }  
        current \= current\[keys\[i\]\];  
    }  
    current\[keys\[keys.length \- 1\]\] \= value;  
}

/\*\*  
 \* Gets a value from a nested object using a dot-notation path.  
 \* @param {object} obj \- The object to read from.  
 \* @param {string} path \- The path to the property.  
 \* @returns {\*} The value at the specified path, or undefined if not found.  
 \*/  
export function getObjectValueByPath(obj, path) {  
    return path.split('.').reduce((acc, key) \=\> (acc && acc\[key\] \!== undefined ? acc\[key\] : undefined), obj);  
}  
