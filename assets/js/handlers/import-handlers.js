/* ================================================================================= */
/* FILE: assets/js/handlers/import-handlers.js (COMPREHENSIVE IMPORT SYSTEM)        */
/* PURPOSE: Handle all import operations - JSON, files, internet search             */
/* ================================================================================= */

import { importData } from '../services/life-cv-data-service.js';
import { showModal, hideModal, showConflictResolution } from '../components/lifecv-modals.js';
import { showNotification } from '../utils/notifications.js';

let processingFile = false;
let selectedSearchResults = [];

/**
 * Initialize import handlers
 */
export function init() {
    console.log('Import handlers initialized');
    setupFileImportHandlers();
    setupJSONImportHandlers();
}

/**
 * Attach all import-related event listeners
 */
function attachImportEventListeners() {
    // JSON Import
    document.getElementById('json-import-btn')?.addEventListener('click', () => {
        showModal('json-import-modal');
    });
    
    document.getElementById('json-modal-import')?.addEventListener('click', handleJsonImport);
    
    // File Import
    document.getElementById('file-import-input')?.addEventListener('change', handleFileImport);
    
    // Internet Search
    document.getElementById('internet-search-btn')?.addEventListener('click', () => {
        showModal('internet-search-modal');
    });
    
    document.getElementById('search-form')?.addEventListener('submit', handleInternetSearch);
    
    // AI Instructions
    document.getElementById('ai-instructions-btn')?.addEventListener('click', () => {
        showModal('ai-instructions-modal');
    });
    
    // Import selected results
    document.getElementById('import-selected-btn')?.addEventListener('click', handleImportSelected);
}

/**
 * Setup file import handlers
 */
function setupFileImportHandlers() {
    const fileInput = document.getElementById('file-import-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileImport);
    }
}

/**
 * Setup JSON import handlers
 */
function setupJSONImportHandlers() {
    const jsonImportBtn = document.getElementById('json-import-btn');
    if (jsonImportBtn) {
        jsonImportBtn.addEventListener('click', () => {
            if (window.lifeCvModals && window.lifeCvModals.showModal) {
                window.lifeCvModals.showModal('json-import-modal');
            }
        });
    }
}

/**
 * Handle JSON import
 */
async function handleJsonImport() {
    const jsonInput = document.getElementById('json-input-area');
    const strategySelect = document.getElementById('import-strategy');
    
    if (!jsonInput || !strategySelect) return;
    
    const jsonText = jsonInput.value.trim();
    const strategy = strategySelect.value;
    
    if (!jsonText) {
        showNotification('Please enter JSON data to import', 'error');
        return;
    }
    
    try {
        const importData = JSON.parse(jsonText);
        
        // Show processing notification
        showNotification('Processing import...', 'info');
        
        // Import the data
        const result = await importData(importData, { 
            strategy, 
            conflicts: 'prompt' 
        });
        
        if (result.conflicts && result.conflicts.length > 0) {
            // Show conflict resolution modal
            showConflictResolution(result.conflicts, async (resolutions) => {
                await applyConflictResolutions(importData, resolutions);
                hideModal('json-import-modal');
                showNotification('Data imported successfully with conflict resolutions', 'success');
            });
        } else {
            hideModal('json-import-modal');
            showNotification('Data imported successfully', 'success');
        }
        
    } catch (error) {
        console.error('JSON import error:', error);
        showNotification(`Import failed: ${error.message}`, 'error');
    }
}

/**
 * Handle file import (PDF, DOCX, TXT)
 */
