# Terms of Reciprocity Implementation Guide

## Complete Technical Implementation Framework for Ecosystem Replication

Platform Template: Sazi Life Academy Implementation
Version: 2.0 - Developer-Ready Implementation
Effective Date: September 11, 2025
Last Updated: September 11, 2025

---

## Task receipt and plan
I will produce a developer-focused Terms of Reciprocity document that any app in the ecosystem can use to recreate identical behavior and UI. Plan: (1) provide a clear checklist of requirements and template variables, (2) list files to create/update with exact paths and code samples, (3) provide API and DB contracts, (4) provide front-end components, i18n keys, styling rules, tests and deployment steps.

## Checklist (requirements extracted)
- Produce a Terms of Reciprocity document that is repeatable across apps (Done in this guide)
- Provide exact implementation details (file paths, component code, styles) so next developer can reproduce (Included)
- Floating/minimizable Login/Register button integrated with "Powered by The Hub by Salatiso" branding and precise typography/behavior (Included)
- Replace only the APP display name per-app (template variables provided) (Included)
- Include tests, i18n, and deployment instructions for consistent replication (Included)

If anything in this guide can't be applied due to platform-specific constraints, the guide lists alternatives.

---

## 1. How to use this document (quick)

1. Copy this guide into the target app repository.
2. Replace the template variables at the top (APP_NAME, APP_SLUG, PRIMARY_DOMAIN) with the app-specific values.
3. Create the listed files and paste the corresponding code snippets.
4. Run tests and build (instructions below). Deploy using the provided steps.

---

## 2. Template variables (global search/replace)
Replace these placeholders in files listed below to adapt to a specific app:
- APP_NAME — human-friendly app name (e.g., "Sazi Code Create")
- APP_SLUG — short slug (e.g., "code-create")
- PRIMARY_DOMAIN — domain root for external links (e.g., "sazi-life-code-create.web.app")
- HUB_AUTH_URL — base signin/register url for The Hub (default: "https://the-hub-lifecv.web.app")

Example replacements:
- APP_NAME: "Sazi Code Create"
- APP_SLUG: "code-create"
- PRIMARY_DOMAIN: "sazi-life-code-create.web.app"

---

## 3. Files to create/update (paths and purpose)
The list below is minimal and targeted to reproduce Terms of Reciprocity behaviour and UI.

- `TERMS_OF_RECIPROCITY.md` — canonical policy + developer guide (this file)
- `src/components/TermsOfReciprocity.jsx` — React presentational/legal component for end-user display
- `src/components/ReciprocityFloatingButton.jsx` — Minimizable floating Login/Register button + "Powered by The Hub by Salatiso" branding
- `src/locales/en/reciprocity.json` — i18n strings
- `src/api/reciprocity.js` — client API helpers for contribution tracking
- `server/routes/reciprocity.js` or `src/server/reciprocity.js` — server-side API endpoints (if applicable)
- `migrations/reciprocity-schema.sql` or `prisma/schema.prisma` — DB schema
- `__tests__/TermsOfReciprocity.test.jsx` — unit tests
- `README_RECIPROCITY.md` — short integration notes for maintainers

Optional but recommended:
- Add analytics events to your tracking setup with the event names provided below.

---

## 4. Front-end: component contracts and small contract

Contract (very small):
- Inputs: none for display component; for floating button accept optional props { hubAuthUrl, appName }
- Outputs: displays legal text, allows user to open a modal linking to login/register, emits analytics events when clicked
- Error modes: missing hub url falls back to HUB_AUTH_URL; missing translations fall back to English

Edge cases to handle:
- Localization missing
- Small screens (mobile) where floating button should be draggable/minimizable
- Accessibility: keyboard focus and ARIA labels

### 4.1 `src/components/ReciprocityFloatingButton.jsx` (implementation notes)
Purpose: Floating minimizable Login/Register control with precise branding.

Behavior summary:
- Default state: minimized small pill showing: small prefix "Powered by" (font reduced by half) and a larger brand line "The Hub by Salatiso" (doubled size relative to prefix). The pill is clickable.
- Click: expands a floating panel anchored to the pill showing a heading, two large buttons (Login / Register) and a small legal footnote.
- Minimize: clicking close or clicking the pill again minimizes.
- Accessibility: supports keyboard (Enter/Escape) and ARIA roles.

