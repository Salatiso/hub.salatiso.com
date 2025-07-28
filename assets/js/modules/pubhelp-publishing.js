/* ================================================================================= */
/* FILE: assets/js/modules/pubhelp-publishing.js - Publishing Workflow Manager      */
/* PURPOSE: Manages content publishing workflows and destinations                     */
/* AUTHOR: Salatiso & Claude                                                          */
/* DATE: July 28, 2025                                                               */
/* ================================================================================= */

import { auth, db } from '../firebase-config.js';
import { 
    doc, 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDoc,
    getDocs,
    query,
    where,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

export class PublishingManager {
    constructor() {
        this.currentUser = null;
        this.publishingQueue = [];
        this.socialPlatforms = new Map();
        this.initializeSocialPlatforms();
    }

    /**
     * Initialize social media platforms
     */
    initializeSocialPlatforms() {
        this.socialPlatforms.set('twitter', {
            name: 'Twitter',
            icon: 'fab fa-twitter',
            maxLength: 280,
            enabled: false,
            apiEndpoint: null
        });

        this.socialPlatforms.set('facebook', {
            name: 'Facebook',
            icon: 'fab fa-facebook',
            maxLength: 63206,
            enabled: false,
            apiEndpoint: null
        });

        this.socialPlatforms.set('linkedin', {
            name: 'LinkedIn',
            icon: 'fab fa-linkedin',
            maxLength: 3000,
            enabled: false,
            apiEndpoint: null
        });

        this.socialPlatforms.set('medium', {
            name: 'Medium',
            icon: 'fab fa-medium',
            maxLength: null,
            enabled: false,
            apiEndpoint: null
        });
    }

    /**
     * Set current user
     */
    setUser(user) {
        this.currentUser = user;
    }

    /**
     * Publish content to specified destination
     */
    async publishContent(contentId, publishingOptions) {
        try {
            const content = await this.getContent(contentId);
            if (!content) {
                throw new Error('Content not found');
            }

            const publishingResult = {
                contentId,
                destinations: [],
                errors: [],
                publishedAt: new Date()
            };

            // Validate publishing options
            const validationResult = this.validatePublishingOptions(publishingOptions, content);
            if (!validationResult.isValid) {
                throw new Error(validationResult.errors.join(', '));
            }

            // Process each publishing destination
            for (const destination of publishingOptions.destinations) {
                try {
                    const result = await this.publishToDestination(content, destination, publishingOptions);
                    publishingResult.destinations.push(result);
                } catch (error) {
                    console.error(`Publishing to ${destination.type} failed:`, error);
                    publishingResult.errors.push({
                        destination: destination.type,
                        error: error.message
                    });
                }
            }

            // Update content with publishing information
            await this.updateContentPublishingStatus(contentId, publishingResult);

            return publishingResult;

        } catch (error) {
            console.error('Publishing failed:', error);
            throw error;
        }
    }

    /**
     * Publish to specific destination
     */
    async publishToDestination(content, destination, options) {
        switch (destination.type) {
            case 'private':
                return await this.publishPrivate(content, destination, options);
            case 'group':
                return await this.publishToGroup(content, destination, options);
            case 'public':
                return await this.publishPublic(content, destination, options);
            case 'marketplace':
                return await this.publishToMarketplace(content, destination, options);
            case 'social':
                return await this.publishToSocial(content, destination, options);
            case 'external':
                return await this.publishToExternal(content, destination, options);
            default:
                throw new Error(`Unknown destination type: ${destination.type}`);
        }
    }

    /**
     * Publish as private content
     */
    async publishPrivate(content, destination, options) {
        const updateData = {
            status: 'private',
            visibility: 'private',
            publishedAt: serverTimestamp(),
            lastUpdatedAt: serverTimestamp()
        };

        await updateDoc(
            doc(db, 'users', this.currentUser.uid, 'pubhelpContent', content.id),
            updateData
        );

        return {
            type: 'private',
            status: 'success',
            url: null,
            message: 'Content saved as private'
        };
    }

    /**
     * Publish to group
     */
    async publishToGroup(content, destination, options) {
        if (!destination.groupId) {
            throw new Error('Group ID is required for group publishing');
        }

        // Verify user is member of the group
        const groupDoc = await getDoc(doc(db, 'pubhelpGroups', destination.groupId));
        if (!groupDoc.exists()) {
            throw new Error('Group not found');
        }

        const groupData = groupDoc.data();
        if (!groupData.members.includes(this.currentUser.uid)) {
            throw new Error('You are not a member of this group');
        }

        const updateData = {
            status: 'group',
            visibility: 'group',
            groupId: destination.groupId,
            publishedAt: serverTimestamp(),
            lastUpdatedAt: serverTimestamp()
        };

        await updateDoc(
            doc(db, 'users', this.currentUser.uid, 'pubhelpContent', content.id),
            updateData
        );

        // Add to group's shared content
        await addDoc(collection(db, 'pubhelpGroups', destination.groupId, 'sharedContent'), {
            contentId: content.id,
            authorId: this.currentUser.uid,
            authorName: this.currentUser.displayName || 'Anonymous',
            title: content.title,
            contentType: content.contentType,
            sharedAt: serverTimestamp()
        });

        return {
            type: 'group',
            status: 'success',
            url: null,
            message: `Content shared with group: ${groupData.name}`
        };
    }

    /**
     * Publish publicly
     */
    async publishPublic(content, destination, options) {
        const publicUrl = `${window.location.origin}/public/${this.currentUser.uid}/${content.id}`;
        
        const updateData = {
            status: 'public',
            visibility: 'public',
            publicUrl: publicUrl,
            publishedAt: serverTimestamp(),
            lastUpdatedAt: serverTimestamp(),
            seo: {
                title: options.seoTitle || content.title,
                description: options.seoDescription || this.generateExcerpt(content.content),
                keywords: options.tags || []
            }
        };

        // Add to public publications collection for discoverability
        await addDoc(collection(db, 'publicPublications'), {
            contentId: content.id,
            authorId: this.currentUser.uid,
            authorName: this.currentUser.displayName || 'Anonymous',
            title: content.title,
            contentType: content.contentType,
            excerpt: this.generateExcerpt(content.content),
            tags: options.tags || [],
            publishedAt: serverTimestamp(),
            publicUrl: publicUrl
        });

        await updateDoc(
            doc(db, 'users', this.currentUser.uid, 'pubhelpContent', content.id),
            updateData
        );

        return {
            type: 'public',
            status: 'success',
            url: publicUrl,
            message: 'Content published publicly'
        };
    }

    /**
     * Publish to marketplace
     */
    async publishToMarketplace(content, destination, options) {
        if (!options.pricing) {
            throw new Error('Pricing information is required for marketplace publishing');
        }

        const publicUrl = `${window.location.origin}/marketplace/${this.currentUser.uid}/${content.id}`;
        
        const updateData = {
            status: 'marketplace',
            visibility: 'marketplace',
            publicUrl: publicUrl,
            pricing: {
                isFree: options.pricing.isFree || false,
                price: options.pricing.price || 0,
                currency: options.pricing.currency || 'ZAR'
            },
            publishedAt: serverTimestamp(),
            lastUpdatedAt: serverTimestamp()
        };

        // Add to marketplace collection
        await addDoc(collection(db, 'marketplace'), {
            contentId: content.id,
            authorId: this.currentUser.uid,
            authorName: this.currentUser.displayName || 'Anonymous',
            title: content.title,
            contentType: content.contentType,
            excerpt: this.generateExcerpt(content.content),
            tags: options.tags || [],
            pricing: updateData.pricing,
            publishedAt: serverTimestamp(),
            publicUrl: publicUrl
        });

        await updateDoc(
            doc(db, 'users', this.currentUser.uid, 'pubhelpContent', content.id),
            updateData
        );

        return {
            type: 'marketplace',
            status: 'success',
            url: publicUrl,
            message: 'Content published to marketplace'
        };
    }

    /**
     * Publish to social media
     */
    async publishToSocial(content, destination, options) {
        const platform = this.socialPlatforms.get(destination.platform);
        if (!platform) {
            throw new Error(`Unsupported social platform: ${destination.platform}`);
        }

        if (!platform.enabled) {
            throw new Error(`${platform.name} integration is not enabled`);
        }

        // Format content for social media
        const socialContent = this.formatContentForSocial(content, destination.platform, options);
        
        // In a real implementation, this would call the social media API
        // For now, we'll simulate the posting
        const result = await this.simulateSocialPost(socialContent, destination.platform);

        return {
            type: 'social',
            platform: destination.platform,
            status: result.success ? 'success' : 'failed',
            url: result.url,
            message: result.message
        };
    }

    /**
     * Publish to external platforms
     */
    async publishToExternal(content, destination, options) {
        // This would handle publishing to external platforms like WordPress, Ghost, etc.
        // For now, we'll return a placeholder
        return {
            type: 'external',
            platform: destination.platform,
            status: 'pending',
            url: null,
            message: 'External publishing is not yet implemented'
        };
    }

    /**
     * Schedule content for future publishing
     */
    async scheduleContent(contentId, publishingOptions, scheduledDate) {
        const scheduleData = {
            contentId,
            publishingOptions,
            scheduledDate: scheduledDate,
            status: 'scheduled',
            createdAt: serverTimestamp(),
            userId: this.currentUser.uid
        };

        const scheduleRef = await addDoc(collection(db, 'publishingSchedule'), scheduleData);

        // Update content with scheduled status
        await updateDoc(
            doc(db, 'users', this.currentUser.uid, 'pubhelpContent', contentId),
            {
                status: 'scheduled',
                scheduledFor: scheduledDate,
                scheduleId: scheduleRef.id,
                lastUpdatedAt: serverTimestamp()
            }
        );

        return {
            scheduleId: scheduleRef.id,
            scheduledDate: scheduledDate,
            message: 'Content scheduled for publishing'
        };
    }

    /**
     * Cancel scheduled publishing
     */
    async cancelScheduledPublishing(contentId, scheduleId) {
        // Remove from schedule
        await deleteDoc(doc(db, 'publishingSchedule', scheduleId));

        // Update content status
        await updateDoc(
            doc(db, 'users', this.currentUser.uid, 'pubhelpContent', contentId),
            {
                status: 'draft',
                scheduledFor: null,
                scheduleId: null,
                lastUpdatedAt: serverTimestamp()
            }
        );

        return {
            message: 'Scheduled publishing cancelled'
        };
    }

    /**
     * Unpublish content
     */
    async unpublishContent(contentId) {
        const content = await this.getContent(contentId);
        if (!content) {
            throw new Error('Content not found');
        }

        const updateData = {
            status: 'private',
            visibility: 'private',
            publicUrl: null,
            unpublishedAt: serverTimestamp(),
            lastUpdatedAt: serverTimestamp()
        };

        // Remove from public collections if it was public
        if (content.status === 'public') {
            const publicQuery = query(
                collection(db, 'publicPublications'),
                where('contentId', '==', contentId),
                where('authorId', '==', this.currentUser.uid)
            );
            const publicDocs = await getDocs(publicQuery);
            publicDocs.forEach(doc => deleteDoc(doc.ref));
        }

        // Remove from marketplace if it was in marketplace
        if (content.status === 'marketplace') {
            const marketplaceQuery = query(
                collection(db, 'marketplace'),
                where('contentId', '==', contentId),
                where('authorId', '==', this.currentUser.uid)
            );
            const marketplaceDocs = await getDocs(marketplaceQuery);
            marketplaceDocs.forEach(doc => deleteDoc(doc.ref));
        }

        await updateDoc(
            doc(db, 'users', this.currentUser.uid, 'pubhelpContent', contentId),
            updateData
        );

        return {
            message: 'Content unpublished successfully'
        };
    }

    /**
     * Get publishing analytics
     */
    async getPublishingAnalytics(contentId) {
        // This would fetch analytics data from various sources
        // For now, return mock data
        return {
            contentId,
            views: 0,
            likes: 0,
            shares: 0,
            comments: 0,
            revenue: 0,
            platforms: {
                public: { views: 0, engagement: 0 },
                social: { shares: 0, likes: 0 },
                marketplace: { views: 0, purchases: 0 }
            },
            lastUpdated: new Date()
        };
    }

    /**
     * Get content publishing history
     */
    async getPublishingHistory(contentId) {
        // This would fetch the publishing history from a dedicated collection
        // For now, return mock data
        return [
            {
                action: 'published',
                destination: 'public',
                timestamp: new Date(),
                status: 'success'
            }
        ];
    }

    // --- UTILITY METHODS ---

    /**
     * Get content by ID
     */
    async getContent(contentId) {
        const contentDoc = await getDoc(
            doc(db, 'users', this.currentUser.uid, 'pubhelpContent', contentId)
        );
        
        if (contentDoc.exists()) {
            return { id: contentDoc.id, ...contentDoc.data() };
        }
        
        return null;
    }

    /**
     * Validate publishing options
     */
    validatePublishingOptions(options, content) {
        const errors = [];

        if (!options.destinations || options.destinations.length === 0) {
            errors.push('At least one publishing destination is required');
        }

        // Validate each destination
        options.destinations.forEach((destination, index) => {
            if (!destination.type) {
                errors.push(`Destination ${index + 1}: Type is required`);
            }

            if (destination.type === 'group' && !destination.groupId) {
                errors.push(`Destination ${index + 1}: Group ID is required for group publishing`);
            }

            if (destination.type === 'marketplace' && !options.pricing) {
                errors.push(`Destination ${index + 1}: Pricing is required for marketplace publishing`);
            }

            if (destination.type === 'social' && !destination.platform) {
                errors.push(`Destination ${index + 1}: Platform is required for social publishing`);
            }
        });

        // Validate content requirements
        if (!content.title || content.title.trim().length === 0) {
            errors.push('Content title is required');
        }

        if (!content.content || content.content.trim().length === 0) {
            errors.push('Content body is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Update content publishing status
     */
    async updateContentPublishingStatus(contentId, publishingResult) {
        const updateData = {
            publishingHistory: publishingResult,
            lastPublishedAt: serverTimestamp(),
            lastUpdatedAt: serverTimestamp()
        };

        await updateDoc(
            doc(db, 'users', this.currentUser.uid, 'pubhelpContent', contentId),
            updateData
        );
    }

    /**
     * Generate excerpt from content
     */
    generateExcerpt(content, maxLength = 160) {
        if (!content) return '';
        
        // If content is JSON (Quill Delta), extract text
        try {
            const delta = JSON.parse(content);
            if (delta.ops) {
                const text = delta.ops
                    .filter(op => typeof op.insert === 'string')
                    .map(op => op.insert)
                    .join('');
                return text.substring(0, maxLength).trim() + (text.length > maxLength ? '...' : '');
            }
        } catch (e) {
            // If not JSON, treat as plain text
        }
        
        // Handle HTML content
        const div = document.createElement('div');
        div.innerHTML = content;
        const text = div.textContent || div.innerText || '';
        
        return text.substring(0, maxLength).trim() + (text.length > maxLength ? '...' : '');
    }

    /**
     * Format content for social media
     */
    formatContentForSocial(content, platform, options) {
        const platformConfig = this.socialPlatforms.get(platform);
        const maxLength = platformConfig.maxLength;
        
        let socialContent = content.title;
        
        if (options.includeExcerpt) {
            const excerpt = this.generateExcerpt(content.content, 100);
            socialContent += '\n\n' + excerpt;
        }
        
        if (options.includeUrl && content.publicUrl) {
            socialContent += '\n\n' + content.publicUrl;
        }
        
        if (options.hashtags && options.hashtags.length > 0) {
            const hashtags = options.hashtags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');
            socialContent += '\n\n' + hashtags;
        }
        
        // Truncate if necessary
        if (maxLength && socialContent.length > maxLength) {
            socialContent = socialContent.substring(0, maxLength - 3) + '...';
        }
        
        return socialContent;
    }

    /**
     * Simulate social media posting (for development)
     */
    async simulateSocialPost(content, platform) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate success/failure
        const success = Math.random() > 0.1; // 90% success rate
        
        if (success) {
            return {
                success: true,
                url: `https://${platform}.com/post/mock-${Date.now()}`,
                message: `Successfully posted to ${platform}`
            };
        } else {
            return {
                success: false,
                url: null,
                message: `Failed to post to ${platform}: API error`
            };
        }
    }

    /**
     * Get available publishing destinations
     */
    getAvailableDestinations() {
        return [
            {
                type: 'private',
                name: 'Private',
                description: 'Keep as private draft',
                icon: 'fas fa-lock',
                enabled: true
            },
            {
                type: 'group',
                name: 'Group',
                description: 'Share with specific group',
                icon: 'fas fa-users',
                enabled: true
            },
            {
                type: 'public',
                name: 'Public',
                description: 'Publish publicly on the internet',
                icon: 'fas fa-globe',
                enabled: true
            },
            {
                type: 'marketplace',
                name: 'Marketplace',
                description: 'Sell your content',
                icon: 'fas fa-store',
                enabled: true
            },
            {
                type: 'social',
                name: 'Social Media',
                description: 'Share on social platforms',
                icon: 'fas fa-share-alt',
                enabled: false // Would be enabled when social integrations are set up
            },
            {
                type: 'external',
                name: 'External Platforms',
                description: 'Publish to external sites',
                icon: 'fas fa-external-link-alt',
                enabled: false // Would be enabled when external integrations are set up
            }
        ];
    }

    /**
     * Get social media platforms
     */
    getSocialPlatforms() {
        return Array.from(this.socialPlatforms.entries()).map(([key, platform]) => ({
            id: key,
            ...platform
        }));
    }

    /**
     * Enable social platform
     */
    enableSocialPlatform(platformId, apiConfig) {
        const platform = this.socialPlatforms.get(platformId);
        if (platform) {
            platform.enabled = true;
            platform.apiEndpoint = apiConfig.endpoint;
            platform.credentials = apiConfig.credentials;
        }
    }

    /**
     * Disable social platform
     */
    disableSocialPlatform(platformId) {
        const platform = this.socialPlatforms.get(platformId);
        if (platform) {
            platform.enabled = false;
            platform.apiEndpoint = null;
            platform.credentials = null;
        }
    }
}

// Export the PublishingManager class
export default PublishingManager;