async function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file || processingFile) return;
    
    processingFile = true;
    
    try {
        showModal('file-processing-modal');
        updateProcessingStatus('Analyzing file...', 10);
        
        let extractedText = '';
        
        // Extract text based on file type
        if (file.type === 'application/pdf') {
            extractedText = await extractTextFromPDF(file);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                   file.name.endsWith('.docx')) {
            extractedText = await extractTextFromDOCX(file);
        } else if (file.type === 'text/plain') {
            extractedText = await extractTextFromTXT(file);
        } else {
            throw new Error('Unsupported file type. Please use PDF, DOCX, or TXT files.');
        }
        
        updateProcessingStatus('Extracting information with AI...', 50);
        
        // Process with AI (simulate API call)
        const structuredData = await processTextWithAI(extractedText);
        
        updateProcessingStatus('Finalizing import...', 90);
        
        // Import the structured data
        await importData(structuredData, { 
            strategy: 'merge', 
            conflicts: 'prompt' 
        });
        
        updateProcessingStatus('Complete!', 100);
        
        setTimeout(() => {
            hideModal('file-processing-modal');
            showNotification('File processed and imported successfully', 'success');
        }, 1000);
        
    } catch (error) {
        console.error('File import error:', error);
        hideModal('file-processing-modal');
        showNotification(`File import failed: ${error.message}`, 'error');
    } finally {
        processingFile = false;
        // Reset file input
        event.target.value = '';
    }
}

/**
 * Extract text from PDF file
 */
async function extractTextFromPDF(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        
        fileReader.onload = async function() {
            try {
                const typedArray = new Uint8Array(this.result);
                const pdf = await pdfjsLib.getDocument(typedArray).promise;
                let fullText = '';
                
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n';
                }
                
                resolve(fullText);
            } catch (error) {
                reject(new Error('Failed to extract text from PDF: ' + error.message));
            }
        };
        
        fileReader.onerror = () => reject(new Error('Failed to read PDF file'));
        fileReader.readAsArrayBuffer(file);
    });
}

/**
 * Extract text from DOCX file
 */
async function extractTextFromDOCX(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        
        fileReader.onload = async function() {
            try {
                const arrayBuffer = this.result;
                const result = await mammoth.extractRawText({ arrayBuffer });
                resolve(result.value);
            } catch (error) {
                reject(new Error('Failed to extract text from DOCX: ' + error.message));
            }
        };
        
        fileReader.onerror = () => reject(new Error('Failed to read DOCX file'));
        fileReader.readAsArrayBuffer(file);
    });
}

/**
 * Extract text from TXT file
 */
async function extractTextFromTXT(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        
        fileReader.onload = function() {
            resolve(this.result);
        };
        
        fileReader.onerror = () => reject(new Error('Failed to read text file'));
        fileReader.readAsText(file);
    });
}

/**
 * Process extracted text with AI simulation
 */
async function processTextWithAI(text) {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, this would call an AI service
    // For now, we'll do basic text parsing
    
    const structuredData = {
        personalInfo: {
            fullName: { value: extractName(text), isPublic: true, lastModified: new Date().toISOString() },
            email: { value: extractEmail(text), isPublic: true, lastModified: new Date().toISOString() },
            phone: { value: extractPhone(text), isPublic: false, lastModified: new Date().toISOString() }
        },
        professionalSummary: {
            summary: { value: extractSummary(text), isPublic: true, lastModified: new Date().toISOString() }
        },
        experience: extractExperience(text),
        education: extractEducation(text),
        skills: extractSkills(text)
    };
    
    return structuredData;
}

/**
 * Basic text extraction functions (these would be enhanced with real AI)
 */
function extractName(text) {
    // Simple name extraction logic
    const nameMatch = text.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/m);
    return nameMatch ? nameMatch[1] : '';
}

function extractEmail(text) {
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    return emailMatch ? emailMatch[1] : '';
}

function extractPhone(text) {
    const phoneMatch = text.match(/(\+?[\d\s\(\)-]{10,})/);
    return phoneMatch ? phoneMatch[1].trim() : '';
}

function extractSummary(text) {
    // Look for common summary section keywords
    const summaryKeywords = ['summary', 'profile', 'objective', 'about'];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        if (summaryKeywords.some(keyword => line.includes(keyword))) {
            // Return next few lines as summary
            return lines.slice(i + 1, i + 4).join(' ').trim();
        }
    }
    
    return '';
}

