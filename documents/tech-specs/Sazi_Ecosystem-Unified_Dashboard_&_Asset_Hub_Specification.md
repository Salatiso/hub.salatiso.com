# **Sazi Ecosystem: Unified Dashboard & Asset Hub Specification**

Document ID: ECO-DASH-SPEC-V2.4

Date: 2025-07-15

Status: Final

## **1\. Vision & Guiding Principles**

This document outlines the architecture for the **Sazi Ecosystem**, a unified platform where a user's identity, assets, and learning journey are managed from a central hub, while individual platforms (SafetyHelp, eKhaya, etc.) operate as distinct commercial entities.

* **Guiding Principles:**  
  * **Unified Identity, Independent Operations:** A user has one identity (SSO), but each platform is a distinct commercial entity.  
  * **Central Hub as Mission Control:** The dashboard at hub.sazi.life is the user's single point of entry.  
  * **Record-Keeping as the Core Service:** The primary value is providing users with tools to manage their life's data and seamlessly leverage it.

## **2\. Phased Technical Implementation**

* **Phase 1 (2025): Static First with Dynamic Components**  
  * **Technology:** HTML, Tailwind CSS, and vanilla JavaScript, interacting directly with Firebase services.  
  * **Rationale:** Maximum performance, security, and low initial cost.  
* **Phase 2 (2026): Migration to React**  
  * **Technology:** Next.js framework.  
  * **Rationale:** Enable complex state management and richer component architecture.

## **3\. Central Firebase Project & Authentication**

All platforms **MUST** use the following central Firebase project.

* **Project ID:** lifecv-d2724  
* **Full Configuration:**

const firebaseConfig \= {

  apiKey: "AIzaSyD\_pRVkeVzciCPowxsj44NRVlbyZvFPueI",

  authDomain: "lifecv-d2724.firebaseapp.com",

  projectId: "lifecv-d2724",

  storageBucket: "lifecv-d2724.firebasestorage.app",

  messagingSenderId: "1039752653127",

  appId: "1:1039752653127:web:54afa09b21c98ef231c462",

  measurementId: "G-BDCNHBQTR2"

};

*   
* **Enabled Sign-On Methods:** Email/Password, Google, Anonymous.

## **4\. Architecture for Commercial Independence (Federated Data Model)**

* **How It Works:** User identity is unified in /users/{userId}. Each platform's commercial data (e.g., subscriptions) is stored in its own separate, top-level collection (e.g., /safetyhelp\_subscriptions/{userId}). Access is strictly controlled by Firestore Security Rules.  
* **Benefits:** This allows for independent accounting, secure partner access (via service accounts with specific roles), and the simplicity of a single Firebase project for authentication.

## **5\. Unified Dashboard: File Structure**

The central dashboard at hub.sazi.life will use the following structure:

/

├── login.html

├── about.html

├── privacy.html

├── terms.html

├── contact.html

├── assets/

│   ├── css/

│   │   └── dashboard-styles.css

│   └── js/

│       └── dashboard.js

└── dashboard/

    ├── index.html

    ├── life-cv.html

    ├── profile.html

    ├── settings.html

    ├── activity.html

    ├── notifications.html

    ├── help.html

    ├── support.html

    ├── 404.html

    ├── components/

    │   ├── header.html

    │   ├── footer.html

    │   ├── language-switcher.html

    │   └── theme-switcher.html

    ├── training/

    │   ├── index.html

    │   ├── assign.html

    │   └── host.html

    ├── assets/

    │   ├── index.html

    │   ├── properties/

    │   │   └── editor.html

    │   ├── vehicles/

    │   │   └── editor.html

    │   └── companies/

    │       └── editor.html

    └── public-pages/

        ├── index.html

        └── editor.html

## **6\. README.md**

\# The Sazi Ecosystem \- Unified Dashboard (hub.sazi.life)

\#\# Project Overview

This repository contains the front-end code for the Sazi Ecosystem's Unified Dashboard, hosted at \`hub.sazi.life\`. This platform serves as the central control center for users to manage their identity, assets, and learning journey across all integrated platforms, including sazi.life, SafetyHelp, eKhaya, and more.

The project is built with a "static-first" approach using \*\*HTML, Tailwind CSS, and vanilla JavaScript\*\*, with direct, secure integration to \*\*Firebase\*\* for all backend services.

\#\# Guiding Philosophy: Live. Learn. Lead.

The ecosystem is built on a simple yet powerful philosophy:

\- \*\*Live:\*\* Gain practical, real-world experience.

\- \*\*Learn:\*\* Distill that experience into wisdom and knowledge.

\- \*\*Lead:\*\* Use that wisdom to build tools and guide others by example.

\#\# Core Features

\- \*\*Unified Authentication (SSO):\*\* A single login provides access to the entire ecosystem.

\- \*\*LifeCV:\*\* A dynamic, holistic portfolio of a user's skills, experiences, and contributions, aggregated from all platforms.

\- \*\*Asset & Company Hub:\*\* A private digital "filing cabinet" for users to manage records for their properties, vehicles, and businesses.

\- \*\*Public Pages:\*\* A tool to effortlessly turn private asset records into beautiful, public-facing classifieds pages.

\- \*\*Training Hub:\*\* An interface for parents and managers to assign courses and for experts to host live training sessions.

\#\# Technical Stack (Phase 1\)

\- \*\*Frontend:\*\* HTML5, CSS3, JavaScript (ES6 Modules)

\- \*\*Styling:\*\* Tailwind CSS v3

\- \*\*Backend & Database:\*\* Google Firebase

  \- \*\*Authentication:\*\* Email/Password, Google, Anonymous

  \- \*\*Database:\*\* Firestore (using a Federated Data Model for commercial separation)

  \- \*\*Storage:\*\* Firebase Storage for user-uploaded files (CVs, photos, etc.)

\- \*\*Hosting:\*\* Deployed as a static site on Netlify, Vercel, or Firebase Hosting.

\#\# Getting Started

1\.  \*\*Clone the repository:\*\*

    \`git clone \[repository-url\]\`

2\.  \*\*Navigate to the project directory:\*\*

    \`cd hub.sazi.life\`

3\.  \*\*Open \`login.html\` in your browser\*\* to start exploring the application locally. All pages are linked with relative paths.

\#\# File Structure

The project follows a modular structure for easy maintenance.

\-   \`/\`: Contains the public login and informational pages (\`about.html\`, \`privacy.html\`, etc.).

\-   \`/assets/\`: Shared CSS and JavaScript files for the entire application.

\-   \`/dashboard/\`: Contains all the authenticated user dashboard pages.

\-   \`/dashboard/components/\`: Reusable HTML components (header, footer) loaded dynamically by JavaScript.

\#\# Next Steps: Backend Integration

The UI for all pages is complete. The next development phase involves writing the client-side JavaScript to connect the UI elements to Firebase:

1\.  \*\*Fetch Data:\*\* Populate pages with data from Firestore.

2\.  \*\*Save Data:\*\* Implement form submission logic to write data to Firestore.

3\.  \*\*Implement Logic:\*\* Build out the business logic for features like publishing pages and assigning training.

