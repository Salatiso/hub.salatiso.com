/* ================================================================================= */
/* FILE: assets/js/modules/pubhelp-templates.js - Template Management System        */
/* PURPOSE: Manages content templates and formatting for different publication types */
/* AUTHOR: Salatiso & Claude                                                          */
/* DATE: July 28, 2025                                                               */
/* ================================================================================= */

export class TemplateManager {
    constructor() {
        this.templates = new Map();
        this.customTemplates = new Map();
        this.initializeDefaultTemplates();
    }

    /**
     * Initialize all default templates
     */
    initializeDefaultTemplates() {
        // Quick Post Templates
        this.registerTemplate('quick_simple', {
            name: 'Simple Post',
            description: 'Clean, simple format for quick thoughts',
            contentType: 'quick_post',
            structure: this.getQuickPostStructure(),
            styles: this.getQuickPostStyles(),
            config: { 
                maxLength: 280, 
                showWordCount: true,
                placeholder: 'What\'s on your mind?'
            },
            preview: 'Your thought here...\n\n#hashtags'
        });

        this.registerTemplate('quick_announcement', {
            name: 'Announcement',
            description: 'Format for announcements and updates',
            contentType: 'quick_post',
            structure: this.getAnnouncementStructure(),
            styles: this.getQuickPostStyles(),
            config: { 
                maxLength: 500, 
                showWordCount: true,
                placeholder: 'Share your announcement...'
            },
            preview: '📢 ANNOUNCEMENT\n\nYour announcement...'
        });

        // Article Templates
        this.registerTemplate('article_standard', {
            name: 'Standard Article',
            description: 'Classic blog post format',
            contentType: 'article',
            structure: this.getArticleStructure(),
            styles: this.getArticleStyles(),
            config: { 
                showReadingTime: true, 
                enableComments: true,
                placeholder: 'Start writing your article...'
            },
            preview: 'Title\n\nIntroduction...\n\nMain content...\n\nConclusion...'
        });

        this.registerTemplate('article_listicle', {
            name: 'Listicle',
            description: 'List-based article format',
            contentType: 'article',
            structure: this.getListicleStructure(),
            styles: this.getArticleStyles(),
            config: { 
                showReadingTime: true, 
                enableComments: true,
                placeholder: 'Create your list-based article...'
            },
            preview: 'Title: X Things About...\n\n1. First point\n2. Second point\n3. Third point'
        });

        this.registerTemplate('article_howto', {
            name: 'How-To Guide',
            description: 'Step-by-step tutorial format',
            contentType: 'article',
            structure: this.getHowToStructure(),
            styles: this.getArticleStyles(),
            config: { 
                showReadingTime: true, 
                enableComments: true,
                placeholder: 'Write your step-by-step guide...'
            },
            preview: 'How to [Title]\n\nIntroduction\n\nStep 1: ...\nStep 2: ...\n\nConclusion'
        });

        // Research Paper Templates
        this.registerTemplate('research_academic', {
            name: 'Academic Paper',
            description: 'Formal academic research format',
            contentType: 'research_paper',
            structure: this.getResearchPaperStructure(),
            styles: this.getResearchPaperStyles(),
            config: { 
                enableCitations: true, 
                showWordCount: true,
                placeholder: 'Begin your research paper...'
            },
            preview: 'Title\n\nAbstract\n\nIntroduction\n\nMethodology\n\nResults\n\nDiscussion\n\nConclusion\n\nReferences'
        });

        this.registerTemplate('research_report', {
            name: 'Research Report',
            description: 'Business/industry research report',
            contentType: 'research_paper',
            structure: this.getResearchReportStructure(),
            styles: this.getResearchPaperStyles(),
            config: { 
                enableCitations: true, 
                showWordCount: true,
                placeholder: 'Write your research report...'
            },
            preview: 'Executive Summary\n\nIntroduction\n\nFindings\n\nAnalysis\n\nRecommendations\n\nConclusion'
        });

        // Open Letter Templates
        this.registerTemplate('letter_advocacy', {
            name: 'Advocacy Letter',
            description: 'Public advocacy and open letter format',
            contentType: 'open_letter',
            structure: this.getAdvocacyLetterStructure(),
            styles: this.getOpenLetterStyles(),
            config: { 
                showWordCount: true,
                placeholder: 'Write your open letter...'
            },
            preview: 'Dear [Recipient],\n\nOpening Statement\n\nMain Arguments\n\nCall to Action\n\nSincerely,\n[Your Name]'
        });

        // Newsletter Templates
        this.registerTemplate('newsletter_standard', {
            name: 'Standard Newsletter',
            description: 'Classic newsletter format',
            contentType: 'newsletter',
            structure: this.getNewsletterStructure(),
            styles: this.getNewsletterStyles(),
            config: { 
                enableSections: true, 
                showPreview: true,
                placeholder: 'Create your newsletter...'
            },
            preview: 'Header\n\nMain Story\n\nSecondary Stories\n\nFooter'
        });

        // Magazine Templates
        this.registerTemplate('magazine_feature', {
            name: 'Feature Article',
            description: 'Magazine-style feature article',
            contentType: 'magazine',
            structure: this.getMagazineFeatureStructure(),
            styles: this.getMagazineStyles(),
            config: { 
                showReadingTime: true,
                placeholder: 'Write your feature article...'
            },
            preview: 'Compelling Headline\n\nSubheading\n\nLead Paragraph\n\nBody Sections\n\nConclusion'
        });

        // Business Templates
        this.registerTemplate('memo_business', {
            name: 'Business Memo',
            description: 'Standard business memorandum',
            contentType: 'memorandum',
            structure: this.getBusinessMemoStructure(),
            styles: this.getMemoStyles(),
            config: { 
                showWordCount: true,
                placeholder: 'Write your business memo...'
            },
            preview: 'TO: [Recipient]\nFROM: [Sender]\nDATE: [Date]\nSUBJECT: [Subject]\n\nPurpose\n\nDetails\n\nAction Required'
        });

        this.registerTemplate('report_business', {
            name: 'Business Report',
            description: 'Comprehensive business report',
            contentType: 'report',
            structure: this.getBusinessReportStructure(),
            styles: this.getReportStyles(),
            config: { 
                showWordCount: true, 
                enableCharts: true,
                placeholder: 'Create your business report...'
            },
            preview: 'Executive Summary\n\nIntroduction\n\nFindings\n\nAnalysis\n\nRecommendations\n\nConclusion'
        });

        // Book Templates
        this.registerTemplate('book_fiction', {
            name: 'Fiction Book',
            description: 'Novel and fiction book format',
            contentType: 'book',
            structure: this.getFictionBookStructure(),
            styles: this.getBookStyles(),
            config: { 
                enableChapters: true, 
                showProgress: true,
                placeholder: 'Begin your story...'
            },
            preview: 'Chapter 1\n\nOpening scene...\n\nCharacter development...\n\nPlot progression...'
        });

        this.registerTemplate('book_nonfiction', {
            name: 'Non-Fiction Book',
            description: 'Educational and informational book format',
            contentType: 'book',
            structure: this.getNonFictionBookStructure(),
            styles: this.getBookStyles(),
            config: { 
                enableChapters: true, 
                showProgress: true,
                placeholder: 'Share your knowledge...'
            },
            preview: 'Introduction\n\nChapter 1: Foundation\n\nChapter 2: Development\n\nConclusion'
        });

        // Creative Writing Templates
        this.registerTemplate('creative_poetry', {
            name: 'Poetry',
            description: 'Poetry and verse format',
            contentType: 'creative',
            structure: this.getPoetryStructure(),
            styles: this.getCreativeStyles(),
            config: { 
                showWordCount: false,
                placeholder: 'Express your creativity...'
            },
            preview: 'Title\n\nVerse 1\nLine 1\nLine 2\n\nVerse 2\nLine 1\nLine 2'
        });

        this.registerTemplate('creative_short_story', {
            name: 'Short Story',
            description: 'Short fiction story format',
            contentType: 'creative',
            structure: this.getShortStoryStructure(),
            styles: this.getCreativeStyles(),
            config: { 
                showWordCount: true, 
                showReadingTime: true,
                placeholder: 'Tell your story...'
            },
            preview: 'Opening\n\nCharacter Introduction\n\nConflict\n\nClimax\n\nResolution'
        });
    }

