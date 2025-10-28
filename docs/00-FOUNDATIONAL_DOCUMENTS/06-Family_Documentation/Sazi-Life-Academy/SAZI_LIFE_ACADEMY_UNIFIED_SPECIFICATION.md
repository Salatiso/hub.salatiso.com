# Sazi Life Academy - Unified Technical Specification

**Version:** 1.0.0  
**Last Updated:** October 8, 2025  
**Project:** Sazi Life Academy by Salatiso - A Lifelong Learning & Community Empowerment Platform
**Primary Web App:** https://sazi-life-academy.web.app/
**Supporting Apps:** 
- https://sazi-life-homeschooling.web.app/
- https://sazi-life-language.web.app/
- https://sazi-life-home-life.web.app/
- https://sazi-life-code-create.web.app/

---

## 1. Executive Summary

### 1.1. Purpose
The Sazi Life Academy is a comprehensive educational ecosystem designed to provide free, accessible, and high-quality learning resources for everyone, from young children in traditional schooling to adults seeking lifelong learning opportunities. It democratizes education by empowering parents, community members, and professionals to create, share, and manage educational content. The platform is built on a foundation of trust, leveraging the **LifeCV** system from LifeSync to ensure the credibility of educators and the quality of content.

### 1.2. Key Differentiators
1.  **Trust-Gated Content Creation:** Any user can create a course, but its visibility and official status are tied to their **LifeCV Trust Score**.
2.  **Disaster-Proof Education:** Empowers parents and communities to instantly create and deliver curriculum when traditional schools are closed due to unforeseen events like floods or health crises.
3.  **Fully Offline-First:** All critical content, including courses, safety protocols, and communication tools, is available without an internet connection.
4.  **Emergency Mesh Networking:** A built-in chat and alert system functions peer-to-peer when cellular and Wi-Fi networks fail, ensuring communities can stay connected.
5.  **Integrated Safety & Wellness:** Incorporates features from **SafetyHelp**, turning every school into a proactive safety environment with digital incident reporting and inspections.
6.  **Seamless Ecosystem Integration:** Connects with LifeCV, BizHelp, and other Salatiso platforms to provide a holistic life management experience.
7.  **Personal & Professional Tiers:** Free for individual and community use, with scalable professional features for formal institutions.

---

## 2. App Philosophy & Branding

### 2.1. Unified Brand Identity
All applications within the Sazi Life Academy ecosystem must adhere to the **ECOSYSTEM_BRANDING_GUIDE.md**. The official branding lockup is:

```
+----------------------+
|                      |
|   [Application Name] |
|     by Salatiso      |
|                      |
+----------------------+
```
This will be implemented on splash screens, headers, and login pages.

### 2.2. Personal Tier (Free)
- **Use Cases:** Parents, homeschoolers, community study groups, individuals sharing knowledge.
- **Features:**
    - Create and access unlimited courses for personal/community use.
    - Full offline access to downloaded content.
    - Basic incident reporting for a home or community group.
    - Create personal **Safety Seals** for a home or informal learning space.
    - Participate in offline mesh chat.

### 2.3. Professional Tier (Paid Service for Institutions)
- **Use Cases:** Formal private and public schools, universities, corporate training departments.
- **Features:**
    - All Personal Tier features.
    - Create official **School Safety Seals**. When scanned, visitors are checked in, receive safety inductions, and are added to the campus mesh network.
    - Advanced OHS dashboard with incident analytics, compliance reporting, and audit trails (from SafetyHelp).
    - Role-based access control for principals, teachers, safety officers, and administrative staff.
    - Centralized curriculum management and student assessment tracking.
    - Integration with **BizHelp** for formalizing a community school into a registered entity.

---

## 3. Technical Architecture

### 3.1. Core Framework
- **Frontend:** Modern JavaScript framework (e.g., Vue.js or React).
- **Backend:** Firebase (Firestore, Authentication, Storage) for scalability and real-time data sync.
- **Styling:** TailwindCSS for utility-first design.

