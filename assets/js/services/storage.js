/* ================================================================================= */
/* FILE: assets/js/services/storage.js (NEW FILE)                                    */
/* PURPOSE: To provide reusable functions for interacting with Firebase Storage.     */
/* ================================================================================= */

import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import { auth } from "../firebase-config.js";

const storage = getStorage();

/**
 * Uploads a file to a specific path in Firebase Storage and reports progress.
 * @param {File} file - The file to upload.
 * @param {string} path - The destination path in storage (e.g., 'propertyImages').
 * @param {function} progressCallback - A function to call with upload progress (0-100).
 * @returns {Promise<string>} A promise that resolves with the public download URL of the file.
 */
export const uploadFile = (file, path, progressCallback) => {
    return new Promise((resolve, reject) => {
        const userId = auth.currentUser.uid;
        if (!userId) return reject("User not authenticated.");

        // Create a unique file name to prevent overwrites
        const fileName = `${Date.now()}-${file.name}`;
        const storageRef = ref(storage, `${path}/${userId}/${fileName}`);

        const uploadTask = uploadBytesResumable(storageRef, file);

        // Register the three observers:
        // 1. 'state_changed' observer, called any time the state changes
        // 2. Error observer, called on failure
        // 3. Completion observer, called on successful completion
        uploadTask.on('state_changed', 
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                progressCallback(progress);
            }, 
            (error) => {
                // Handle unsuccessful uploads
                console.error("Upload failed:", error);
                reject(error);
            }, 
            () => {
                // Handle successful uploads on complete
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    resolve(downloadURL);
                });
            }
        );
    });
};


/* ================================================================================= */
/* FILE: assets/js/services/database.js (REVISED)                                    */
/* PURPOSE: Adding delete functionality.                                             */
/* ================================================================================= */

import { db } from '../firebase-config.js';
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// saveDocument and getDocument functions remain the same...

export const saveDocument = async (collectionPath, documentId, data) => {
    try {
        const docRef = doc(db, collectionPath, documentId);
        await setDoc(docRef, data, { merge: true });
    } catch (error) {
        console.error("Error writing document: ", error);
        throw error;
    }
};

export const getDocument = async (collectionPath, documentId) => {
    try {
        const docRef = doc(db, collectionPath, documentId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error("Error getting document:", error);
        throw error;
    }
};

/**
 * Gets all documents from a collection that match a specific query.
 * @param {string} collectionPath - The path to the collection.
 * @param {object} queryCondition - An object with { field, operator, value }.
 * @returns {Promise<Array>} A promise that resolves with an array of documents.
 */
export const getDocuments = async (collectionPath, queryCondition) => {
    try {
        const collectionRef = collection(db, collectionPath);
        const q = query(collectionRef, where(queryCondition.field, queryCondition.operator, queryCondition.value));
        const querySnapshot = await getDocs(q);
        const documents = [];
        querySnapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() });
        });
        return documents;
    } catch (error) {
        console.error("Error getting documents: ", error);
        throw error;
    }
};

/**
 * Deletes a document from a Firestore collection.
 * @param {string} collectionPath - The path to the collection.
 * @param {string} documentId - The ID of the document to delete.
 * @returns {Promise<void>}
 */
export const deleteDocument = async (collectionPath, documentId) => {
    try {
        await deleteDoc(doc(db, collectionPath, documentId));
        console.log("Document successfully deleted:", documentId);
    } catch (error) {
        console.error("Error deleting document: ", error);
        throw error;
    }
};


/* ================================================================================= */
/* FILE: assets/js/modules/ekhaya.js (NEW FILE)                                      */
/* PURPOSE: The main controller script for the ekhaya.html page.                   */
/* ================================================================================= */

import { auth } from '../firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { saveDocument, getDocuments, deleteDocument } from '../services/database.js';
import { uploadFile } from '../services/storage.js';