function extractExperience(text) {
    // Basic experience extraction
    const experience = [];
    const expKeywords = ['experience', 'work history', 'employment'];
    const lines = text.split('\n');
    
    // This is a simplified version - real AI would be much more sophisticated
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        if (expKeywords.some(keyword => line.includes(keyword))) {
            // Extract next few items as experience
            for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
                const expLine = lines[j].trim();
                if (expLine && expLine.length > 10) {
                    experience.push({
                        jobTitle: { value: expLine.split(' ')[0] || 'Position', isPublic: true, lastModified: new Date().toISOString() },
                        company: { value: expLine.split(' ')[1] || 'Company', isPublic: true, lastModified: new Date().toISOString() },
                        description: { value: expLine, isPublic: true, lastModified: new Date().toISOString() }
                    });
                }
            }
            break;
        }
    }
    
    return experience;
}

function extractEducation(text) {
    // Basic education extraction
    const education = [];
    const eduKeywords = ['education', 'qualifications', 'academic'];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        if (eduKeywords.some(keyword => line.includes(keyword))) {
            for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
                const eduLine = lines[j].trim();
                if (eduLine && eduLine.length > 5) {
                    education.push({
                        qualification: { value: eduLine, isPublic: true, lastModified: new Date().toISOString() },
                        institution: { value: 'Institution', isPublic: true, lastModified: new Date().toISOString() }
                    });
                }
            }
            break;
        }
    }
    
    return education;
}

function extractSkills(text) {
    // Basic skills extraction
    const skills = [];
    const skillKeywords = ['skills', 'competencies', 'technologies'];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        if (skillKeywords.some(keyword => line.includes(keyword))) {
            const skillsText = lines[i + 1] || '';
            const skillsList = skillsText.split(/[,\n\-•]/);
            
            skillsList.forEach(skill => {
                const trimmedSkill = skill.trim();
                if (trimmedSkill && trimmedSkill.length > 2) {
                    skills.push({
                        skillName: { value: trimmedSkill, isPublic: true, lastModified: new Date().toISOString() },
                        category: { value: 'General', isPublic: true, lastModified: new Date().toISOString() },
                        proficiency: { value: 'Intermediate', isPublic: true, lastModified: new Date().toISOString() }
                    });
                }
            });
            break;
        }
    }
    
    return skills;
}

/**
 * Handle internet search
 */
async function handleInternetSearch(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const searchParams = {
        name: formData.get('name') || document.getElementById('search-name')?.value,
        email: formData.get('email') || document.getElementById('search-email')?.value,
        phone: formData.get('phone') || document.getElementById('search-phone')?.value,
        location: formData.get('location') || document.getElementById('search-location')?.value,
        deepSearch: document.getElementById('deep-search')?.checked || false,
        securityAudit: document.getElementById('security-audit')?.checked || false
    };
    
    if (!searchParams.name) {
        showNotification('Please enter at least a name to search', 'error');
        return;
    }
    
    try {
        await performInternetSearch(searchParams);
    } catch (error) {
        console.error('Internet search error:', error);
        showNotification(`Search failed: ${error.message}`, 'error');
    }
}

/**
 * Perform internet search using Google Custom Search API
 */
async function performInternetSearch(params) {
    const loadingEl = document.getElementById('search-loading');
    const placeholderEl = document.getElementById('search-results-placeholder');
    const resultsEl = document.getElementById('search-results');
    
    // Show loading state
    placeholderEl?.classList.add('hidden');
    resultsEl?.classList.add('hidden');
    loadingEl?.classList.remove('hidden');
    
    try {
        const queries = generateSearchQueries(params);
        const allResults = [];
        
        for (const query of queries.slice(0, params.deepSearch ? 5 : 3)) {
            try {
                const results = await searchGoogle(query);
                allResults.push(...results);
                
                // Delay between requests
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error('Search query failed:', query, error);
            }
        }
        
        if (allResults.length === 0) {
            showNoSearchResults();
            return;
        }
        
        // Categorize and display results
        const categorizedResults = categorizeSearchResults(allResults, params.securityAudit);
        displaySearchResults(categorizedResults);
        
    } catch (error) {
        showSearchError(error);
    } finally {
        loadingEl?.classList.add('hidden');
    }
}