    /**
     * Register a new template
     */
    registerTemplate(id, template) {
        this.templates.set(id, {
            id,
            ...template,
            createdAt: new Date(),
            isCustom: false
        });
    }

    /**
     * Register a custom template
     */
    registerCustomTemplate(id, template, userId) {
        this.customTemplates.set(id, {
            id,
            ...template,
            userId,
            createdAt: new Date(),
            isCustom: true
        });
    }

    /**
     * Get template by ID
     */
    getTemplate(id) {
        return this.templates.get(id) || this.customTemplates.get(id);
    }

    /**
     * Get all templates
     */
    getAllTemplates() {
        return Array.from(this.templates.values());
    }

    /**
     * Get templates by content type
     */
    getTemplatesByContentType(contentType) {
        return Array.from(this.templates.values()).filter(
            template => template.contentType === contentType
        );
    }

    /**
     * Get custom templates for user
     */
    getCustomTemplates(userId) {
        return Array.from(this.customTemplates.values()).filter(
            template => template.userId === userId
        );
    }

    // --- TEMPLATE STRUCTURES ---

    /**
     * Quick Post Structure
     */
    getQuickPostStructure() {
        return [
            { insert: 'What\'s on your mind?\n\n' },
            { insert: '#hashtags #topics' }
        ];
    }

