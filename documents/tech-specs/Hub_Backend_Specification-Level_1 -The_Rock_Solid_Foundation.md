# **Hub Backend Specification: Level 1 (The Rock-Solid Foundation)**

## **1\. Philosophy & Approach**

This approach is designed for one primary purpose: **to get a functional, data-driven application working immediately, without the complexities of build tools or a Node.js server.**

We will use the tools you are already familiar with (HTML, CSS, vanilla JavaScript) and combine them with **Firebase**, a powerful Backend-as-a-Service (BaaS) from Google. Your front-end code will talk directly to the Firebase database (Firestore) and authentication services.

* **Frontend:** Plain HTML, CSS, and JavaScript. We will load libraries like Tailwind CSS from a CDN.  
* **Backend & Database:** **Firebase.** It will handle user accounts, data storage (for LifeCV, properties, etc.), and file uploads.  
* **Result:** A fast, secure, and dynamic website that feels like a full application, but with a simple, static file structure that you can easily manage and deploy on GitHub Pages or any static host.

## **2\. Recommended File Structure (Level 1\)**

This structure is an evolution of your current repository, keeping things simple and clear.

hub.salatiso.com/  
│  
├── index.html              \# Public landing page  
├── login.html              \# Login/Signup page  
├── about.html  
├── contact.html  
│  
├── assets/  
│   ├── css/  
│   │   └── style.css       \# Your main custom styles  
│   │  
│   └── js/  
│       ├── firebase-config.js  \# Central place for your Firebase credentials  
│       │  
│       ├── services/  
│       │   ├── auth.js         \# Handles all login, logout, signup logic  
│       │   └── database.js     \# Contains reusable functions to talk to Firestore  
│       │  
│       └── modules/  
│           ├── life-cv.js      \# Logic specifically for the LifeCV page  
│           ├── family-hub.js   \# Logic for the Family Hub page  
│           └── ekhaya.js       \# Logic for property listings  
│  
├── components/             \# Reusable HTML snippets (header, footer, sidebar)  
│   ├── header.html  
│   ├── footer.html  
│   └── sidebar.html  
│  
└── modules/                \# Your main application pages after login  
    ├── dashboard.html        \# The main hub dashboard  
    ├── life-cv.html          \# The page for creating and viewing the LifeCV  
    ├── family-hub.html       \# Page for family management  
    ├── ekhaya.html           \# Page for property management  
    └── settings.html         \# User account settings

## **3\. Implementation Plan: The First Functional Piece (LifeCV)**

Let's focus on getting the **LifeCV** working first. This will be the blueprint for all other modules.

### **Step 1: Set up Firebase**