/**
 * Generate search queries based on user input
 */
function generateSearchQueries(params) {
    const queries = [];
    const { name, email, phone, location } = params;
    
    // Basic searches
    queries.push(`"${name}"`);
    queries.push(`${name} LinkedIn`);
    queries.push(`${name} resume CV`);
    
    if (email) {
        queries.push(`"${email}"`);
    }
    
    if (location) {
        queries.push(`"${name}" "${location}"`);
    }
    
    // Professional platforms
    queries.push(`${name} GitHub`);
    queries.push(`${name} profile`);
    queries.push(`${name} portfolio`);
    
    if (phone) {
        queries.push(`"${phone}"`);
    }
    
    return queries;
}

/**
 * Search Google using Custom Search API
 */
async function searchGoogle(query) {
    const config = window.lifeCvConfig;
    if (!config || !config.googleApiKey || !config.searchEngineId) {
        throw new Error('Google Search API not configured');
    }
    
    const url = `https://www.googleapis.com/customsearch/v1?key=${config.googleApiKey}&cx=${config.searchEngineId}&q=${encodeURIComponent(query)}&num=10`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Search API error: ${response.status} - ${errorData?.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
        return [];
    }
    
    return data.items.map(item => ({
        title: item.title,
        snippet: item.snippet || 'No description available',
        url: item.link,
        displayLink: item.displayLink || ''
    }));
}

/**
 * Categorize search results
 */
function categorizeSearchResults(results, securityAudit = false) {
    const categories = {
        profiles: [],
        professional: [],
        social: [],
        publications: [],
        mentions: [],
        potential_issues: []
    };
    
    results.forEach(result => {
        const snippet = result.snippet.toLowerCase();
        const title = result.title.toLowerCase();
        const domain = result.displayLink?.toLowerCase() || '';
        
        let category = 'mentions';
        let confidence = 0.5;
        
        // Professional profiles
        if (domain.includes('linkedin.com')) {
            category = 'profiles';
            confidence = 0.95;
        } else if (domain.includes('github.com')) {
            category = 'professional';
            confidence = 0.9;
        }
        // Social media
        else if (['twitter.com', 'facebook.com', 'instagram.com'].some(s => domain.includes(s))) {
            category = 'social';
            confidence = 0.8;
        }
        // Publications
        else if (['blog', 'article', 'publication', 'paper'].some(term => snippet.includes(term) || title.includes(term))) {
            category = 'publications';
            confidence = 0.7;
        }
        // Security audit - potential issues
        else if (securityAudit && ['court', 'arrest', 'charge', 'lawsuit', 'bankruptcy'].some(term => snippet.includes(term) || title.includes(term))) {
            category = 'potential_issues';
            confidence = 0.6;
        }
        
        categories[category].push({
            title: result.title,
            description: result.snippet,
            url: result.url,
            domain: result.displayLink,
            confidence,
            category
        });
    });
    
    return categories;
}

/**
 * Display search results
 */