    /**
     * Announcement Structure
     */
    getAnnouncementStructure() {
        return [
            { insert: '📢 ANNOUNCEMENT\n', attributes: { bold: true, size: 'large' } },
            { insert: '\nYour important announcement goes here...\n\n' },
            { insert: 'Key Details:\n', attributes: { bold: true } },
            { insert: '• Detail 1\n• Detail 2\n• Detail 3\n\n' },
            { insert: 'Thank you for your attention!' }
        ];
    }

    /**
     * Article Structure
     */
    getArticleStructure() {
        return [
            { insert: 'Your Article Title\n', attributes: { header: 1 } },
            { insert: '\nBy Author Name • ' },
            { insert: new Date().toLocaleDateString(), attributes: { italic: true } },
            { insert: '\n\nYour compelling introduction goes here. Hook your readers with an interesting fact, question, or statement that makes them want to continue reading.\n\n' },
            { insert: 'Main Point 1\n', attributes: { header: 2 } },
            { insert: 'Develop your first main point here. Provide evidence, examples, or detailed explanations to support your argument.\n\n' },
            { insert: 'Main Point 2\n', attributes: { header: 2 } },
            { insert: 'Continue with your second main point. Use clear transitions between sections to maintain flow.\n\n' },
            { insert: 'Conclusion\n', attributes: { header: 2 } },
            { insert: 'Wrap up your thoughts and provide a clear takeaway for your readers. Consider ending with a call to action or thought-provoking question.\n' }
        ];
    }

    /**
     * Listicle Structure
     */
    getListicleStructure() {
        return [
            { insert: 'X Essential Things About [Topic]\n', attributes: { header: 1 } },
            { insert: '\nIntroduction explaining why this list matters...\n\n' },
            { insert: '1. First Important Point\n', attributes: { header: 3 } },
            { insert: 'Explanation and details about the first point...\n\n' },
            { insert: '2. Second Important Point\n', attributes: { header: 3 } },
            { insert: 'Explanation and details about the second point...\n\n' },
            { insert: '3. Third Important Point\n', attributes: { header: 3 } },
            { insert: 'Explanation and details about the third point...\n\n' },
            { insert: 'Conclusion\n', attributes: { header: 2 } },
            { insert: 'Summarize the key takeaways from your list...\n' }
        ];
    }

