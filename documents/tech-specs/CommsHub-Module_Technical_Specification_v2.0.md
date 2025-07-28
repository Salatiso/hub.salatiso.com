# CommsHub Module: Technical Specification v2.0
**Document ID:** COMMSHUB-TECH-SPEC-V2.0  
**Date:** 2025-07-28  
**Status:** Final  
**Module:** CommsHub  
**Parent System:** The Hub by Salatiso  

---

## Executive Summary

The CommsHub module serves as the communication and content publishing center of The Hub by Salatiso. It provides users with tools for private content creation, group communication, and public publishing, enabling seamless content workflow from draft to publication across multiple visibility levels.

---

## 1. Module Overview

### 1.1 Purpose
To provide users with comprehensive communication and publishing tools that:
- Enable private content creation and draft management
- Facilitate group communication and collaboration
- Support public content publishing with multiple templates
- Integrate with other Hub modules for content sharing
- Provide analytics and engagement tracking

### 1.2 Core Philosophy
CommsHub operates on the principle of **"Progressive Disclosure"** - content can evolve from private thoughts to public discourse through structured stages:
- **Private:** Personal drafts and idea development
- **Group:** Collaborative refinement and feedback
- **Public:** Polished content for broader audience

### 1.3 Key Features
- **Rich Text Editor:** Quill.js-based editor with advanced formatting
- **Draft Management:** Private content creation and storage
- **Group Communication:** Real-time chat and collaboration
- **Publishing Workflow:** Multi-stage content publication
- **Template System:** Professional templates for different content types
- **Analytics Dashboard:** Content performance and engagement metrics

---

## 2. Technical Architecture

### 2.1 Component Structure
```
CommsHub Module
├── Core Components
│   ├── CommsDashboard (Main interface)
│   ├── ContentEditor (Rich text editing)
│   ├── DraftManager (Private content management)
│   ├── GroupChat (Real-time communication)
│   ├── PublishingEngine (Content publication)
│   └── AnalyticsDashboard (Performance tracking)
├── Data Services
│   ├── ContentService (CRUD operations)
│   ├── GroupService (Group management)
│   ├── PublishingService (Publication workflow)
│   └── AnalyticsService (Engagement tracking)
├── UI Components
│   ├── RichTextEditor (Quill.js wrapper)
│   ├── DraftList (Content browser)
│   ├── GroupList (Communication groups)
│   ├── PublishModal (Publishing options)
│   └── TemplateSelector (Content templates)
└── Integration Points
    ├── LifeCVConnector (Achievement tracking)
    ├── PublicationsConnector (Content library)
    └── NotificationService (Real-time alerts)
```

### 2.2 Data Model

#### Content Entry Structure
```typescript
interface ContentEntry {
  entryId: string;
  userId: string;
  title: string;
  content: string; // Quill Delta JSON or HTML
  contentType: 'draft' | 'article' | 'newsletter' | 'announcement' | 'discussion';
  visibility: 'private' | 'group' | 'public';
  status: 'draft' | 'published' | 'archived';
  template: string; // Template identifier
  groupId?: string; // For group-specific content
  publishingOptions: {
    scheduledFor?: Timestamp;
    expiresAt?: Timestamp;
    allowComments: boolean;
    allowSharing: boolean;
    requireApproval: boolean;
  };
  metadata: {
    wordCount: number;
    readingTime: number; // Estimated minutes
    tags: string[];
    category: string;
    language: string;
    excerpt: string;
  };
  analytics: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    engagementRate: number;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}
```

