/* ================================================================================= */
/* FILE: /assets/js/database.js (SERVICE - CORRECTED & COMPLETE)                     */
/* PURPOSE: Provides a set of reusable functions for interacting with Firestore.     */
/* FIX: Now correctly exports all necessary functions including setDoc and           */
/* getDocumentsRealtime to support all FinHelp modules.                              */
/* ================================================================================= */
import { db } from './firebase-config.js';
import { 
    doc, 
    setDoc, 
    getDoc, 
    addDoc,
    updateDoc,
    deleteDoc, 
    collection, 
    getDocs, 
    query, 
    where,
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

/**
 * Saves or merges data into a specific document. Creates the doc if it doesn't exist.
 * @param {string} collectionPath - The path to the collection (e.g., 'users').
 * @param {string} documentId - The ID of the document to save.
 * @param {object} data - The data to save.
 * @returns {Promise<void>}
 */
export const saveDocument = (collectionPath, documentId, data) => {
    return setDoc(doc(db, collectionPath, documentId), data, { merge: true });
};

/**
 * Updates specific fields of an existing document without overwriting the entire document.
 * @param {string} collectionPath - The path to the collection.
 * @param {string} documentId - The ID of the document to update.
 * @param {object} data - An object containing the fields and values to update.
 * @returns {Promise<void>}
 */
export const updateDocument = (collectionPath, documentId, data) => {
    const docRef = doc(db, collectionPath, documentId);
    return updateDoc(docRef, data);
};

/**
 * Retrieves a single document from Firestore.
 * @param {string} collectionPath - The path to the collection.
 * @param {string} documentId - The ID of the document to retrieve.
 * @returns {Promise<object|null>} The document data or null if it doesn't exist.
 */
export const getDocument = async (collectionPath, documentId) => {
    const docRef = doc(db, collectionPath, documentId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

/**
 * Deletes a single document from Firestore.
 * @param {string} collectionPath - The path to the collection.
 * @param {string} documentId - The ID of the document to delete.
 * @returns {Promise<void>}
 */
export const deleteDocument = (collectionPath, documentId) => {
    return deleteDoc(doc(db, collectionPath, documentId));
};

/**
 * Adds a new document to a collection with an auto-generated ID.
 * @param {string} collectionPath - The path to the collection.
 * @param {object} data - The data for the new document.
 * @returns {Promise<import("firebase/firestore").DocumentReference>} A reference to the newly created document.
 */
export const addDocument = (collectionPath, data) => {
    return addDoc(collection(db, collectionPath), data);
};

/**
 * Retrieves all documents from a collection that match a query.
 * @param {string} collectionPath - The path to the collection.
 * @param {object} [queryCondition] - Optional. An object with { field, operator, value }.
 * @returns {Promise<Array<object>>} An array of document objects.
 */
export const getDocuments = async (collectionPath, queryCondition) => {
    const collRef = collection(db, collectionPath);
    let q = query(collRef);
    if (queryCondition) {
        q = query(collRef, where(queryCondition.field, queryCondition.operator, queryCondition.value));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Listens for real-time updates on a collection.
 * @param {string} collectionPath - The path to the collection.
 * @param {Function} callback - The function to call with the updated data.
 * @param {object} [queryCondition] - Optional. An object with { field, operator, value }.
 * @returns {import("firebase/firestore").Unsubscribe} A function to unsubscribe from the listener.
 */
export const getDocumentsRealtime = (collectionPath, callback, queryCondition) => {
    const collRef = collection(db, collectionPath);
    let q = query(collRef);
     if (queryCondition) {
        q = query(collRef, where(queryCondition.field, queryCondition.operator, queryCondition.value));
    }
    return onSnapshot(q, (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
    });
};


// Re-exporting the core setDoc function for modules that need it directly.
export { setDoc };