    /**
     * How-To Structure
     */
    getHowToStructure() {
        return [
            { insert: 'How to [Accomplish Something]\n', attributes: { header: 1 } },
            { insert: '\nIntroduction: What you\'ll learn and why it\'s important...\n\n' },
            { insert: 'What You\'ll Need\n', attributes: { header: 2 } },
            { insert: '• Item 1\n• Item 2\n• Item 3\n\n' },
            { insert: 'Step 1: [First Action]\n', attributes: { header: 3 } },
            { insert: 'Detailed instructions for the first step...\n\n' },
            { insert: 'Step 2: [Second Action]\n', attributes: { header: 3 } },
            { insert: 'Detailed instructions for the second step...\n\n' },
            { insert: 'Step 3: [Third Action]\n', attributes: { header: 3 } },
            { insert: 'Detailed instructions for the third step...\n\n' },
            { insert: 'Conclusion\n', attributes: { header: 2 } },
            { insert: 'Summary and next steps...\n' }
        ];
    }

    /**
     * Research Paper Structure
     */
    getResearchPaperStructure() {
        return [
            { insert: 'Research Paper Title\n', attributes: { header: 1, align: 'center' } },
            { insert: '\nAuthor Name\nInstitution\n', attributes: { align: 'center', italic: true } },
            { insert: new Date().toLocaleDateString(), attributes: { align: 'center', italic: true } },
            { insert: '\n\nAbstract\n', attributes: { header: 2 } },
            { insert: 'Brief summary of your research, methodology, findings, and conclusions (150-250 words)...\n\n' },
            { insert: 'Keywords: ', attributes: { italic: true } },
            { insert: 'keyword1, keyword2, keyword3\n\n' },
            { insert: '1. Introduction\n', attributes: { header: 2 } },
            { insert: 'Background information, problem statement, and research objectives...\n\n' },
            { insert: '2. Literature Review\n', attributes: { header: 2 } },
            { insert: 'Review of existing research and theoretical framework...\n\n' },
            { insert: '3. Methodology\n', attributes: { header: 2 } },
            { insert: 'Research design, data collection methods, and analysis procedures...\n\n' },
            { insert: '4. Results\n', attributes: { header: 2 } },
            { insert: 'Presentation of findings with tables, figures, and statistical analysis...\n\n' },
            { insert: '5. Discussion\n', attributes: { header: 2 } },
            { insert: 'Interpretation of results, implications, and limitations...\n\n' },
            { insert: '6. Conclusion\n', attributes: { header: 2 } },
            { insert: 'Summary of key findings and recommendations for future research...\n\n' },
            { insert: 'References\n', attributes: { header: 2 } },
            { insert: 'List of cited sources in appropriate academic format...\n' }
        ];
    }

    /**
     * Research Report Structure
     */
    getResearchReportStructure() {
        return [
            { insert: 'Research Report Title\n', attributes: { header: 1 } },
            { insert: '\nExecutive Summary\n', attributes: { header: 2 } },
            { insert: 'Brief overview of key findings and recommendations...\n\n' },
            { insert: 'Introduction\n', attributes: { header: 2 } },
            { insert: 'Background, objectives, and scope of the research...\n\n' },
            { insert: 'Key Findings\n', attributes: { header: 2 } },
            { insert: 'Main discoveries and insights from the research...\n\n' },
            { insert: 'Analysis\n', attributes: { header: 2 } },
            { insert: 'Detailed analysis and interpretation of findings...\n\n' },
            { insert: 'Recommendations\n', attributes: { header: 2 } },
            { insert: 'Actionable recommendations based on findings...\n\n' },
            { insert: 'Conclusion\n', attributes: { header: 2 } },
            { insert: 'Summary and next steps...\n' }
        ];
    }

    /**
     * Advocacy Letter Structure
     */
    getAdvocacyLetterStructure() {
        return [
            { insert: 'Open Letter: [Title]\n', attributes: { header: 1 } },
            { insert: '\nDear [Recipient/Community],\n\n' },
            { insert: 'I am writing to bring attention to [issue/cause] that affects our community...\n\n' },
            { insert: 'The Problem\n', attributes: { header: 3 } },
            { insert: 'Description of the issue and its impact...\n\n' },
            { insert: 'Why This Matters\n', attributes: { header: 3 } },
            { insert: 'Explanation of the significance and urgency...\n\n' },
            { insert: 'What We Can Do\n', attributes: { header: 3 } },
            { insert: 'Specific actions and solutions...\n\n' },
            { insert: 'Call to Action\n', attributes: { header: 3 } },
            { insert: 'What you can do to help and get involved...\n\n' },
            { insert: 'Sincerely,\n[Your Name]\n[Your Title/Organization]' }
        ];
    }