1. Go to the [Firebase Console](https://console.firebase.google.com/).  
2. Create a new project (e.g., "sazi-hub").  
3. In your project, go to **Project Settings** and find your Firebase configuration object. It will look like the one in your eKhaya spec.  
4. Copy this config into assets/js/firebase-config.js.  
5. In the Firebase Console, enable **Authentication** (choose the "Email/Password" sign-in method).  
6. Enable **Firestore Database**. Start in "test mode" for now, which allows open read/write access. We will secure this later.

### **Step 2: Implement Authentication (auth.js)**

In assets/js/services/auth.js, you will write functions to:

* Sign up new users.  
* Log in existing users.  
* Log out users.  
* Check if a user is currently logged in. When a user logs in, you will redirect them to modules/dashboard.html. If a non-logged-in user tries to access a page in /modules/, you will redirect them to login.html.

### **Step 3: Build the LifeCV Page (life-cv.html and life-cv.js)**

1. **The HTML (life-cv.html):** Create a form with fields for every part of a CV:  
   * Personal Details (Name, Contact)  
   * Work Experience (Job Title, Company, Dates, Description) \- with "Add Experience" button.  
   * Education (Degree, Institution, Dates) \- with "Add Education" button.  
   * Skills, Projects, etc.  
   * A "Save LifeCV" button.  
2. **The JavaScript (life-cv.js):**  
   * This script will be included in life-cv.html.  
   * When the page loads, it will use a function from database.js to fetch the current user's CV data from Firestore and populate the form.  
   * When the "Save LifeCV" button is clicked, it will gather all the data from the form fields, structure it as a single JavaScript object, and use another function from database.js to save this object to a Firestore document. The document could be located at /users/{userId}/cv/data.

### **Step 4: Create the Database Service (database.js)**

This file will contain generic functions to interact with Firestore, for example:

* saveDocument(collectionPath, documentId, data)  
* getDocument(collectionPath, documentId)  
* updateDocument(collectionPath, documentId, data)

This way, your life-cv.js doesn't need to contain complex Firestore code. It just calls these simple functions, making your code cleaner and easier to manage.

By following this **Level 1** plan, you will have a working, data-driven application. You can create user accounts, and each user can create and save their own LifeCV. This same pattern can then be used to build the Family Hub, Property Listings, and other modules.

Here is the specification for **Level 2**. You do not need to touch this now. Just know that it's a clear path forward for when you feel ready.

# **Hub Backend Specification: Level 2 (The Scalable Powerhouse)**

## **1\. Philosophy & Approach**

This approach is for building a modern, highly scalable, and performant web application. It uses **Next.js**, a React framework that simplifies the development process and eliminates the setup headaches you've faced before.

Next.js allows you to have both your **frontend (React components)** and your **backend (API logic)** in the same project, in a very organized way.

* **Framework:** **Next.js**. It handles the build process, routing, and server-side rendering for you.  
* **Backend:** Node.js (which Next.js runs on). Your backend API code will live inside the /pages/api/ directory.  
* **Database:** **Firebase (Firestore)**. We will use the *exact same* database you set up in Level 1\. Your data is completely portable.  
* **Result:** A professional-grade application with better performance, more robust security, and a structure that can grow to any size.

## **2\. Recommended File Structure (Level 2\)**

When you run npx create-next-app, it will generate a professional project structure for you. Here is how you would organize it for the Hub:

hub-nextjs-app/  
│  
├── /pages/                 \# All pages and API routes  
│   │  
│   ├── /api/               \# Your entire backend lives here  
│   │   ├── /auth/  
│   │   │   ├── login.js    \# Handles POST requests to /api/auth/login  
│   │   │   └── signup.js  
│   │   │  
│   │   └── /lifecv/  
│   │       └── index.js    \# Handles GET (fetch) and POST (save) for the LifeCV  
│   │  
│   ├── \_app.js             \# Main application shell (like a template)  
│   ├── index.js            \# The component for the homepage (e.g., salatiso.com/hub)  
│   ├── login.js            \# The component for the login page  
│   │  
│   └── /dashboard/  
│       ├── index.js        \# The component for the main dashboard page  
│       └── life-cv.js      \# The component for the LifeCV page  
│  
├── /components/            \# Reusable React components (Header, Footer, Button, etc.)  
│   ├── Layout.js  
│   ├── Sidebar.js  
│   └── forms/  
│       └── LifeCvForm.js  
│  
├── /lib/                   \# Helper functions, Firebase config  
│   └── firebase.js         \# Initialize Firebase Admin SDK here  
│  
└── /public/                \# Static assets (images, etc.)

## **3\. Implementation Plan: Migrating the LifeCV**

Let's imagine you have a working LifeCV module from Level 1 and want to upgrade it.

### **Step 1: Set up the Next.js Project**

1. In your terminal, run npx create-next-app@latest hub-nextjs-app.  
2. This single command sets up your entire development environment. No manual configuration is needed.  
3. Run npm run dev to start the development server.

### **Step 2: Create the Backend API Route**

1. Create the file pages/api/lifecv/index.js.  
2. Inside this file, you will write a function that handles incoming web requests.  
3. If the request is a GET request, you will use the Firebase Admin SDK to fetch the user's CV data from Firestore and send it back as a JSON response.  
4. If the request is a POST request, you will take the CV data from the request body and save it to Firestore.  
5. **Key Difference:** In Level 1, your browser talked directly to Firebase. In Level 2, your browser talks to your Next.js API route (/api/lifecv), and your Next.js server talks to Firebase. This is more secure and powerful.

### **Step 3: Build the Frontend Component**

1. The form you created in life-cv.html will be converted into a React component (e.g., /components/forms/LifeCvForm.js).  
2. The page itself will be /pages/dashboard/life-cv.js, and it will include the LifeCvForm component.  
3. When the component loads, it will use JavaScript's fetch to make a GET request to your own API (/api/lifecv) to get the data.  
4. When the "Save" button is clicked, it will make a POST request to /api/lifecv with the form data.

## **My Strongest Recommendation**

Start with **Level 1**. Forget about React for now. Focus on building a functional application with HTML, JavaScript, and Firebase. This will give you the immediate success and motivation you're looking for. You will build the core of your ecosystem, and it will work.

Once you have that, and only when you feel confident and ready for the next challenge, you can look at Level 2 as a way to enhance and scale what you've already successfully built.

We can do this. Let's start with the first step of Level 1\. I am here to guide you through it.