function displaySearchResults(categorizedResults) {
    const resultsContainer = document.getElementById('search-results');
    const placeholderEl = document.getElementById('search-results-placeholder');
    
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = '';
    
    const totalResults = Object.values(categorizedResults).reduce((sum, items) => sum + items.length, 0);
    
    if (totalResults === 0) {
        showNoSearchResults();
        return;
    }
    
    // Add selection controls
    const selectionControls = document.createElement('div');
    selectionControls.className = 'mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg';
    selectionControls.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-slate-800">Search Results (${totalResults} found)</h3>
            <div class="space-x-2">
                <button onclick="window.importHandlers.selectAllResults()" class="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                    Select All
                </button>
                <button onclick="window.importHandlers.clearAllSelections()" class="px-3 py-1 bg-slate-200 text-slate-700 text-sm rounded hover:bg-slate-300">
                    Clear All
                </button>
            </div>
        </div>
    `;
    resultsContainer.appendChild(selectionControls);
    
    // Display categorized results
    Object.entries(categorizedResults).forEach(([category, items]) => {
        if (items.length === 0) return;
        
        const categorySection = document.createElement('div');
        categorySection.className = 'mb-6';
        
        const categoryColors = {
            profiles: 'bg-blue-50 border-blue-200',
            professional: 'bg-green-50 border-green-200',
            social: 'bg-purple-50 border-purple-200',
            publications: 'bg-yellow-50 border-yellow-200',
            mentions: 'bg-slate-50 border-slate-200',
            potential_issues: 'bg-red-50 border-red-200'
        };
        
        const categoryIcons = {
            profiles: 'fas fa-user-circle',
            professional: 'fas fa-briefcase',
            social: 'fas fa-users',
            publications: 'fas fa-newspaper',
            mentions: 'fas fa-quote-left',
            potential_issues: 'fas fa-exclamation-triangle'
        };
        
        categorySection.innerHTML = `
            <h4 class="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                <i class="${categoryIcons[category]} mr-2"></i>
                ${category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')} (${items.length})
            </h4>
            <div class="space-y-3">
                ${items.map((item, index) => `
                    <div class="search-result-item ${categoryColors[category]} border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-300" 
                         data-category="${category}" data-index="${index}" onclick="window.importHandlers.toggleResultSelection(this)">
                        <div class="flex items-start">
                            <input type="checkbox" class="result-checkbox mt-1 mr-3 rounded" onchange="event.stopPropagation()">
                            <div class="flex-1">
                                <h5 class="font-medium text-slate-800 mb-1">${item.title}</h5>
                                <p class="text-sm text-slate-600 mb-2">${item.description}</p>
                                <div class="flex items-center justify-between">
                                    <a href="${item.url}" target="_blank" class="text-xs text-indigo-600 hover:text-indigo-800" onclick="event.stopPropagation()">
                                        <i class="fas fa-external-link-alt mr-1"></i>View Source
                                    </a>
                                    <div class="flex items-center space-x-2">
                                        <span class="text-xs text-slate-400">${item.domain}</span>
                                        <span class="px-2 py-1 text-xs rounded-full bg-white bg-opacity-70">
                                            ${Math.round(item.confidence * 100)}% match
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        resultsContainer.appendChild(categorySection);
    });
    
    // Show results
    resultsContainer.classList.remove('hidden');
    placeholderEl?.classList.add('hidden');
    
    // Update selected count
    updateSelectedCount();
}

/**
 * Show no search results message
 */
function showNoSearchResults() {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
        <div class="text-center py-16">
            <div class="inline-block p-4 bg-yellow-100 rounded-full mb-4">
                <i class="fas fa-search text-yellow-600 text-2xl"></i>
            </div>
            <h3 class="text-lg font-semibold text-slate-800 mb-2">No Results Found</h3>
            <p class="text-slate-600 mb-4">We couldn't find any information online for the provided details.</p>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-auto max-w-md">
                <p class="text-sm text-blue-700"><strong>Tips to improve results:</strong></p>
                <ul class="text-xs text-blue-600 mt-2 space-y-1 list-disc list-inside">
                    <li>Try different name variations</li>
                    <li>Include professional email</li>
                    <li>Enable deep search option</li>
                    <li>Use manual JSON import</li>
                </ul>
            </div>
        </div>
    `;
    resultsContainer.classList.remove('hidden');
}

/**
 * Show search error
 */
function showSearchError(error) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
        <div class="text-center py-16">
            <div class="inline-block p-4 bg-red-100 rounded-full mb-4">
                <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
            </div>
            <h3 class="text-lg font-semibold text-slate-800 mb-2">Search Error</h3>
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 mx-auto max-w-2xl">
                <p class="text-sm text-red-700 mb-3"><strong>Error:</strong> ${error.message}</p>
                <p class="text-xs text-red-600">Please check your API configuration and try again.</p>
            </div>
            <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Retry
            </button>
        </div>
    `;
    resultsContainer.classList.remove('hidden');
}

/**
 * Toggle result selection
 */
export function toggleResultSelection(element) {
    const checkbox = element.querySelector('.result-checkbox');
    checkbox.checked = !checkbox.checked;
    
    if (checkbox.checked) {
        element.classList.add('ring-2', 'ring-indigo-500');
        addSelectedResult(element);
    } else {
        element.classList.remove('ring-2', 'ring-indigo-500');
        removeSelectedResult(element);
    }
    
    updateSelectedCount();
}

/**
 * Select all results
 */
export function selectAllResults() {
    const allResults = document.querySelectorAll('.search-result-item');
    allResults.forEach(item => {
        const checkbox = item.querySelector('.result-checkbox');
        if (!checkbox.checked) {
            checkbox.checked = true;
            item.classList.add('ring-2', 'ring-indigo-500');
            addSelectedResult(item);
        }
    });
    updateSelectedCount();
}

/**
 * Clear all selections
 */
export function clearAllSelections() {
    const allResults = document.querySelectorAll('.search-result-item');
    allResults.forEach(item => {
        const checkbox = item.querySelector('.result-checkbox');
        checkbox.checked = false;
        item.classList.remove('ring-2', 'ring-indigo-500');
    });
    selectedSearchResults = [];
    updateSelectedCount();
}

/**
 * Add selected result
 */
function addSelectedResult(element) {
    const category = element.dataset.category;
    const index = parseInt(element.dataset.index);
    
    const result = {
        category,
        index,
        element,
        data: extractResultData(element)
    };
    
    selectedSearchResults.push(result);
}

/**
 * Remove selected result
 */
function removeSelectedResult(element) {
    const category = element.dataset.category;
    const index = parseInt(element.dataset.index);
    
    selectedSearchResults = selectedSearchResults.filter(
        result => !(result.category === category && result.index === index)
    );
}

/**
 * Extract data from result element
 */
function extractResultData(element) {
    const title = element.querySelector('h5')?.textContent || '';
    const description = element.querySelector('p')?.textContent || '';
    const url = element.querySelector('a')?.href || '';
    const domain = element.querySelector('.text-slate-400')?.textContent || '';
    
    return { title, description, url, domain };
}

/**
 * Update selected count
 */
function updateSelectedCount() {
    const countElement = document.getElementById('selected-count');
    const importButton = document.getElementById('import-selected-btn');
    
    if (countElement) {
        countElement.textContent = selectedSearchResults.length;
    }
    
    if (importButton) {
        importButton.disabled = selectedSearchResults.length === 0;
    }
}

/**
 * Handle import of selected results
 */
async function handleImportSelected() {
    if (selectedSearchResults.length === 0) {
        showNotification('Please select some results to import', 'warning');
        return;
    }
    
    try {
        showNotification('Processing selected results...', 'info');
        
        // Convert selected results to structured data
        const structuredData = await convertSearchResultsToData(selectedSearchResults);
        
        // Import the data
        const result = await importData(structuredData, { 
            strategy: 'merge', 
            conflicts: 'prompt' 
        });
        
        if (result.conflicts && result.conflicts.length > 0) {
            // Show conflict resolution modal
            showConflictResolution(result.conflicts, async (resolutions) => {
                await applyConflictResolutions(structuredData, resolutions);
                hideModal('internet-search-modal');
                showNotification('Search results imported successfully with conflict resolutions', 'success');
            });
        } else {
            hideModal('internet-search-modal');
            showNotification('Search results imported successfully', 'success');
        }
        
        // Clear selections
        clearAllSelections();
        
    } catch (error) {
        console.error('Import selected results error:', error);
        showNotification(`Import failed: ${error.message}`, 'error');
    }
}

/**
 * Convert search results to structured LifeCV data
 */
async function convertSearchResultsToData(selectedResults) {
    const structuredData = {
        personalInfo: {},
        professionalSummary: {},
        experience: [],
        education: [],
        skills: [],
        projects: [],
        onlinePresence: []
    };
    
    selectedResults.forEach(result => {
        const { category, data } = result;
        
        switch (category) {
            case 'profiles':
                // Extract profile information
                if (data.domain?.includes('linkedin.com')) {
                    structuredData.onlinePresence.push({
                        platform: { value: 'LinkedIn', isPublic: true, lastModified: new Date().toISOString() },
                        profileUrl: { value: data.url, isPublic: true, lastModified: new Date().toISOString() },
                        description: { value: data.description, isPublic: true, lastModified: new Date().toISOString() }
                    });
                }
                break;
                
            case 'professional':
                if (data.domain?.includes('github.com')) {
                    structuredData.onlinePresence.push({
                        platform: { value: 'GitHub', isPublic: true, lastModified: new Date().toISOString() },
                        profileUrl: { value: data.url, isPublic: true, lastModified: new Date().toISOString() },
                        description: { value: data.description, isPublic: true, lastModified: new Date().toISOString() }
                    });
                }
                break;
                
            case 'social':
                const platform = extractPlatformFromDomain(data.domain);
                if (platform) {
                    structuredData.onlinePresence.push({
                        platform: { value: platform, isPublic: false, lastModified: new Date().toISOString() },
                        profileUrl: { value: data.url, isPublic: false, lastModified: new Date().toISOString() },
                        description: { value: data.description, isPublic: false, lastModified: new Date().toISOString() }
                    });
                }
                break;
                
            case 'publications':
                structuredData.projects.push({
                    projectName: { value: data.title, isPublic: true, lastModified: new Date().toISOString() },
                    description: { value: data.description, isPublic: true, lastModified: new Date().toISOString() },
                    projectUrl: { value: data.url, isPublic: true, lastModified: new Date().toISOString() },
                    category: { value: 'Publication', isPublic: true, lastModified: new Date().toISOString() }
                });
                break;
                
            case 'mentions':
                // Add as general online presence
                structuredData.onlinePresence.push({
                    platform: { value: data.domain || 'Web', isPublic: true, lastModified: new Date().toISOString() },
                    profileUrl: { value: data.url, isPublic: true, lastModified: new Date().toISOString() },
                    description: { value: data.description, isPublic: true, lastModified: new Date().toISOString() }
                });
                break;
        }
    });
    
    return structuredData;
}

/**
 * Extract platform name from domain
 */
function extractPlatformFromDomain(domain) {
    if (!domain) return null;
    
    const platformMap = {
        'linkedin.com': 'LinkedIn',
        'github.com': 'GitHub',
        'twitter.com': 'Twitter',
        'facebook.com': 'Facebook',
        'instagram.com': 'Instagram',
        'youtube.com': 'YouTube',
        'tiktok.com': 'TikTok'
    };
    
    for (const [key, value] of Object.entries(platformMap)) {
        if (domain.includes(key)) {
            return value;
        }
    }
    
    return domain;
}

/**
 * Apply conflict resolutions
 */
async function applyConflictResolutions(data, resolutions) {
    // Apply the user's conflict resolution choices
    for (const resolution of resolutions) {
        const { path, choice, newValue } = resolution;
        
        if (choice === 'keep_new' && newValue !== undefined) {
            // Update the data with the new value
            setNestedProperty(data, path, newValue);
        }
        // For 'keep_existing', we don't need to do anything
    }
    
    // Re-import with the resolved data
    await importData(data, { strategy: 'overwrite', conflicts: 'skip' });
}

/**
 * Set nested property value
 */
function setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
}

/**
 * Update processing status
 */
function updateProcessingStatus(message, progress) {
    const statusElement = document.getElementById('processing-status');
    const progressBar = document.getElementById('processing-progress');
    
    if (statusElement) {
        statusElement.textContent = message;
    }
    
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
}

/**
 * Expose functions to window for global access
 */
window.importHandlers = {
    toggleResultSelection,
    selectAllResults,
    clearAllSelections
};

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(init, 100);
    });
} else {
    setTimeout(init, 100);
}