Exact visual rules (Tailwind utility classes):
- Minimized pill: `px-3 py-2 rounded-full shadow-lg bg-green-500 text-white flex items-center gap-2`.
- Prefix text ("Powered by"): `text-xs opacity-90` (half typical body size; adjust where body text is `text-base`).
- Brand text ("The Hub by Salatiso"): `text-sm font-extrabold tracking-tight` (double visually relative to `text-xs` prefix).
- Expanded panel: `absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[220px]`.

Implementation outline (full code is provided later in this document for pasting).

---

## 5. UI code samples (copy-paste ready)
Below are complete, copy-ready code samples for the front-end components. Replace APP_NAME and HUB_AUTH_URL template variables as needed.

### 5.1 `src/components/ReciprocityFloatingButton.jsx`
```jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const DEFAULT_HUB = process.env.HUB_AUTH_URL || 'https://the-hub-lifecv.web.app';

export default function ReciprocityFloatingButton({ hubAuthUrl = DEFAULT_HUB, appName = 'APP_NAME' }) {
	const [expanded, setExpanded] = useState(false);
	const panelRef = useRef(null);

	// Close on outside click
	useEffect(() => {
		function onDoc(e) {
			if (expanded && panelRef.current && !panelRef.current.contains(e.target)) setExpanded(false);
		}
		document.addEventListener('mousedown', onDoc);
		return () => document.removeEventListener('mousedown', onDoc);
	}, [expanded]);

	return (
		<div className={`fixed right-4 z-50`} aria-live="polite">
			<div className="relative">
				<button
					aria-expanded={expanded}
					aria-controls="reciprocity-panel"
					onClick={() => setExpanded((s) => !s)}
					className={`px-3 py-2 rounded-full shadow-lg bg-green-500 text-white flex items-center gap-3 transition-all duration-200`}
				>
					<div className="flex flex-col leading-tight">
						<span className="text-xs opacity-90">Powered by</span>
						<span className="text-sm font-extrabold">The Hub by Salatiso</span>
					</div>
				</button>

				{expanded && (
					<div ref={panelRef} id="reciprocity-panel" role="dialog" aria-modal="false" className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[220px]">
						<h3 className="text-gray-800 font-semibold text-center mb-3">Access Your Account</h3>
						<div className="space-y-2">
							<a href={`${hubAuthUrl}/login`} target="_blank" rel="noopener noreferrer" className="block w-full bg-blue-500 text-white text-center py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">Login</a>
							<a href={`${hubAuthUrl}/register`} target="_blank" rel="noopener noreferrer" className="block w-full bg-green-500 text-white text-center py-2 px-4 rounded-md hover:bg-green-600 transition-colors">Register</a>
						</div>
						<div className="text-center text-sm text-gray-500 mt-3">Powered by The Hub by Salatiso</div>
					</div>
				)}
			</div>
		</div>
	);
# Terms of Reciprocity — Salatiso Ecosystem (Standard, human‑friendly)

Version: 3.0 (Standardized)
Effective: September 16, 2025
Last Updated: September 16, 2025

This is the plain‑language, ecosystem‑wide Terms of Reciprocity you can copy into any Salatiso app. It sets shared expectations for how we work together, especially during our open beta. It replaces legalese with practical, human words. Replace the placeholders below when adopting in another app.

Template variables (search/replace when reusing):
- APP_NAME — the app’s display name (e.g., "LifeSync")
- APP_SLUG — short slug (e.g., "lifesync")
- PRIMARY_DOMAIN — main domain (e.g., "lifesync-lifecv.web.app")
- HUB_AUTH_URL — base URL for The Hub (default: https://the-hub-lifecv.web.app)

Quick integration steps:
1) Add a page that renders these terms (see `src/pages/TermsOfReciprocity.jsx`).
2) Add a global link (e.g., Footer → "Terms of Reciprocity").
3) Optionally include the floating "Powered by The Hub by Salatiso" button.

---

## 1) What reciprocity means here

We believe tools should return more value than they take. You get useful features and a community that has your back. In return, you help by using features responsibly, keeping info accurate where it matters, and sharing feedback. That’s reciprocity.

Highlights:
- You decide: guest (local‑only) or Hub‑connected (portable across apps).
- Minimal data for safety features (name, a contact, GPS consent if used).
- Your data is yours. Export and take it with you at any time.

## 2) Honest beta notes

We’re in an active beta across the ecosystem. Things may change quickly and sometimes break. We’ll:
- Be upfront about known issues and changes.
- Offer local‑only paths to keep you in control.
- Provide exports and (with Hub) better recovery if a device fails.

## 3) What we ask from you

1. Use features with care and consent — especially status/location sharing (e.g., LifeSync Seal), geofencing, and check‑ins.
2. Keep key details accurate (e.g., emergency contacts), so the system can help you and your circle.
3. Share feedback. In beta, your input shapes the roadmap.

## 4) What you can expect from us

1. Clear choices: guest mode for local, Hub for portability and recovery.
2. Minimal data by default; explicit consents for GPS and notifications.
3. Portability across compatible apps via The Hub.
4. Transparency on changes and how we use the data you choose to share.

## 5) Where reciprocity shows up in APP_NAME

Examples from LifeSync (APP_NAME):
- LifeSync Seal: share availability or location with invitees; they accept participation; you can end sharing anytime.
- Geofencing & Check‑ins: you define rules; we remind and escalate per your settings.
- Backup & Recovery: export/import (optionally encrypted). With Hub sync, we add portability and conflict‑aware sync.

## 6) Data control and privacy

- Local‑only mode: store data on your device. Use encrypted exports for backup.
- Consents: grant/revoke GPS and notifications as needed. Features degrade gracefully when off.
- Hub‑connected: when enabled, we queue changes for syncing to the Hub; conflicts are resolved carefully and transparently.

## 7) Community standards

- Be respectful. Share others’ data only with consent.
- Use tools for safety and coordination — not surveillance or harm.
- Report issues responsibly; don’t exploit bugs.

## 8) Ecosystem scope

These terms apply to the Salatiso ecosystem and its modules:
- The Hub (central auth and profile)
- LifeSync (personal organization and safety)
- BizHelp, DocHelp, Ekhaya, FamilyValue, FinHelp, Flamea, LegalHelp, HrHelp, PigeeBack, PubHelp, SafetyHelp

Each module focuses on a specific part of life and work; reciprocity keeps them aligned.

## 9) Updates and staying in the loop

We’ll publish changes in plain language. If something doesn’t work for you, you can keep using guest mode or export and step away.

## 10) Contact

Need help? Email hub@salatiso.com or visit The Hub: https://the-hub-lifecv.web.app/

---

## Appendix — Developer notes (for maintainers)

Front‑end pieces included in this repo:
- `src/pages/TermsOfReciprocity.jsx` — human‑friendly page
- `src/components/ReciprocityFloatingButton.jsx` — optional floating auth entry
- Route: `/terms/reciprocity` added in `src/App.jsx`
- Footer link added in `src/components/Footer.jsx`

i18n: copy strings as needed to your locale files.

Optional server endpoints (if you track reciprocity contributions):
- POST `/api/reciprocity/contribution`
- GET `/api/reciprocity/benefits`
- POST `/api/reciprocity/feedback`

Styling: Tailwind utilities used; replicate CSS if your app differs.

Rollout steps:
1) Build and preview.
2) Verify the page renders and the floating button opens The Hub.
3) Replace APP_NAME/APP_SLUG/PRIMARY_DOMAIN if copying to another app.

—

Prepared for the Salatiso ecosystem to standardize plain‑language terms, with LifeSync as the reference implementation.
- **Active Participation**: Regular engagement with learning activities and community features
- **Feedback Provision**: Constructive feedback for continuous improvement
- **Community Support**: Assistance to other users and contribution to community resources
- **Compliance**: Adherence to platform rules and ethical guidelines

#### Benefits Entitled:
- **Full Access**: Complete access to all educational resources and features
- **Priority Support**: Enhanced customer service and technical assistance
- **Community Recognition**: Acknowledgment of contributions and achievements
- **Exclusive Opportunities**: Access to special events, beta features, and premium content

### 4.2 Educational Institutions and Teachers

#### Contributions Required:
- **Curriculum Integration**: Incorporation of Ecosystem resources into educational programs
- **Student Success**: Commitment to student achievement and development
- **Data Sharing**: Appropriate sharing of educational outcomes and insights
- **Professional Development**: Participation in training and certification programs

#### Benefits Entitled:
- **Institutional Licensing**: Cost-effective access for entire institutions
- **Customization Rights**: Ability to adapt resources for specific needs
- **Analytics Access**: Detailed insights into student progress and outcomes
- **Partnership Opportunities**: Collaboration on research and development projects

### 4.3 Community Partners and Organizations

#### Contributions Required:
- **Resource Sharing**: Contribution of expertise, facilities, or materials
- **Community Building**: Support for local community development initiatives
- **Collaboration**: Active participation in joint projects and initiatives
- **Advocacy**: Promotion of Ecosystem values and mission

#### Benefits Entitled:
- **Enhanced Visibility**: Increased recognition within the community
- **Resource Access**: Shared access to Ecosystem tools and networks
- **Collaborative Funding**: Opportunities for joint grant applications
- **Impact Amplification**: Greater reach for community initiatives

### 4.4 Technology and Service Providers

#### Contributions Required:
- **Innovation**: Development of new tools and services for the Ecosystem
- **Integration**: Seamless integration with existing Ecosystem platforms
- **Support Services**: Reliable technical support and maintenance
- **Security**: Protection of user data and platform integrity

#### Benefits Entitled:
- **Market Access**: Direct access to Ecosystem user base
- **Co-Marketing**: Joint marketing and promotional opportunities
- **Revenue Sharing**: Fair compensation for services and innovations
- **Strategic Partnership**: Involvement in Ecosystem planning and development

### 4.5 Content Creators and Contributors

#### Contributions Required:
- **Quality Content**: Creation of high-quality educational and community resources
- **Regular Updates**: Maintenance and improvement of contributed materials
- **Community Engagement**: Interaction with users and incorporation of feedback
- **Originality**: Respect for intellectual property and proper attribution

#### Benefits Entitled:
- **Content Monetization**: Fair compensation for created materials
- **Platform Visibility**: Enhanced exposure to target audiences
- **Creative Freedom**: Support for innovative content development
- **Professional Recognition**: Acknowledgment and promotion of expertise

---

## 5. Value Exchange Mechanisms

### 5.1 Contribution Tracking
- **Activity Logging**: Automatic tracking of user engagement and contributions
- **Quality Assessment**: Evaluation of contribution value and impact
- **Recognition System**: Public acknowledgment of significant contributions
- **Reward Distribution**: Fair allocation of benefits based on contributions

### 5.2 Benefit Distribution
- **Tiered Access**: Different levels of benefits based on contribution levels
- **Priority Allocation**: Enhanced benefits for high-value contributors
- **Community Voting**: Participant input on benefit distribution
- **Transparent Reporting**: Regular reports on value exchange activities

### 5.3 Economic Compensation
- **Revenue Sharing**: Fair distribution of economic benefits
- **Incentive Programs**: Bonuses and rewards for exceptional contributions
- **Cost Reduction**: Discounts and waivers for active participants
- **Investment Opportunities**: Access to Ecosystem growth opportunities

---

## 6. Rights and Responsibilities

### 6.1 Participant Rights
1. **Access Rights**: Right to use Ecosystem resources and services
2. **Privacy Rights**: Protection of personal information and data
3. **Fair Treatment**: Equal treatment and opportunity within the Ecosystem
4. **Intellectual Property**: Recognition of contributions and creations
5. **Due Process**: Fair procedures for dispute resolution and appeals

### 6.2 Participant Responsibilities
1. **Compliance**: Adherence to all applicable laws and regulations
2. **Ethical Conduct**: Maintenance of high ethical standards
3. **Accurate Representation**: Truthful communication and representation
4. **Resource Respect**: Responsible use of Ecosystem resources
5. **Community Standards**: Respect for all participants and their contributions

### 6.3 Ecosystem Responsibilities
1. **Service Quality**: Maintenance of high-quality services and resources
2. **Security Protection**: Safeguarding of participant data and privacy
3. **Fair Governance**: Transparent and equitable decision-making processes
4. **Continuous Improvement**: Regular updates and enhancements to services
5. **Support Services**: Adequate support and assistance for all participants

---

## 7. Dispute Resolution

### 7.1 Informal Resolution
1. **Direct Communication**: Initial attempts to resolve issues through direct discussion
2. **Mediation Services**: Access to neutral third-party mediation
3. **Community Resolution**: Involvement of community leaders in resolution processes
4. **Documentation**: Recording of all resolution attempts and agreements

### 7.2 Formal Resolution
1. **Arbitration**: Binding arbitration for unresolved disputes
2. **Governing Body**: Ecosystem governance committee for major decisions
3. **External Review**: Independent review for significant disputes
4. **Appeal Process**: Multi-level appeal system for dispute resolution

### 7.3 Escalation Procedures
- **Level 1**: Direct participant communication (within 48 hours)
- **Level 2**: Mediation with Ecosystem representative (within 7 days)
- **Level 3**: Formal arbitration process (within 30 days)
- **Level 4**: Final appeal to governance committee (within 60 days)

---

## 8. Termination and Withdrawal

### 8.1 Voluntary Termination
- **Notice Period**: 30-day notice for voluntary withdrawal
- **Data Export**: Right to export personal data and contributions
- **Benefit Settlement**: Final settlement of any outstanding benefits or obligations
- **Continued Access**: Limited access for data retrieval during transition period

### 8.2 Involuntary Termination
- **Cause Requirements**: Serious violation of Terms or applicable laws
- **Due Process**: Opportunity for explanation and appeal
- **Graduated Sanctions**: Progressive disciplinary measures
- **Rehabilitation**: Opportunities for reinstatement after violations

### 8.3 Post-Termination Obligations
- **Data Retention**: Continued protection of confidential information
- **Non-Disclosure**: Maintenance of confidentiality agreements
- **Non-Competition**: Reasonable restrictions on competitive activities
- **Transition Support**: Assistance with transition to alternative services

---

## 9. Amendments and Updates

### 9.1 Amendment Process
1. **Proposal**: Submission of proposed changes by any participant
2. **Review**: Evaluation by governance committee and legal experts
3. **Community Consultation**: Opportunity for participant feedback
4. **Approval**: Majority approval through community voting
5. **Implementation**: Phased rollout with adequate notice

### 9.2 Notification Requirements
- **Advance Notice**: Minimum 30-day notice for significant changes
- **Clear Communication**: Explanation of changes and their impact
- **Opt-Out Rights**: Right to withdraw if changes are unacceptable
- **Documentation**: Updated Terms available on all platforms

### 9.3 Grandfathering Provisions
- **Existing Rights**: Protection of rights acquired under previous versions
- **Transition Period**: Adequate time for adjustment to new terms
- **Appeal Rights**: Ability to appeal unfavorable changes
- **Alternative Options**: Access to alternative arrangements if needed

---

## 10. Governing Law and Jurisdiction

### 10.1 Applicable Law
These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the primary Ecosystem operations are conducted, with consideration for international participants and applicable international law.

### 10.2 Dispute Jurisdiction
- **Primary Jurisdiction**: Courts of the primary operational jurisdiction
- **Alternative Dispute Resolution**: Preference for arbitration and mediation
- **International Considerations**: Respect for international legal standards
- **Choice of Law**: Clear specification of governing law provisions

### 10.3 Compliance Requirements
- **Legal Compliance**: Adherence to all applicable laws and regulations
- **Regulatory Updates**: Regular review and updates for regulatory changes
- **International Standards**: Compliance with international best practices
- **Ethical Standards**: Maintenance of high ethical and professional standards

---

## 11. Intellectual Property

### 11.1 Ecosystem IP
- **Platform Ownership**: Sazi Life Academy retains ownership of platform IP
- **User Contributions**: Participants retain ownership of their original contributions
- **Licensing**: Automatic licensing for Ecosystem use of contributions
- **Attribution**: Proper attribution for all user-generated content

### 11.2 Collaborative IP
- **Joint Ownership**: Shared ownership for collaborative creations
- **Usage Rights**: Clear rights for Ecosystem-wide usage
- **Commercial Rights**: Fair compensation for commercial usage
- **Protection**: Legal protection against unauthorized usage

### 11.3 Open Access Principles
- **Educational Content**: Preference for open educational resources
- **Creative Commons**: Use of appropriate licensing for educational materials
- **Knowledge Sharing**: Encouragement of open knowledge exchange
- **Innovation Protection**: Balance between openness and protection

---

## 12. Data Protection and Privacy

### 12.1 Data Rights
- **Ownership**: Participants retain ownership of their personal data
- **Control**: Right to control data usage and sharing
- **Access**: Right to access and review personal data
- **Portability**: Right to data portability and export

### 12.2 Privacy Protections
- **Collection Limits**: Minimal data collection principles
- **Purpose Limitation**: Data used only for stated purposes
- **Security Measures**: Industry-standard security protections
- **Breach Notification**: Prompt notification of security incidents

### 12.3 Transparency Requirements
- **Privacy Policies**: Clear and accessible privacy documentation
- **Data Usage**: Transparent explanation of data processing
- **User Control**: Easy-to-use privacy control tools
- **Regular Audits**: Independent privacy and security audits

---

## 13. Sustainability and Environmental Commitment

### 13.1 Environmental Responsibility
- **Digital Sustainability**: Preference for digital over physical resources
- **Energy Efficiency**: Optimization of digital infrastructure
- **Paper Reduction**: Minimization of printed materials
- **Carbon Neutrality**: Commitment to carbon-neutral operations

### 13.2 Social Sustainability
- **Inclusive Access**: Universal access to educational opportunities
- **Community Development**: Support for underserved communities
- **Economic Mobility**: Education as a pathway to economic improvement
- **Cultural Preservation**: Respect for diverse cultural backgrounds

### 13.3 Long-term Viability
- **Resource Conservation**: Responsible use of technological resources
- **Innovation Investment**: Commitment to continuous improvement
- **Community Investment**: Reinvestment in community development
- **Legacy Planning**: Planning for long-term Ecosystem sustainability

---

## 14. Contact Information

### 14.1 Primary Contacts
**Sazi Life Academy Administration**
- **Email**: reciprocity@sazilifeacademy.com
- **Phone**: [Primary Contact Number]
- **Address**: [Primary Business Address]

### 14.2 Support Services
**Technical Support**
- **Email**: support@sazilifeacademy.com
- **Help Center**: https://support.sazilifeacademy.com

**Legal and Compliance**
- **Email**: legal@sazilifeacademy.com
- **Compliance Officer**: [Contact Name]

### 14.3 Community Resources
**Community Support**
- **Forum**: https://community.sazilifeacademy.com
- **Newsletter**: reciprocity@sazilifeacademy.com
- **Social Media**: [Official Social Media Channels]

---

## 15. Acknowledgment and Acceptance

### 15.1 Acceptance of Terms
By participating in the Sazi Life Academy Ecosystem, all Participants acknowledge and agree to be bound by these Terms of Reciprocity. Continued participation constitutes acceptance of these terms and any future amendments.

### 15.2 Digital Signature
This agreement may be executed electronically, and electronic signatures shall be legally binding and admissible in legal proceedings.

### 15.3 Effective Date
These Terms become effective upon acceptance by the Participant and remain in effect until terminated as provided herein.

---

## 16. Appendices

### Appendix A: Reciprocity Metrics
Detailed metrics for measuring reciprocal value exchange

### Appendix B: Dispute Resolution Procedures
Detailed procedures for formal dispute resolution

### Appendix C: Benefit Calculation Formulas
Mathematical formulas for calculating participant benefits

### Appendix D: Technology Integration Standards
Technical standards for Ecosystem integration

---

*These Terms of Reciprocity are designed to foster a collaborative, sustainable, and mutually beneficial ecosystem. All participants are encouraged to review these terms regularly and contribute to their continuous improvement.*

**Document Version:** 1.0
**Effective Date:** September 11, 2025
**Last Reviewed:** September 11, 2025
**Next Review Date:** September 11, 2026

**Prepared by:** Sazi Life Academy Governance Committee
**Approved by:** Sazi Life Academy Board of Directors
