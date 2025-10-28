# Frontend Integration Specification - Sazi Homeschooling Curriculum

Version: 1.0.0
Date: 2025-08-14

Purpose
- Define how the Civic Education Curriculum (Sazi Life Homeschooling) integrates into The Hub frontend for `sazi-homeschooling.web.app`.

1. Data Contract
- Curriculum items exported from the homeschooling catalog must include:
  - id, title, category, ageRange, outcomes, content (modules/lessons), resources (links, PDFs), assessment (checklist, quizzes)

2. Routing & Embedding
- Curriculum landing path: `/curriculum` with subroutes `/curriculum/:id` for module detail
- Hub will link to `https://sazi-homeschooling.web.app` for full hosted curriculum resources when content is heavy (videos/docs)
- For trusted modules, Hub will embed lessons via iframe with postMessage API for progress sync

3. UI/UX
- Curriculum items should display Learning Pillars, Life CV outcomes, and Assessment checklists
- Support both parent-verified checklists and quiz-based assessment

4. Progress & Certificates
- Parent-verified qualification entries are stored in LifeCV as a special credential type
- Quizzes in Hub produce scores that may automatically mark an outcome as achieved if passing

5. Implementation Notes
- Courses from the Sazi Homeschooling app will be consumed via a JSON export or REST endpoint; until then, they should be seeded into `src/services/homeschoolingService.js`
- Normalization performed at render-time to ensure consistent keys (title, description, quiz, achievements)

6. Security & Privacy
- Any iframe embedding must limit features (sandbox) and use postMessage origin checks
- Sensitive student data must not be embedded in certificates without parental consent

7. QA Checklist
- [ ] Curriculum items render with healthy fallback values
- [ ] Progress persists to localStorage + Firestore
- [ ] Certificates record in Firestore
- [ ] LifeCV updated on parent-verified qualification issuance

Maintained by: Hub & Sazi Homeschooling Integration Team
