# Training Module Specification - Sazi Life Academy (Hub)

Version: 1.0.0
Date: 2025-08-14

Overview

This document defines the technical specification for the Training / Academy module embedded in The Hub. It documents data shapes, APIs, storage, UX contract, integration points, and security.

1. Purpose
- Deliver structured courses (Hub courses + Homeschooling curriculum) to Hub users.
- Track progress, quizzes, issued certificates, achievements.
- Provide LifeCV integration for certificates and achievements.

2. Data shapes
- Course Module (stored in-memory / seed files and optionally Firestore):
  - id: string
  - title: string
  - description: string
  - category: string
  - difficulty: string (Beginner|Intermediate|Advanced|Expert)
  - duration: string
  - icon: string
  - iconColor: string
  - quiz: { questions: number, passingScore: number }
  - achievements: string[]
  - content: { sections: string[] }

- User Progress (stored in Firestore under `userTrainings/{uid}/completed/{courseId}` and localStorage for session):
  - completed: boolean
  - score: number
  - attempts: number
  - lastCompleted: ISO string
  - certificateUrl?: string
  - achievements?: string[]

3. Firestore Paths
- userTrainings/{userId}/completed/{courseId} -> document containing issuance and completion metadata

4. API & Services
- generateCertificate(payload) -> PDF data URL (implemented with jsPDF + QR)
- recordCertificateIssuance(userId, courseId, certificateUrl) -> writes Firestore record
- (future) fetchCourses() -> fetch dynamic course catalog from Firestore or CMS

5. Frontend Contracts
- The module must accept course lists from two sources: internal seed (courses) and `homeschoolingTypes`.
- Each module must be normalized to the Course Module shape before rendering.
- Search/filter must guard against missing fields.

6. Security
- All writes to `userTrainings` must be authorized by client using Firebase Security Rules.
- Certificates must not disclose PII unintentionally.

7. Integration
- LifeCV: when a certificate is issued, the LifeCV profile should be updated with achievement metadata.
- Sidebar: Training route `/training` should be accessible to authenticated users and visible in the Sidebar.

8. Notes
- Current implementation stores course catalog in code; plan to migrate to Firestore for dynamic updates.

---

Maintained by: Hub Development Team