#### Group Structure
```typescript
interface CommsGroup {
  groupId: string;
  name: string;
  description: string;
  type: 'family' | 'work' | 'community' | 'project' | 'interest';
  privacy: 'public' | 'private' | 'invite-only';
  creatorId: string;
  members: {
    userId: string;
    role: 'admin' | 'moderator' | 'member';
    joinedAt: Timestamp;
    permissions: {
      canPost: boolean;
      canModerate: boolean;
      canInvite: boolean;
      canManageSettings: boolean;
    };
  }[];
  settings: {
    allowMemberPosts: boolean;
    requireApproval: boolean;
    allowFileSharing: boolean;
    maxFileSize: number;
    retentionPeriod: number; // Days to keep messages
  };
  statistics: {
    totalMessages: number;
    activeMembers: number;
    lastActivity: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Message Structure
```typescript
interface GroupMessage {
  messageId: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'link' | 'poll' | 'event';
  attachments?: {
    type: 'image' | 'document' | 'video' | 'audio';
    url: string;
    filename: string;
    size: number;
  }[];
  mentions?: string[]; // User IDs mentioned in message
  reactions?: {
    emoji: string;
    users: string[];
    count: number;
  }[];
  replyTo?: string; // Message ID if this is a reply
  isEdited: boolean;
  isPinned: boolean;
  isDeleted: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

### 2.3 Database Schema (Firestore)
```
lifecv-d2724/
├── users/{userId}/
│   ├── commsContent/{entryId}: ContentEntry
│   ├── drafts/{draftId}: DraftContent
│   └── commsSettings/
│       ├── preferences: UserPreferences
│       ├── notifications: NotificationSettings
│       └── privacy: PrivacySettings
├── commsGroups/{groupId}/
│   ├── info: CommsGroup
│   ├── messages/{messageId}: GroupMessage
│   ├── files/{fileId}: FileMetadata
│   └── events/{eventId}: GroupEvent
├── publicContent/{contentId}: PublicContent
├── contentTemplates/{templateId}: ContentTemplate
└── analytics/
    ├── contentViews/{viewId}: ViewRecord
    ├── engagement/{engagementId}: EngagementRecord
    └── groupActivity/{activityId}: ActivityRecord
```

---

## 3. Core Functionality

### 3.1 Content Creation & Editing

#### Rich Text Editor Implementation
```javascript
class CommsHubEditor {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = {
      theme: 'snow',
      placeholder: 'Start writing...',
      modules: {
        toolbar: this.getToolbarConfig(),
        history: {
          delay: 1000,
          maxStack: 100,
          userOnly: true
        },
        imageResize: {
          displaySize: true
        }
      },
      ...options
    };
    
    this.quill = null;
    this.autoSaveTimer = null;
    this.collaborators = new Map();
  }

  initialize() {
    this.quill = new Quill(this.containerId, this.options);
    this.setupEventListeners();
    this.setupAutoSave();
    this.setupCollaboration();
    return this.quill;
  }

  getToolbarConfig() {
    return [
      [{ 'header': [1, 2, 3, false] }],
      [{ 'font': [] }, { 'size': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean'],
      ['word-count', 'reading-time', 'ai-assist'] // Custom tools
    ];
  }

  setupEventListeners() {
    this.quill.on('text-change', (delta, oldDelta, source) => {
      if (source === 'user') {
        this.handleContentChange(delta);
        this.updateWordCount();
        this.updateReadingTime();
        this.broadcastChanges(delta);
      }
    });

    this.quill.on('selection-change', (range, oldRange, source) => {
      if (source === 'user') {
        this.handleSelectionChange(range);
      }
    });
  }

  setupAutoSave() {
    this.quill.on('text-change', () => {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = setTimeout(() => {
        this.saveContent(true); // Silent save
      }, 2000);
    });
  }

  async saveContent(silent = false) {
    const content = this.quill.getContents();
    const html = this.quill.root.innerHTML;
    const text = this.quill.getText();
    
    const contentData = {
      delta: JSON.stringify(content),
      html: html,
      text: text,
      wordCount: this.calculateWordCount(text),
      readingTime: this.calculateReadingTime(text),
      updatedAt: new Date()
    };

    try {
      await this.contentService.saveContent(this.contentId, contentData);
      if (!silent) {
        this.showSaveConfirmation();
      }
    } catch (error) {
      console.error('Error saving content:', error);
      this.showSaveError();
    }
  }

  calculateWordCount(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  calculateReadingTime(text) {
    const wordsPerMinute = 200;
    const wordCount = this.calculateWordCount(text);
    return Math.ceil(wordCount / wordsPerMinute);
  }
}
```

### 3.2 Group Communication System

#### Real-time Chat Implementation
```javascript
class GroupChatService {
  constructor(groupId, userId) {
    this.groupId = groupId;
    this.userId = userId;
    this.messagesRef = collection(db, `commsGroups/${groupId}/messages`);
    this.unsubscribe = null;
    this.messageCache = new Map();
  }

  async initializeChat() {
    // Load recent messages
    const recentMessages = await this.loadRecentMessages();
    this.renderMessages(recentMessages);
    
    // Set up real-time listener
    this.setupRealtimeListener();
    
    // Mark user as active in group
    await this.updateUserPresence('active');
  }

  setupRealtimeListener() {
    const q = query(
      this.messagesRef,
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = [];
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const message = { id: change.doc.id, ...change.doc.data() };
          newMessages.push(message);
          this.messageCache.set(message.messageId, message);
        }
      });

      if (newMessages.length > 0) {
        this.renderNewMessages(newMessages);
        this.scrollToBottom();
      }
    });
  }

  async sendMessage(content, messageType = 'text', attachments = []) {
    const message = {
      messageId: generateUniqueId(),
      groupId: this.groupId,
      senderId: this.userId,
      senderName: await this.getUserDisplayName(this.userId),
      content: content,
      messageType: messageType,
      attachments: attachments,
      mentions: this.extractMentions(content),
      reactions: [],
      isEdited: false,
      isPinned: false,
      isDeleted: false,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(this.messagesRef, message);
      
      // Update group last activity
      await this.updateGroupActivity();
      
      // Send notifications to mentioned users
      if (message.mentions.length > 0) {
        await this.sendMentionNotifications(message);
      }
      
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async addReaction(messageId, emoji) {
    const messageRef = doc(this.messagesRef, messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (messageDoc.exists()) {
      const messageData = messageDoc.data();
      const reactions = messageData.reactions || [];
      
      // Find existing reaction for this emoji
      const existingReaction = reactions.find(r => r.emoji === emoji);
      
      if (existingReaction) {
        // Toggle user's reaction
        if (existingReaction.users.includes(this.userId)) {
          existingReaction.users = existingReaction.users.filter(id => id !== this.userId);
          existingReaction.count = existingReaction.users.length;
        } else {
          existingReaction.users.push(this.userId);
          existingReaction.count = existingReaction.users.length;
        }
        
        // Remove reaction if no users
        if (existingReaction.count === 0) {
          const reactionIndex = reactions.indexOf(existingReaction);
          reactions.splice(reactionIndex, 1);
        }
      } else {
        // Add new reaction
        reactions.push({
          emoji: emoji,
          users: [this.userId],
          count: 1
        });
      }
      
      await updateDoc(messageRef, { reactions: reactions });
    }
  }

  extractMentions(content) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    
    return mentions;
  }

  async sendMentionNotifications(message) {
    for (const mentionedUser of message.mentions) {
      await this.notificationService.sendNotification(mentionedUser, {
        type: 'mention',
        title: `${message.senderName} mentioned you`,
        body: message.content.substring(0, 100),
        data: {
          groupId: this.groupId,
          messageId: message.messageId
        }
      });
    }
  }
}
```

### 3.3 Publishing System

#### Multi-stage Publishing Workflow
```javascript
class PublishingEngine {
  constructor() {
    this.templates = new Map();
    this.publishingQueue = [];
    this.loadTemplates();
  }

  async publishContent(contentId, publishingOptions) {
    const content = await this.getContent(contentId);
    const template = this.templates.get(publishingOptions.template);
    
    if (!template) {
      throw new Error(`Template ${publishingOptions.template} not found`);
    }

    // Validate content for publication
    const validation = await this.validateContent(content, template);
    if (!validation.isValid) {
      throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
    }

    // Apply template and generate final content
    const publishedContent = await this.applyTemplate(content, template, publishingOptions);
    
    // Save to appropriate collection based on visibility
    let publicationResult;
    switch (publishingOptions.visibility) {
      case 'private':
        publicationResult = await this.savePrivateContent(publishedContent);
        break;
      case 'group':
        publicationResult = await this.saveGroupContent(publishedContent, publishingOptions.groupId);
        break;
      case 'public':
        publicationResult = await this.savePublicContent(publishedContent);
        break;
    }

    // Update original content status
    await this.updateContentStatus(contentId, 'published', {
      publicationId: publicationResult.id,
      publishedAt: new Date(),
      publicUrl: publicationResult.url
    });

    // Generate LifeCV entry
    await this.createLifeCVEntry(content.userId, {
      type: 'contribution',
      title: `Published: ${content.title}`,
      description: `Published content using CommsHub`,
      sourcePlatform: 'commshub',
      sourceUrl: publicationResult.url,
      tags: content.metadata.tags
    });

    // Send notifications
    await this.sendPublicationNotifications(publishedContent, publishingOptions);

    return publicationResult;
  }

  async applyTemplate(content, template, options) {
    const templateData = {
      title: content.title,
      content: content.content,
      author: await this.getUserDisplayName(content.userId),
      publishedAt: new Date(),
      tags: content.metadata.tags,
      category: content.metadata.category,
      readingTime: content.metadata.readingTime,
      ...options.templateData
    };

    // Process template with data
    const processedContent = await this.processTemplate(template, templateData);
    
    // Generate SEO metadata
    const seoData = await this.generateSEOMetadata(content, template);
    
    // Create social sharing data
    const socialData = await this.generateSocialMetadata(content, template);

    return {
      ...content,
      processedContent: processedContent,
      seo: seoData,
      social: socialData,
      template: template.id,
      publishingOptions: options
    };
  }

  async validateContent(content, template) {
    const errors = [];
    
    // Check required fields
    if (!content.title || content.title.trim().length === 0) {
      errors.push('Title is required');
    }
    
    if (!content.content || content.content.trim().length === 0) {
      errors.push('Content is required');
    }
    
    // Check template-specific requirements
    if (template.requirements) {
      if (template.requirements.minWordCount && content.metadata.wordCount < template.requirements.minWordCount) {
        errors.push(`Content must be at least ${template.requirements.minWordCount} words`);
      }
      
      if (template.requirements.requiredTags && template.requirements.requiredTags.length > 0) {
        const missingTags = template.requirements.requiredTags.filter(tag => 
          !content.metadata.tags.includes(tag)
        );
        if (missingTags.length > 0) {
          errors.push(`Missing required tags: ${missingTags.join(', ')}`);
        }
      }
    }
    
    // Check for inappropriate content
    const contentModerationResult = await this.moderateContent(content);
    if (!contentModerationResult.approved) {
      errors.push('Content does not meet community guidelines');
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: contentModerationResult.warnings || []
    };
  }
}
```

---

## 4. Template System

### 4.1 Content Templates

#### Template Structure
```typescript
interface ContentTemplate {
  templateId: string;
  name: string;
  description: string;
  category: 'article' | 'newsletter' | 'announcement' | 'report' | 'creative';
  preview: string; // URL to preview image
  structure: {
    sections: TemplateSection[];
    styling: CSSProperties;
    layout: 'single-column' | 'two-column' | 'magazine' | 'newsletter';
  };
  requirements: {
    minWordCount?: number;
    maxWordCount?: number;
    requiredTags?: string[];
    requiredSections?: string[];
  };
  customization: {
    allowColorChange: boolean;
    allowFontChange: boolean;
    allowLayoutChange: boolean;
    customFields: CustomField[];
  };
  seoOptimized: boolean;
  mobileResponsive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface TemplateSection {
  sectionId: string;
  name: string;
  type: 'header' | 'content' | 'sidebar' | 'footer' | 'custom';
  required: boolean;
  placeholder: string;
  formatting: {
    allowedElements: string[];
    maxLength?: number;
    validation?: RegExp;
  };
}
```

#### Default Templates
```javascript
const defaultTemplates = {
  modernArticle: {
    name: 'Modern Article',
    description: 'Clean, professional article layout',
    structure: {
      sections: [
        {
          sectionId: 'header',
          name: 'Article Header',
          type: 'header',
          required: true,
          placeholder: 'Enter your article title...',
          formatting: {
            allowedElements: ['h1', 'p', 'time'],
            maxLength: 100
          }
        },
        {
          sectionId: 'content',
          name: 'Main Content',
          type: 'content',
          required: true,
          placeholder: 'Write your article content...',
          formatting: {
            allowedElements: ['p', 'h2', 'h3', 'ul', 'ol', 'blockquote', 'img']
          }
        }
      ],
      styling: {
        fontFamily: 'Lora, serif',
        fontSize: '18px',
        lineHeight: '1.6',
        maxWidth: '700px',
        margin: '0 auto'
      },
      layout: 'single-column'
    }
  },

  newsletter: {
    name: 'Newsletter',
    description: 'Email-friendly newsletter template',
    structure: {
      sections: [
        {
          sectionId: 'header',
          name: 'Newsletter Header',
          type: 'header',
          required: true,
          placeholder: 'Newsletter title and date...'
        },
        {
          sectionId: 'featured',
          name: 'Featured Story',
          type: 'content',
          required: true,
          placeholder: 'Main story content...'
        },
        {
          sectionId: 'updates',
          name: 'Quick Updates',
          type: 'sidebar',
          required: false,
          placeholder: 'Brief updates and announcements...'
        }
      ],
      styling: {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        backgroundColor: '#f8f9fa',
        padding: '20px'
      },
      layout: 'two-column'
    }
  }
};
```

### 4.2 Template Customization

#### Template Editor
```javascript
class TemplateEditor {
  constructor(templateId) {
    this.templateId = templateId;
    this.template = null;
    this.previewContainer = null;
    this.isDirty = false;
  }

  async initialize() {
    this.template = await this.loadTemplate(this.templateId);
    this.renderEditor();
    this.setupPreview();
    this.attachEventListeners();
  }

  renderEditor() {
    const editorContainer = document.getElementById('template-editor');
    editorContainer.innerHTML = `
      <div class="template-editor-layout">
        <div class="editor-sidebar">
          <div class="section-list">
            <h3>Template Sections</h3>
            ${this.renderSectionList()}
          </div>
          <div class="styling-controls">
            <h3>Styling</h3>
            ${this.renderStylingControls()}
          </div>
        </div>
        <div class="editor-main">
          <div class="editor-toolbar">
            ${this.renderToolbar()}
          </div>
          <div class="template-preview" id="template-preview">
            ${this.renderPreview()}
          </div>
        </div>
      </div>
    `;
  }

  renderSectionList() {
    return this.template.structure.sections.map(section => `
      <div class="section-item" data-section-id="${section.sectionId}">
        <div class="section-header">
          <span class="section-name">${section.name}</span>
          <div class="section-controls">
            <button class="btn-edit" onclick="editSection('${section.sectionId}')">
              <i class="fas fa-edit"></i>
            </button>
            ${!section.required ? `
              <button class="btn-delete" onclick="deleteSection('${section.sectionId}')">
                <i class="fas fa-trash"></i>
              </button>
            ` : ''}
          </div>
        </div>
        <div class="section-meta">
          <span class="section-type">${section.type}</span>
          ${section.required ? '<span class="required-badge">Required</span>' : ''}
        </div>
      </div>
    `).join('');
  }

  updateStyling(property, value) {
    this.template.structure.styling[property] = value;
    this.updatePreview();
    this.markDirty();
  }

  addSection(sectionData) {
    const newSection = {
      sectionId: generateUniqueId(),
      ...sectionData
    };
    
    this.template.structure.sections.push(newSection);
    this.renderEditor();
    this.updatePreview();
    this.markDirty();
  }

  async saveTemplate() {
    if (!this.isDirty) return;

    try {
      await this.templateService.updateTemplate(this.templateId, this.template);
      this.isDirty = false;
      this.showSaveConfirmation();
    } catch (error) {
      console.error('Error saving template:', error);
      this.showSaveError();
    }
  }
}
```

---

## 5. Analytics & Engagement

### 5.1 Content Analytics

#### Analytics Data Collection
```javascript
class CommsHubAnalytics {
  constructor() {
    this.viewTracker = new ViewTracker();
    this.engagementTracker = new EngagementTracker();
    this.performanceMonitor = new PerformanceMonitor();
  }

  async trackContentView(contentId, userId, metadata = {}) {
    const viewRecord = {
      viewId: generateUniqueId(),
      contentId: contentId,
      userId: userId,
      timestamp: new Date(),
      sessionId: this.getSessionId(),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      location: await this.getUserLocation(),
      metadata: metadata
    };

    await this.saveViewRecord(viewRecord);
    await this.updateContentStats(contentId, 'view');
  }

  async trackEngagement(contentId, engagementType, data = {}) {
    const engagementRecord = {
      engagementId: generateUniqueId(),
      contentId: contentId,
      userId: this.getCurrentUserId(),
      type: engagementType, // 'like', 'share', 'comment', 'bookmark', 'time_spent'
      timestamp: new Date(),
      data: data
    };

    await this.saveEngagementRecord(engagementRecord);
    await this.updateContentStats(contentId, engagementType);
  }

  async generateContentReport(contentId, timeRange = '30d') {
    const [views, engagements, demographics] = await Promise.all([
      this.getViewStats(contentId, timeRange),
      this.getEngagementStats(contentId, timeRange),
      this.getDemographics(contentId, timeRange)
    ]);

    const report = {
      contentId: contentId,
      timeRange: timeRange,
      generatedAt: new Date(),
      summary: {
        totalViews: views.total,
        uniqueViews: views.unique,
        averageTimeSpent: views.averageTimeSpent,
        engagementRate: this.calculateEngagementRate(views.total, engagements.total),
        topReferrers: views.topReferrers,
        peakViewingTimes: views.peakTimes
      },
      engagement: {
        likes: engagements.likes,
        shares: engagements.shares,
        comments: engagements.comments,
        bookmarks: engagements.bookmarks,
        engagementTimeline: engagements.timeline
      },
      audience: {
        demographics: demographics,
        returningViewers: views.returningViewers,
        newViewers: views.newViewers,
        geographicDistribution: demographics.geography
      },
      performance: {
        loadTime: await this.getAverageLoadTime(contentId),
        bounceRate: this.calculateBounceRate(views),
        conversionRate: this.calculateConversionRate(views, engagements)
      }
    };

    return report;
  }

  calculateEngagementRate(views, engagements) {
    if (views === 0) return 0;
    return (engagements / views) * 100;
  }

  async getContentInsights(userId, timeRange = '30d') {
    const userContent = await this.getUserContent(userId);
    const insights = [];

    for (const content of userContent) {
      const report = await this.generateContentReport(content.entryId, timeRange);
      insights.push({
        contentId: content.entryId,
        title: content.title,
        performance: report.summary,
        recommendations: await this.generateRecommendations(report)
      });
    }

    return {
      totalContent: userContent.length,
      totalViews: insights.reduce((sum, item) => sum + item.performance.totalViews, 0),
      averageEngagementRate: insights.reduce((sum, item) => sum + item.performance.engagementRate, 0) / insights.length,
      topPerforming: insights.sort((a, b) => b.performance.totalViews - a.performance.totalViews).slice(0, 5),
      insights: insights,
      recommendations: await this.generateUserRecommendations(insights)
    };
  }
}
```

### 5.2 Group Analytics

#### Group Activity Tracking
```javascript
class GroupAnalytics {
  async generateGroupReport(groupId, timeRange = '30d') {
    const [activity, members, engagement] = await Promise.all([
      this.getGroupActivity(groupId, timeRange),
      this.getGroupMembers(groupId),
      this.getGroupEngagement(