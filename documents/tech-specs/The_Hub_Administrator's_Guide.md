# **The Hub: Administrator's Guide**

## **1\. Overview**

As the administrator of The Hub, you have oversight of the core platform infrastructure, which is managed through the Google Firebase console. This guide provides a high-level overview of key administrative tasks.

## **2\. User Management**

All user accounts are managed through **Firebase Authentication**.

* **Location:** Firebase Console \> Authentication \> Users  
* **Tasks:**  
  * **View Users:** You can see a list of all registered users, their email addresses, and their unique User ID (UID).  
  * **Disable/Enable Accounts:** You can temporarily disable an account if there is a security concern.  
  * **Reset Passwords:** You can trigger a password reset email for a user who is locked out.  
  * **Delete Users:** You can permanently delete a user account and all their associated data.

## **3\. Database Management**

All application data is stored in **Firestore**.

* **Location:** Firebase Console \> Firestore Database \> Data  
* **Collections:** You will see the core collections we have built:  
  * users: Contains user-specific settings.  
  * lifecv: Contains all LifeCV data, with each document named after a User ID.  
  * families: Contains all Family Hub data.  
  * properties: Contains all eKhaya property listings.  
* **Tasks:**  
  * **View Data:** You can browse the database to see the data stored for any user or family. This is useful for debugging.  
  * **Manual Edits:** You can manually edit or delete documents if necessary to correct an error. **Caution:** This should be done with extreme care, as incorrect edits can break a user's experience.

## **4\. File Management**

All user-uploaded files are stored in **Firebase Storage**.

* **Location:** Firebase Console \> Storage \> Files  
* **Structure:** Files are organized into folders based on their purpose (e.g., propertyImages), and then into subfolders based on the User ID of the person who uploaded them.  
* **Tasks:**  
  * **View Files:** You can browse and view all uploaded files.  
  * **Delete Files:** You can manually delete files if needed (e.g., to remove inappropriate content).

## **5\. Security Rules**

The security of your users' data is controlled by **Firestore Security Rules**.

* **Location:** Firebase Console \> Firestore Database \> Rules  
* **Current Status (Test Mode):** The rules are currently set to allow open read/write access for easy development.  
* **CRITICAL NEXT STEP:** Before launching to the public, these rules **must** be updated to be secure. For example, a user should only be able to read and write their own LifeCV document. A typical rule would look like this:  
  match /lifecv/{userId} {  
    allow read, write: if request.auth.uid \== userId;  
  }

  This ensures that only the authenticated user can access their own data. We will implement these secure rules as a final step before a public launch.