    /**
     * Newsletter Structure
     */
    getNewsletterStructure() {
        return [
            { insert: 'Newsletter Title\n', attributes: { header: 1, align: 'center' } },
            { insert: 'Issue #X • ', attributes: { align: 'center' } },
            { insert: new Date().toLocaleDateString(), attributes: { align: 'center' } },
            { insert: '\n\nWelcome Message\n', attributes: { header: 2 } },
            { insert: 'Brief greeting and overview of this issue...\n\n' },
            { insert: 'Featured Story\n', attributes: { header: 2 } },
            { insert: 'Your main story or announcement...\n\n' },
            { insert: 'Quick Updates\n', attributes: { header: 2 } },
            { insert: '• Update 1\n• Update 2\n• Update 3\n\n' },
            { insert: 'Community Spotlight\n', attributes: { header: 2 } },
            { insert: 'Highlight community members or achievements...\n\n' },
            { insert: 'Upcoming Events\n', attributes: { header: 2 } },
            { insert: '• Event 1 - Date\n• Event 2 - Date\n• Event 3 - Date\n\n' },
            { insert: 'Thank you for reading!\n', attributes: { italic: true, align: 'center' } }
        ];
    }

    /**
     * Magazine Feature Structure
     */
    getMagazineFeatureStructure() {
        return [
            { insert: 'Compelling Headline\n', attributes: { header: 1 } },
            { insert: 'Engaging subheading that draws readers in\n', attributes: { italic: true, size: 'large' } },
            { insert: '\nBy [Author Name] • ' },
            { insert: new Date().toLocaleDateString(), attributes: { italic: true } },
            { insert: '\n\nLead paragraph that hooks the reader with compelling opening...\n\n' },
            { insert: 'Section 1\n', attributes: { header: 2 } },
            { insert: 'Detailed content with engaging storytelling...\n\n' },
            { insert: 'Section 2\n', attributes: { header: 2 } },
            { insert: 'Continue the narrative with supporting details...\n\n' },
            { insert: 'Section 3\n', attributes: { header: 2 } },
            { insert: 'Build toward the conclusion with key insights...\n\n' },
            { insert: 'Conclusion\n', attributes: { header: 2 } },
            { insert: 'Powerful ending that leaves lasting impression...\n' }
        ];
    }

    /**
     * Business Memo Structure
     */
    getBusinessMemoStructure() {
        return [
            { insert: 'MEMORANDUM\n', attributes: { header: 1, align: 'center' } },
            { insert: '\nTO: [Recipient Name/Department]\n', attributes: { bold: true } },
            { insert: 'FROM: [Your Name/Title]\n', attributes: { bold: true } },
            { insert: 'DATE: ' + new Date().toLocaleDateString() + '\n', attributes: { bold: true } },
            { insert: 'SUBJECT: [Brief Description of Topic]\n', attributes: { bold: true } },
            { insert: '\nPurpose\n', attributes: { header: 3 } },
            { insert: 'State the purpose of this memo clearly and concisely...\n\n' },
            { insert: 'Background\n', attributes: { header: 3 } },
            { insert: 'Provide necessary context and background information...\n\n' },
            { insert: 'Details\n', attributes: { header: 3 } },
            { insert: 'Present the main information, findings, or recommendations...\n\n' },
            { insert: 'Action Required\n', attributes: { header: 3 } },
            { insert: 'Specify what action is needed and by when...\n\n' },
            { insert: 'Please contact me if you have any questions.\n' }
        ];
    }