### 3.2. Offline-First Strategy
- **Service Workers:** Aggressively cache all application shells, static assets, and user-specific data.
- **Local Database:** Use IndexedDB (or a wrapper like PouchDB/RxDB) to store courses, user progress, incident reports, and chat messages.
- **Background Sync:** Data created offline is queued and synced with Firestore automatically when a connection is re-established.

### 3.3. Emergency Mesh Network
- **Technology:** WebRTC and/or Bluetooth Web API to discover and connect peers directly.
- **Functionality:**
    - **Discovery:** The app constantly broadcasts and listens for other Sazi Life Academy users nearby.
    - **Chat:** A dedicated, resilient chat channel for emergency coordination, which functions independently of the internet.
    - **Alerts:** Authorized users (e.g., School Fire Wardens) can push high-priority alerts (e.g., "EVACUATE") across the mesh.
    - **Data Relay:** Devices on the mesh with intermittent internet access act as gateways, syncing critical data (like a new incident report) to the cloud on behalf of offline peers.

---

## 4. Core Feature Specifications

### 4.1. LifeCV Trust Integration
- **Course Creation:**
    1. Any registered user can access the curriculum builder to create a course, define modules, and add content (videos, PDFs, quizzes).
    2. Upon submission, the course is initially marked as "Community Content."
    3. The creator's **LifeCV Trust Score** is prominently displayed on the course page.
    4. Courses created by users with "Verified," "Trusted," or "Elite" Trust Scores are eligible for "Academy Recommended" status, giving them higher visibility.
    5. Schools can set a minimum Trust Score for educators they affiliate with.
- **Parent-Led Emergency Schooling:**
    1. A simplified "Start a Class Now" wizard is accessible from the main dashboard.
    2. A parent can name the class (e.g., "Grade 4 Flood Relief Class"), set a schedule, and immediately start adding lessons or linking to existing Academy resources.
    3. The class is instantly available to other parents in the same community via the mesh network.

### 4.2. SafetyHelp Integration
- **School Safety Seal:**
    - School administrators create a seal that includes:
        - Digital safety induction video/PDF.
        - Map of emergency assembly points.
        - List of First Aiders and Fire Wardens.
        - OHS Act compliance documents.
    - Visitors scan a QR code at the entrance, complete the induction on their phone, and are digitally signed in.
- **Incident Reporting:**
    - The "Report Incident" feature from SafetyHelp is integrated.
    - Any student, teacher, or visitor can report safety, security, or health issues.
    - Reports can be submitted anonymously.
    - Offline reports are synced via the mesh network or when connectivity returns.
    - The school's designated Safety Officer manages reports via a dedicated dashboard.
- **Proactive Inspections:**
    - Safety Officers have access to digital checklists for routine inspections (e.g., fire extinguisher checks, playground safety).

### 4.3. Report Generation & Compliance System
- **Educational Safety Reports:**
    - School Safety Specifications with LifeCV trust score integration
    - Emergency Response Plans customized for educational environments
    - Evacuation Plans with student-specific procedures
    - Safety Induction Reports for visitors and students
    - Incident Reports with educational impact assessment
    - Risk Assessments for learning environments
- **Compliance & Administrative Reports:**
    - Curriculum Compliance Reports with content safety verification
    - Trust Score Reports for educator verification
    - Community Safety Ledger for public transparency
    - Offline Learning Reports for disaster preparedness
    - Mesh Network Reports for emergency communication status
- **Learning & Assessment Reports:**
    - Course Completion Reports with safety training verification
    - Safety Training Reports for mandatory education compliance
    - Peer Review Reports for community content validation
    - Learning Analytics Reports with safety metrics
- **Technical Implementation:**
    - PDF generation with educational accessibility (WCAG 2.1 AA)
    - LifeCV integration for trust score validation
    - Offline report queuing and synchronization
    - Multi-language support for diverse communities
    - Audit trails and revision history tracking

### 4.4. Unified Contact System
- All "Contact Us" forms across the ecosystem will be standardized.
- The form will not display an email address directly.
- On submission, the data will be sent to a cloud function that forwards the message to a central inbox: `hub@salatiso.com` and `lifecvhub@gmail.com`. This mirrors the implementation at `https://pigeeback-lifecv.web.app/contact`.

