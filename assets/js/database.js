/* ================================================================================= */
/* FILE: /assets/js/database.js (CORRECTED)                                          */
/* ================================================================================= */
import { db } from './firebase-config.js'; // CORRECTED PATH
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, query, where, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

export const saveDocument = async (collectionPath, documentId, data) => setDoc(doc(db, collectionPath, documentId), data, { merge: true });
export const getDocument = async (collectionPath, documentId) => {
    const docSnap = await getDoc(doc(db, collectionPath, documentId));
    return docSnap.exists() ? docSnap.data() : null;
};
export const deleteDocument = async (collectionPath, documentId) => deleteDoc(doc(db, collectionPath, documentId));
export const addDocument = async (collectionPath, data) => addDoc(collection(db, collectionPath), data);
export const getDocuments = async (collectionPath, queryCondition) => {
    const q = query(collection(db, collectionPath), where(queryCondition.field, queryCondition.operator, queryCondition.value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

