# MNI Web Apps Upgrade Specifications

## Overview
This document outlines the upgrade specifications for integrating MNI intranet content and family-focused features into the existing web applications: Salatiso LifeCV, BizHelp LifeCV, and their respective template systems.

## Target Applications
1. **https://salatiso-lifecv.web.app/** - Personal career development platform
2. **https://bizhelp-lifecv.web.app/** - Business support and development platform
3. **https://bizhelp-lifecv.web.app/templates** - Template management system
4. **https://salatiso-lifecv.web.app/templates/** - Personal template system

## Integration Requirements

### 1. Family Tree Integration
**Objective:** Embed comprehensive family tree visualization and navigation

**Features to Add:**
- Interactive family tree component with clickable nodes
- Link to detailed FAMILY_TREE.md content
- Family member profile previews

- Ubuntu wisdom integration
- Responsive design for mobile/desktop

**Technical Implementation:**
- Add FamilyTree React component
- Integrate with existing user authentication
- Link to intranet pages for full details
- Include search and filter functionality

### 2. Family Timeline Integration
**Objective:** Provide chronological family history and educational content

**Features to Add:**
- Timeline visualization component
- Key life events display
- Educational annotations for teaching purposes
- Link to FAMILY_TIMELINE.md
- Progress tracking for users

**Technical Implementation:**
- Timeline React component with interactive elements
- Integration with user progress tracking
- Educational content markers
- Responsive timeline design

### 3. Business Organogram Integration
**Objective:** Display vibrant business structure for public viewing

**Features to Add:**
- Visual organogram component
- Role descriptions and responsibilities
- Interactive hover details
- Link to BUSINESS_ORGANOGRAM.md
- Ubuntu color scheme (#6B46C1, #D69E2E)

**Technical Implementation:**
- Organogram visualization library integration
- Dynamic data loading from organogram data
- Responsive design for various screen sizes
- Public/private content controls

### 4. Career Paths and Profiles Integration
**Objective:** Showcase career development and role assignments

**Features to Add:**
- Career path visualization
- Individual role profiles
- Deliverables tracking
- Training prerequisites display
- Link to CAREER_PATHS_PROFILES.md

**Technical Implementation:**
- CareerPath React components
- Progress tracking integration
- Interactive profile displays
- Link to individual role HTML documents

### 5. Interactive Role Documents Integration
**Objective:** Embed customizable role documentation

**Features to Add:**
- Embedded HTML role documents
- Edit-in-place functionality for authorized users
- Progress tracking integration
- Link to individual role HTML files (SOLO_ROLE.html renamed to SOLONWABO_ROLE.html, TINA_ROLE.html, etc.)

**Technical Implementation:**
- HTML iframe or component integration
- Real-time editing capabilities
- Data synchronization with backend
- Permission-based editing controls

### 6. Family Profiles Integration
**Objective:** Include immersive family member profiles

**Features to Add:**
- Profile showcase starting with Visa (CEO)
- Interactive elements and contributions
- Link to FAMILY_PROFILES_STARTING_WITH_MOTHER.html (renamed appropriately)
- Family member spotlights including Solonwabo (Solo), Mila, Milande, Milani, Azora
- Ubuntu wisdom highlights

**Technical Implementation:**
- Profile component integration
- Interactive contribution features
- Media integration for profiles
- Responsive profile layouts

### 7. Ubuntu Philosophy Integration
**Objective:** Weave Ubuntu principles throughout all applications

**Features to Add:**
- Ubuntu wisdom quotes and teachings
- Family-first messaging
- Cultural integration elements
- Community building features
- Color scheme consistency (#6B46C1, #D69E2E)

**Technical Implementation:**
- Ubuntu component library
- Consistent theming
- Cultural content integration
- Community interaction features

### 8. Educational Repository Features
**Objective:** Transform apps into teaching tools

**Features to Add:**
- Sazi's educational journey highlights (traditional school, COVID impact, homeschooling transition)
- COVID-19 experience documentation
- Homeschooling transition examples
- Interactive learning modules
- Progress tracking for educational content

**Technical Implementation:**
- Educational content components
- Progress tracking system
- Interactive learning features
- Assessment integration

## Technical Specifications

### Frontend Updates
- **Framework:** React.js (existing)
- **New Components:**
  - FamilyTree
  - FamilyTimeline
  - BusinessOrganogram
  - CareerPaths
  - RoleDocuments
  - FamilyProfiles
  - UbuntuWisdom
- **Styling:** Consistent Ubuntu theme integration
- **Responsive:** Mobile-first design approach

### Backend Updates
- **Database:** Add tables for:
  - Family tree data
  - Timeline events
  - Career progress
  - Role assignments
  - Profile information
- **API Endpoints:** New endpoints for family data retrieval and updates
- **Authentication:** Role-based access for editing capabilities

### Content Management
- **CMS Integration:** Link to intranet content management
- **Version Control:** Track changes to family content
- **Backup:** Regular backups of family data
- **Privacy:** Public vs. private content controls

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Family tree component development
- Basic Ubuntu theming integration
- Content structure setup

### Phase 2: Core Features (Week 3-4)
- Timeline and organogram integration
- Career paths implementation
- Role document embedding

### Phase 3: Advanced Features (Week 5-6)
- Interactive profiles and editing
- Educational repository features
- Community interaction tools

### Phase 4: Optimization (Week 7-8)
- Performance optimization
- Mobile responsiveness
- Testing and refinement

## Success Metrics
- User engagement with family content
- Completion rates for educational modules
- Profile contribution activity
- Ubuntu philosophy integration effectiveness

## Maintenance and Updates
- Quarterly content reviews
- Family data synchronization
- Feature enhancement based on user feedback
- Security updates for interactive components

## Integration with Existing Features
- Maintain current LifeCV and BizHelp functionality
- Enhance rather than replace existing features
- Seamless navigation between old and new content
- Backward compatibility for existing users

## Testing Requirements
- Cross-browser compatibility
- Mobile device testing
- Performance testing with family data
- User acceptance testing with family members
- Security testing for interactive features