---

## 5. Phased Implementation Plan

### Phase 1: Documentation & Foundation (Current)
- **Task:** Create this unified specification.
- **Task:** Audit all existing apps and documents.
- **Status:** ✅ COMPLETED

### Phase 2: Branding & UI Unification
- **Goal:** Apply the "by Salatiso" branding across all Sazi Life Academy apps.
- **Actions:**
    - Update splash screens, logos, and headers.
    - Standardize color palettes and fonts where appropriate.
    - Implement the new unified contact form.
- **Status:** ✅ COMPLETED
- **Implementation:**
    - Added "by Salatiso" branding to Header component
    - Updated AgeGate, AdultsAuthForm, and KidsAuthForm with branding
    - Updated Home page hero section with branding
    - Updated About page with branding
    - Verified unified contact form implementation
    - Confirmed standardized theme system (5 themes) and Inter font
    - Fixed import issues and verified successful build

### Phase 3: Core Feature Integration

### Phase 3: Core Feature Integration
- **Goal:** Integrate the foundational ecosystem features.
- **Actions:**
    - Implement the LifeCV Trust Score display on user profiles and course pages.
    - Build the "Community Content" vs. "Academy Recommended" logic.
    - Integrate the SafetyHelp incident reporting form and workflow.
    - Develop the School Safety Seal creation and visitor check-in flow.
    - Implement the Report Generation & Compliance System with PDF accessibility.

### Phase 4: Advanced Offline & Mesh Networking
- **Goal:** Enable full offline functionality and emergency communication.
- **Actions:**
    - Enhance service workers to cache all critical user data.
    - Implement the peer-to-peer mesh discovery and chat functionality.
    - Build the offline-to-online data synchronization queue.
    - Integrate offline report generation and queuing system.

### Phase 5: Report Generation & Compliance (New Phase)
- **Goal:** Implement comprehensive educational safety reporting and compliance tracking.
- **Actions:**
    - Develop PDF generation service with educational accessibility features.
    - Integrate LifeCV trust score validation for official reports.
    - Build report templates for all educational safety categories.
    - Implement audit trails and compliance monitoring.
    - Create offline report queuing and synchronization.
    - Develop multi-language report generation for diverse communities.

---

## 6. Final Steps & Deployment Checklist

### 6.1. Final Testing & Quality Assurance
- Conduct full regression testing across all apps (web, mobile, offline scenarios)
- Validate mesh networking in real-world emergency simulation (offline peer-to-peer chat, alert relay)
- Test PDF report generation for all templates and accessibility compliance (WCAG 2.1 AA)
- Verify LifeCV trust score integration for all reporting and educator verification workflows
- Confirm offline queuing and background sync for reports and incident submissions
- Test multi-language support for all report types
- Audit all branding and UI elements for consistency

### 6.2. Deployment & Go-Live
- Prepare production builds for all web apps
- Deploy updated service worker and mesh networking modules
- Roll out new report generator and compliance system
- Update documentation and user guides
- Announce new features to user community
- Monitor analytics and error logs for post-launch issues

### 6.3. Post-Launch Monitoring & Support
- Set up automated monitoring for mesh network health and offline sync status
- Provide user support channels for emergency communication and reporting
- Schedule periodic audits of compliance and safety reporting workflows
- Gather user feedback for future improvements

---

## 7. Future Roadmap

- Expand mesh networking to support additional protocols (LoRa, Zigbee, satellite)
- Integrate advanced analytics and AI-driven safety recommendations
- Develop mobile app versions for iOS/Android with offline-first architecture
- Add support for biometric authentication and advanced identity verification
- Enhance LifeCV trust system with decentralized credentials
- Broaden multi-language and accessibility features for global reach
- Foster community-driven curriculum and safety innovation

---

**Status as of October 8, 2025:**
- All core phases completed (documentation, branding, features, offline mesh, reporting)
- Final testing and deployment in progress
- Platform ready for full launch and community adoption

---

**End of Unified Specification**