    /**
     * Business Report Structure
     */
    getBusinessReportStructure() {
        return [
            { insert: 'Business Report Title\n', attributes: { header: 1 } },
            { insert: '\nExecutive Summary\n', attributes: { header: 2 } },
            { insert: 'High-level overview of key findings and recommendations...\n\n' },
            { insert: 'Introduction\n', attributes: { header: 2 } },
            { insert: 'Purpose, scope, and methodology of the report...\n\n' },
            { insert: 'Current Situation\n', attributes: { header: 2 } },
            { insert: 'Analysis of the current state and challenges...\n\n' },
            { insert: 'Findings\n', attributes: { header: 2 } },
            { insert: 'Key discoveries and insights from analysis...\n\n' },
            { insert: 'Recommendations\n', attributes: { header: 2 } },
            { insert: 'Specific actionable recommendations...\n\n' },
            { insert: 'Implementation Plan\n', attributes: { header: 2 } },
            { insert: 'Steps for implementing recommendations...\n\n' },
            { insert: 'Conclusion\n', attributes: { header: 2 } },
            { insert: 'Summary and next steps...\n' }
        ];
    }

    /**
     * Fiction Book Structure
     */
    getFictionBookStructure() {
        return [
            { insert: 'Book Title\n', attributes: { header: 1, align: 'center' } },
            { insert: '\nBy [Author Name]\n', attributes: { align: 'center', italic: true } },
            { insert: '\n\nChapter 1\n', attributes: { header: 2 } },
            { insert: '\nThe opening scene that draws readers into your story world...\n\n' },
            { insert: 'Introduce your main character and setting. Create immediate engagement through action, dialogue, or compelling description...\n\n' },
            { insert: 'Build the foundation of your plot while establishing the tone and style of your narrative...\n\n' },
            { insert: 'Chapter 2\n', attributes: { header: 2 } },
            { insert: '\nContinue developing your characters and advancing the plot...\n\n' }
        ];
    }

    /**
     * Non-Fiction Book Structure
     */
    getNonFictionBookStructure() {
        return [
            { insert: 'Book Title\n', attributes: { header: 1, align: 'center' } },
            { insert: '\nBy [Author Name]\n', attributes: { align: 'center', italic: true } },
            { insert: '\n\nTable of Contents\n', attributes: { header: 2 } },
            { insert: 'Introduction\nChapter 1: [Title]\nChapter 2: [Title]\nChapter 3: [Title]\nConclusion\n\n' },
            { insert: 'Introduction\n', attributes: { header: 2 } },
            { insert: 'Welcome readers and explain what they will learn from this book...\n\n' },
            { insert: 'Chapter 1: Foundation Concepts\n', attributes: { header: 2 } },
            { insert: 'Introduce the fundamental concepts and principles...\n\n' },
            { insert: 'Chapter 2: Building Knowledge\n', attributes: { header: 2 } },
            { insert: 'Develop more advanced concepts and applications...\n\n' }
        ];
    }

    /**
     * Poetry Structure
     */
    getPoetryStructure() {
        return [
            { insert: 'Poem Title\n', attributes: { header: 2, align: 'center' } },
            { insert: '\nFirst verse line one\n' },
            { insert: 'First verse line two\n' },
            { insert: 'First verse line three\n\n' },
            { insert: 'Second verse line one\n' },
            { insert: 'Second verse line two\n' },
            { insert: 'Second verse line three\n\n' },
            { insert: 'Continue with additional verses...\n' }
        ];
    }

    /**
     * Short Story Structure
     */
    getShortStoryStructure() {
        return [
            { insert: 'Story Title\n', attributes: { header: 2, align: 'center' } },
            { insert: '\nOpening that immediately engages the reader...\n\n' },
            { insert: 'Character introduction and setting establishment...\n\n' },
            { insert: 'Rising action and conflict development...\n\n' },
            { insert: 'Climax - the turning point of your story...\n\n' },
            { insert: 'Resolution and conclusion...\n' }
        ];
    }

    // --- TEMPLATE STYLES ---

    /**
     * Quick Post Styles
     */
    getQuickPostStyles() {
        return {
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            lineHeight: '1.5',
            padding: '1rem',
            maxWidth: '500px',
            margin: '0 auto'
        };
    }

    /**
     * Article Styles
     */
    getArticleStyles() {
        return {
            fontFamily: 'Lora, serif',
            fontSize: '18px',
            lineHeight: '1.7',
            maxWidth: '700px',
            margin: '0 auto',
            padding: '2rem'
        };
    }