if (document.getElementById('property-list-container')) {

    // --- DOM Element References ---
    const listContainer = document.getElementById('property-list-container');
    const formContainer = document.getElementById('property-form-container');
    const propertyForm = document.getElementById('property-form');
    const addPropertyBtn = document.getElementById('add-property-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const statusBox = document.getElementById('status-box');
    const loadingState = document.getElementById('loading-state');
    const imageInput = document.getElementById('property-image');
    const imageLabel = document.getElementById('image-label-text');
    const uploadProgress = document.getElementById('upload-progress');
    
    let currentUserId = null;
    let mainImageUrl = null; // To hold the URL of the uploaded image

    // --- Helper function to show status messages ---
    const showStatus = (message, isError = false) => {
        statusBox.textContent = message;
        statusBox.className = `p-3 mb-6 text-center text-sm rounded-lg ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
        statusBox.classList.remove('hidden');
        setTimeout(() => statusBox.classList.add('hidden'), 4000);
    };

    // --- UI Functions ---
    const showForm = (show = true) => {
        formContainer.classList.toggle('hidden', !show);
        addPropertyBtn.classList.toggle('hidden', show);
    };

    const resetForm = () => {
        propertyForm.reset();
        propertyForm['property-id'].value = '';
        mainImageUrl = null;
        imageLabel.textContent = 'Upload Main Image';
        uploadProgress.classList.add('hidden');
        document.getElementById('form-title').textContent = 'List a New Property';
    };

    // --- Data Rendering ---
    const renderProperties = (properties) => {
        listContainer.innerHTML = ''; // Clear existing content
        if (properties.length === 0) {
            listContainer.innerHTML = `<p class="text-slate-500 col-span-full text-center">You haven't listed any properties yet. Click 'List New Property' to get started.</p>`;
        } else {
            properties.forEach(prop => {
                const card = document.createElement('div');
                card.className = 'card overflow-hidden';
                card.innerHTML = `
                    <img src="${prop.imageUrl || 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image'}" alt="${prop.title}" class="w-full h-48 object-cover">
                    <div class="p-4">
                        <h4 class="font-bold text-lg">${prop.title}</h4>
                        <p class="text-blue-600 font-semibold mt-1">R ${Number(prop.price).toLocaleString()}</p>
                        <p class="text-sm text-slate-600 mt-2 truncate">${prop.description}</p>
                        <div class="flex justify-end space-x-2 mt-4">
                            <button class="edit-btn text-sm text-blue-500 hover:underline" data-id="${prop.id}">Edit</button>
                            <button class="delete-btn text-sm text-red-500 hover:underline" data-id="${prop.id}">Delete</button>
                        </div>
                    </div>
                `;
                listContainer.appendChild(card);
            });
        }
    };

    // --- Data Handling ---
    const loadProperties = async () => {
        if (!currentUserId) return;
        loadingState.classList.remove('hidden');
        listContainer.innerHTML = '';

        try {
            const properties = await getDocuments('properties', { field: 'ownerId', operator: '==', value: currentUserId });
            renderProperties(properties);
        } catch (error) {
            showStatus("Failed to load properties.", true);
        } finally {
            loadingState.classList.add('hidden');
        }
    };

    // --- Event Handlers ---
    addPropertyBtn.addEventListener('click', () => {
        resetForm();
        showForm(true);
    });

    cancelBtn.addEventListener('click', () => {
        showForm(false);
        resetForm();
    });

    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        imageLabel.textContent = 'Uploading...';
        uploadProgress.classList.remove('hidden');
        uploadProgress.value = 0;

        try {
            mainImageUrl = await uploadFile(file, 'propertyImages', (progress) => {
                uploadProgress.value = progress;
            });
            imageLabel.textContent = `Uploaded: ${file.name}`;
            showStatus("Image uploaded successfully!", false);
        } catch (error) {
            showStatus("Image upload failed. Please try again.", true);
            imageLabel.textContent = 'Upload Main Image';
        }
    });

    propertyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUserId) return showStatus("Authentication error.", true);

        const propertyId = propertyForm['property-id'].value || Date.now().toString();
        const data = {
            ownerId: currentUserId,
            title: propertyForm['property-title'].value,
            description: propertyForm['property-description'].value,
            price: propertyForm['property-price'].value,
            bedrooms: propertyForm['property-bedrooms'].value,
            bathrooms: propertyForm['property-bathrooms'].value,
            imageUrl: mainImageUrl, // Use the URL from the upload
        };

        try {
            await saveDocument('properties', propertyId, data);
            showStatus("Property saved successfully!", false);
            showForm(false);
            resetForm();
            loadProperties();
        } catch (error) {
            showStatus("Failed to save property.", true);
        }
    });
    
    listContainer.addEventListener('click', async (e) => {
        const target = e.target;
        const propertyId = target.dataset.id;

        if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this property?')) {
                try {
                    await deleteDocument('properties', propertyId);
                    showStatus('Property deleted.', false);
                    loadProperties();
                } catch {
                    showStatus('Failed to delete property.', true);
                }
            }
        }
        
        if (target.classList.contains('edit-btn')) {
            // This is a simplified edit. A full implementation would fetch the doc
            // and populate the form. For now, it just opens the form.
            showStatus('Editing is not fully implemented in this version. Please create a new listing.', false);
            // resetForm();
            // showForm(true);
            // document.getElementById('form-title').textContent = 'Edit Property';
            // propertyForm['property-id'].value = propertyId;
        }
    });

    // --- Initialization ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUserId = user.uid;
            loadProperties();
        } else {
            window.location.replace('/login.html');
        }
    });
}
