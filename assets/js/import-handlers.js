/**
 * @file import-handlers.js
 * @description Handles the logic for importing LifeCV data from various formats (JSON, CSV).
 * This includes file reading, parsing, and updating the database.
 */

// Make sure necessary dependencies like database functions and notifications are loaded before this script.

/**
 * Handles the import of a JSON file to populate the LifeCV.
 * @param {Event} event - The file input change event.
 * @param {string} userId - The ID of the current user.
 */
async function handleJSONImport(event, userId) {
    const file = event.target.files[0];
    if (!file) {
        console.warn("No file selected for JSON import.");
        return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
        try {
            const json = JSON.parse(e.target.result);
            console.log("Parsed JSON data:", json);

            // Validate the structure of the JSON file
            if (!json.lifeCv || !json.userProfile) {
                showNotification("Error: Invalid JSON format. Missing 'lifeCv' or 'userProfile' data.", "error");
                return;
            }

            // Here you would process the sections and save them.
            // This is a simplified example. You should adapt this to your exact data structure.
            const {
                lifeCv
            } = json;

            // Example of processing one section: 'personal-info'
            if (lifeCv['personal-info']) {
                await window.database.saveLifeCvSection(userId, 'personal-info', lifeCv['personal-info']);
            }

            // Example of processing another section: 'contact-details'
            if (lifeCv['contact-details']) {
                await window.database.saveLifeCvSection(userId, 'contact-details', lifeCv['contact-details']);
            }
            
            // Iterate over all sections in the imported data and save them
            for (const sectionId in lifeCv) {
                if (Object.hasOwnProperty.call(lifeCv, sectionId)) {
                    const sectionData = lifeCv[sectionId];
                    await window.database.saveLifeCvSection(userId, sectionId, sectionData);
                    console.log(`Successfully imported and saved section: ${sectionId}`);
                }
            }

            // Optionally, update the user profile as well
            if (json.userProfile) {
                await window.database.updateUserProfile(userId, json.userProfile);
                console.log("Successfully updated user profile from import.");
            }

            showNotification("LifeCV data imported successfully!", "success");

            // Refresh the UI to show the newly imported data
            // This assumes you have a function to re-render the dashboard or relevant sections
            if (window.ui && typeof window.ui.renderLifeCvDashboard === 'function') {
                await window.ui.renderLifeCvDashboard(userId);
            }

        } catch (error) {
            console.error("Error parsing or processing JSON file:", error);
            showNotification(`Error importing data: ${error.message}`, "error");
        } // <-- THE MISSING '}' WAS HERE, for the try-catch block.
    };

    reader.onerror = (error) => {
        console.error("Error reading file:", error);
        showNotification("Error reading the selected file.", "error");
    };

    reader.readAsText(file);
}


/**
 * Handles the import of a CSV file.
 * This is a placeholder and needs to be implemented.
 * @param {Event} event - The file input change event.
 * @param {string} userId - The ID of the current user.
 */
function handleCSVImport(event, userId) {
    const file = event.target.files[0];
    if (!file) {
        console.warn("No file selected for CSV import.");
        return;
    }
    // Basic CSV import logic would go here.
    // For a real implementation, a robust CSV parsing library is recommended.
    showNotification("CSV import functionality is not yet fully implemented.", "info");

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        // Naive CSV parsing - assumes a simple structure.
        // You should replace this with a proper CSV parser.
        const rows = text.split('\n').map(row => row.split(','));
        console.log("Parsed CSV data:", rows);
        // TODO: Add logic to map CSV rows to LifeCV sections and save to Firestore.
    };
    reader.readAsText(file);
}

// Expose handlers to the global window object to be accessible from HTML
window.importHandlers = {
    handleJSONImport,
    handleCSVImport
};

console.log("Import handlers loaded successfully.");