    /**
     * Research Paper Styles
     */
    getResearchPaperStyles() {
        return {
            fontFamily: 'Times New Roman, serif',
            fontSize: '12pt',
            lineHeight: '2.0',
            margin: '1in',
            textAlign: 'justify'
        };
    }

    /**
     * Open Letter Styles
     */
    getOpenLetterStyles() {
        return {
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto',
            padding: '2rem'
        };
    }

    /**
     * Newsletter Styles
     */
    getNewsletterStyles() {
        return {
            fontFamily: 'Inter, sans-serif',
            fontSize: '15px',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto',
            padding: '1.5rem',
            backgroundColor: '#f8fafc'
        };
    }

    /**
     * Magazine Styles
     */
    getMagazineStyles() {
        return {
            fontFamily: 'Playfair Display, serif',
            fontSize: '17px',
            lineHeight: '1.7',
            maxWidth: '750px',
            margin: '0 auto',
            padding: '2rem'
        };
    }

    /**
     * Memo Styles
     */
    getMemoStyles() {
        return {
            fontFamily: 'Arial, sans-serif',
            fontSize: '12pt',
            lineHeight: '1.5',
            maxWidth: '8.5in',
            margin: '1in',
            padding: '0'
        };
    }

    /**
     * Report Styles
     */
    getReportStyles() {
        return {
            fontFamily: 'Calibri, sans-serif',
            fontSize: '11pt',
            lineHeight: '1.5',
            maxWidth: '8.5in',
            margin: '1in',
            padding: '0'
        };
    }

    /**
     * Book Styles
     */
    getBookStyles() {
        return {
            fontFamily: 'Minion Pro, serif',
            fontSize: '11pt',
            lineHeight: '1.8',
            maxWidth: '6in',
            margin: '1in',
            padding: '0',
            textAlign: 'justify'
        };
    }

    /**
     * Creative Styles
     */
    getCreativeStyles() {
        return {
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto',
            padding: '2rem',
            textAlign: 'left'
        };
    }

    // --- UTILITY METHODS ---

    /**
     * Create custom template from existing content
     */
    createCustomTemplate(name, description, contentType, structure, styles, config, userId) {
        const templateId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const customTemplate = {
            name,
            description,
            contentType,
            structure,
            styles: styles || this.getDefaultStylesForContentType(contentType),
            config: config || this.getDefaultConfigForContentType(contentType),
            preview: this.generatePreviewFromStructure(structure)
        };

        this.registerCustomTemplate(templateId, customTemplate, userId);
        return templateId;
    }

    /**
     * Get default styles for content type
     */
    getDefaultStylesForContentType(contentType) {
        const styleMap = {
            'quick_post': this.getQuickPostStyles(),
            'article': this.getArticleStyles(),
            'essay': this.getArticleStyles(),
            'research_paper': this.getResearchPaperStyles(),
            'open_letter': this.getOpenLetterStyles(),
            'newsletter': this.getNewsletterStyles(),
            'magazine': this.getMagazineStyles(),
            'memorandum': this.getMemoStyles(),
            'report': this.getReportStyles(),
            'book': this.getBookStyles(),
            'creative': this.getCreativeStyles()
        };

        return styleMap[contentType] || this.getArticleStyles();
    }

    /**
     * Get default config for content type
     */
    getDefaultConfigForContentType(contentType) {
        const configMap = {
            'quick_post': { maxLength: 280, showWordCount: true },
            'article': { showReadingTime: true, enableComments: true },
            'essay': { showWordCount: true, showReadingTime: true },
            'research_paper': { enableCitations: true, showWordCount: true },
            'open_letter': { showWordCount: true },
            'newsletter': { enableSections: true, showPreview: true },
            'magazine': { showReadingTime: true },
            'memorandum': { showWordCount: true },
            'report': { showWordCount: true, enableCharts: true },
            'book': { enableChapters: true, showProgress: true },
            'creative': { showWordCount: true, showReadingTime: true }
        };

        return configMap[contentType] || { showWordCount: true };
    }

    /**
     * Generate preview text from structure
     */
    generatePreviewFromStructure(structure) {
        if (!Array.isArray(structure)) return 'Custom template preview...';
        
        return structure
            .slice(0, 5) // Take first 5 elements
            .map(item => {
                if (typeof item.insert === 'string') {
                    return item.insert.trim();
                }
                return '';
            })
            .filter(text => text.length > 0)
            .join('\n')
            .substring(0, 200) + '...';
    }

    /**
     * Delete custom template
     */
    deleteCustomTemplate(templateId, userId) {
        const template = this.customTemplates.get(templateId);
        if (template && template.userId === userId) {
            this.customTemplates.delete(templateId);
            return true;
        }
        return false;
    }

    /**
     * Update custom template
     */
    updateCustomTemplate(templateId, updates, userId) {
        const template = this.customTemplates.get(templateId);
        if (template && template.userId === userId) {
            const updatedTemplate = {
                ...template,
                ...updates,
                updatedAt: new Date()
            };
            this.customTemplates.set(templateId, updatedTemplate);
            return updatedTemplate;
        }
        return null;
    }

    /**
     * Search templates by name or description
     */
    searchTemplates(query, contentType = null) {
        const allTemplates = [
            ...this.templates.values(),
            ...this.customTemplates.values()
        ];

        const lowerQuery = query.toLowerCase();
        
        return allTemplates.filter(template => {
            const matchesQuery =
                template.name.toLowerCase().includes(lowerQuery) ||
                template.description.toLowerCase().includes(lowerQuery);
            
            const matchesType = !contentType || template.contentType === contentType;
            
            return matchesQuery && matchesType;
        });
    }

    /**
     * Get template statistics
     */
    getTemplateStats() {
        const defaultTemplates = Array.from(this.templates.values());
        const customTemplates = Array.from(this.customTemplates.values());
        
        const contentTypeStats = {};
        
        [...defaultTemplates, ...customTemplates].forEach(template => {
            const type = template.contentType;
            contentTypeStats[type] = (contentTypeStats[type] || 0) + 1;
        });

        return {
            totalTemplates: defaultTemplates.length + customTemplates.length,
            defaultTemplates: defaultTemplates.length,
            customTemplates: customTemplates.length,
            contentTypeBreakdown: contentTypeStats
        };
    }

    /**
     * Export template for sharing
     */
    exportTemplate(templateId) {
        const template = this.getTemplate(templateId);
        if (!template) return null;

        return {
            name: template.name,
            description: template.description,
            contentType: template.contentType,
            structure: template.structure,
            styles: template.styles,
            config: template.config,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
    }

    /**
     * Import template from export data
     */
    importTemplate(templateData, userId) {
        if (!this.validateTemplateData(templateData)) {
            throw new Error('Invalid template data');
        }

        const templateId = this.createCustomTemplate(
            templateData.name,
            templateData.description,
            templateData.contentType,
            templateData.structure,
            templateData.styles,
            templateData.config,
            userId
        );

        return templateId;
    }

    /**
     * Validate template data structure
     */
    validateTemplateData(data) {
        const requiredFields = ['name', 'description', 'contentType', 'structure'];
        
        return requiredFields.every(field => {
            return data.hasOwnProperty(field) && data[field] != null;
        }) && Array.isArray(data.structure);
    }

    /**
     * Get popular templates (mock implementation)
     */
    getPopularTemplates(limit = 10) {
        // In a real implementation, this would be based on usage statistics
        const popularTemplateIds = [
            'article_standard',
            'quick_simple',
            'newsletter_standard',
            'research_academic',
            'letter_advocacy',
            'magazine_feature',
            'memo_business',
            'book_nonfiction',
            'creative_short_story',
            'article_howto'
        ];

        return popularTemplateIds
            .slice(0, limit)
            .map(id => this.getTemplate(id))
            .filter(template => template != null);
    }

    /**
     * Get recommended templates based on content type
     */
    getRecommendedTemplates(contentType, limit = 5) {
        const templates = this.getTemplatesByContentType(contentType);
        
        // Simple recommendation: return first few templates of the type
        return templates.slice(0, limit);
    }
}

// Export the TemplateManager class
export default TemplateManager;