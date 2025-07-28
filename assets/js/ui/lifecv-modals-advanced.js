/* ================================================================================= */
/* FILE: assets/js/ui/lifecv-modals-advanced.js                                    */
/* PURPOSE: Advanced modal features for LifeCV - Search, AI, Camera, PII          */
/* ================================================================================= */

import { showNotification } from '../utils/notifications.js';
import { readFileAsDataURL } from '../utils/helpers.js';
import { hideModal } from './lifecv-modals-core.js';

/**
 * Show an advanced modal by ID
 */
export function showAdvancedModal(modalId, data = {}) {
    switch (modalId) {
        case 'internet-search':
            showInternetSearchModal();
            break;
        case 'ai-instructions':
            showAIInstructionsModal();
            break;
        case 'camera-capture':
            showCameraCaptureModal();
            break;
        case 'pii-warning':
            showPIIWarningModal(data);
            break;
        default:
            console.warn(`Unknown advanced modal ID: ${modalId}`);
            return false;
    }
    return true;
}

/**
 * Show Internet Search Modal
 */
function showInternetSearchModal() {
    const modalHTML = `
        <div class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <!-- Header -->
                <div class="flex items-center justify-between p-6 border-b border-slate-200">
                    <div class="flex items-center space-x-3">
                        <div class="p-2 bg-purple-100 rounded-lg">
                            <i class="fas fa-search text-purple-600"></i>
                        </div>
                        <h2 class="text-xl font-bold text-slate-900">Search Internet</h2>
                    </div>
                    <button class="modal-close text-slate-400 hover:text-slate-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <!-- Content -->
                <div class="p-6 overflow-y-auto max-h-[70vh]">
                    <div class="mb-6">
                        <p class="text-slate-600 mb-4">Search the internet for your professional information and import relevant data to your LifeCV.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label for="search-name" class="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
                                <input type="text" id="search-name" class="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="John Doe">
                            </div>
                            <div>
                                <label for="search-profession" class="block text-sm font-medium text-slate-700 mb-2">Profession/Title</label>
                                <input type="text" id="search-profession" class="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Software Engineer">
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <label for="search-company" class="block text-sm font-medium text-slate-700 mb-2">Company/Organization (Optional)</label>
                            <input type="text" id="search-company" class="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Google, Microsoft, etc.">
                        </div>
                        
                        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                            <div class="flex items-start space-x-2">
                                <i class="fas fa-shield-alt text-amber-600 mt-1"></i>
                                <div>
                                    <h4 class="font-medium text-amber-800">Privacy & Security Notice</h4>
                                    <p class="text-sm text-amber-700 mt-1">This search will look for publicly available information about you online. Results are filtered for professional content only. You control what gets imported.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Search Results -->
                    <div id="search-results-container" class="hidden">
                        <h3 class="text-lg font-bold text-slate-900 mb-4">Search Results</h3>
                        <div id="search-results" class="space-y-4"></div>
                    </div>
                    
                    <!-- Loading State -->
                    <div id="search-loading" class="hidden text-center py-8">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p class="text-slate-600">Searching the internet...</p>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
                    <button class="modal-close px-4 py-2 text-slate-600 hover:text-slate-800">Cancel</button>
                    <div class="space-x-3">
                        <button id="start-search-btn" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                            Start Search
                        </button>
                        <button id="import-selected-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 hidden">
                            Import Selected
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modal-placeholder').innerHTML = modalHTML;
    
    // Setup search functionality
    setupInternetSearch();
}

/**
 * Setup internet search functionality
 */
function setupInternetSearch() {
    const startSearchBtn = document.getElementById('start-search-btn');
    const importSelectedBtn = document.getElementById('import-selected-btn');
    const searchLoading = document.getElementById('search-loading');
    const searchResultsContainer = document.getElementById('search-results-container');
    const searchResults = document.getElementById('search-results');
    
    startSearchBtn.addEventListener('click', async () => {
        const name = document.getElementById('search-name').value.trim();
        const profession = document.getElementById('search-profession').value.trim();
        const company = document.getElementById('search-company').value.trim();
        
        if (!name) {
            showNotification('Please enter your name to start the search', 'error');
            return;
        }
        
        // Show loading state
        searchLoading.classList.remove('hidden');
        searchResultsContainer.classList.add('hidden');
        startSearchBtn.disabled = true;
        
        try {
            // Perform internet search
            const searchParams = { name, profession, company };
            
            // This would integrate with your internet search handler
            if (window.lifeCvModule && window.lifeCvModule.searchInternet) {
                const results = await window.lifeCvModule.searchInternet(searchParams);
                displaySearchResults(results);
            } else {
                // Mock results for demonstration
                setTimeout(() => {
                    const mockResults = generateMockSearchResults(name, profession, company);
                    displaySearchResults(mockResults);
                }, 2000);
            }
            
        } catch (error) {
            console.error('Search error:', error);
            showNotification('Search failed. Please try again.', 'error');
            searchLoading.classList.add('hidden');
            startSearchBtn.disabled = false;
        }
    });
    
    function displaySearchResults(results) {
        searchLoading.classList.add('hidden');
        searchResultsContainer.classList.remove('hidden');
        startSearchBtn.disabled = false;
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="text-center py-8 text-slate-500">
                    <i class="fas fa-search text-4xl mb-4"></i>
                    <p>No relevant professional information found.</p>
                    <p class="text-sm mt-2">Try adjusting your search terms or check your spelling.</p>
                </div>
            `;
            return;
        }
        
        searchResults.innerHTML = results.map((result, index) => `
            <div class="search-result-item bg-white border border-slate-200 rounded-lg p-4 hover:border-purple-300 transition-all">
                <div class="flex items-start space-x-4">
                    <input type="checkbox" class="result-checkbox mt-1" data-index="${index}">
                    <div class="flex-1">
                        <div class="flex items-start justify-between mb-2">
                            <h4 class="font-medium text-slate-900">${result.title}</h4>
                            <span class="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">${result.source}</span>
                        </div>
                        <p class="text-sm text-slate-600 mb-2">${result.snippet}</p>
                        <div class="flex items-center justify-between">
                            <a href="${result.url}" target="_blank" class="text-sm text-purple-600 hover:text-purple-800">
                                View Source <i class="fas fa-external-link-alt ml-1"></i>
                            </a>
                            <div class="text-xs text-slate-500">${result.extractedData ? Object.keys(result.extractedData).length + ' fields detected' : 'No structured data'}</div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Show import button
        importSelectedBtn.classList.remove('hidden');
        
        // Setup checkbox handling
        const checkboxes = searchResults.querySelectorAll('.result-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const selectedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
                importSelectedBtn.textContent = selectedCount > 0 ? `Import Selected (${selectedCount})` : 'Import Selected';
                importSelectedBtn.disabled = selectedCount === 0;
            });
        });
    }
    
    // Handle import selected results
    importSelectedBtn.addEventListener('click', async () => {
        const checkboxes = searchResults.querySelectorAll('.result-checkbox:checked');
        if (checkboxes.length === 0) return;
        
        const selectedResults = Array.from(checkboxes).map(cb => {
            const index = parseInt(cb.dataset.index);
            return { index, data: {} }; // Would contain actual extracted data
        });
        
        try {
            // Process and import selected results
            showNotification(`Importing ${selectedResults.length} items...`, 'info');
            
            // This would integrate with your import handler
            if (window.lifeCvModule && window.lifeCvModule.importSearchResults) {
                await window.lifeCvModule.importSearchResults(selectedResults);
            }
            
            hideModal();
            showNotification('Search results imported successfully!', 'success');
            
        } catch (error) {
            console.error('Import error:', error);
            showNotification('Failed to import search results', 'error');
        }
    });
}

/**
 * Generate mock search results for demonstration
 */
function generateMockSearchResults(name, profession, company) {
    return [
        {
            title: `${name} - ${profession} Profile`,
            snippet: `Professional profile for ${name}, ${profession}${company ? ` at ${company}` : ''}. View experience, skills, and professional background.`,
            url: `https://example-professional-site.com/profiles/${name.toLowerCase().replace(' ', '-')}`,
            source: 'Professional Network',
            extractedData: {
                fullName: name,
                jobTitle: profession,
                company: company || null
            }
        },
        {
            title: `${name} | LinkedIn`,
            snippet: `View ${name}'s professional profile on LinkedIn. Connect to view full profile and professional network.`,
            url: `https://linkedin.com/in/${name.toLowerCase().replace(' ', '-')}`,
            source: 'LinkedIn',
            extractedData: {
                fullName: name,
                professionalSummary: `Experienced ${profession} with demonstrated history of working in the industry.`
            }
        }
    ];
}

/**
 * Show AI Instructions Modal
 */
function showAIInstructionsModal() {
    const modalHTML = `
        <div class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <!-- Header -->
                <div class="flex items-center justify-between p-6 border-b border-slate-200">
                    <div class="flex items-center space-x-3">
                        <div class="p-2 bg-blue-100 rounded-lg">
                            <i class="fas fa-robot text-blue-600"></i>
                        </div>
                        <h2 class="text-xl font-bold text-slate-900">AI Instructions</h2>
                    </div>
                    <button class="modal-close text-slate-400 hover:text-slate-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <!-- Content -->
                <div class="p-6 overflow-y-auto max-h-[70vh]">
                    <div class="mb-6">
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h3 class="font-medium text-blue-900 mb-2">Convert Any Resume to LifeCV Format</h3>
                            <p class="text-blue-800 text-sm">Use these AI prompts to convert your existing resume or CV into the LifeCV JSON format for easy import.</p>
                        </div>
                        
                        <div class="space-y-6">
                            <!-- GPT/ChatGPT Instructions -->
                            <div class="border border-slate-200 rounded-lg p-4">
                                <div class="flex items-center justify-between mb-3">
                                    <h4 class="font-medium text-slate-900 flex items-center">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" alt="ChatGPT" class="w-5 h-5 mr-2">
                                        ChatGPT / GPT-4 Instructions
                                    </h4>
                                    <button class="copy-prompt-btn text-slate-400 hover:text-slate-600" data-target="gpt-prompt">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                                <div class="bg-slate-50 rounded p-3 font-mono text-sm" id="gpt-prompt">I need you to convert my resume/CV into a specific JSON format for LifeCV. Please extract all information and structure it according to this schema:

{
  "personalInfo": {
    "fullName": {"value": "", "isPublic": true, "lastModified": ""},
    "email": {"value": "", "isPublic": true, "lastModified": ""},
    "phone": {"value": "", "isPublic": false, "lastModified": ""},
    "address": {"value": "", "isPublic": false, "lastModified": ""}
  },
  "experience": [{
    "jobTitle": {"value": "", "isPublic": true, "lastModified": ""},
    "company": {"value": "", "isPublic": true, "lastModified": ""},
    "startDate": {"value": "", "isPublic": true, "lastModified": ""},
    "endDate": {"value": "", "isPublic": true, "lastModified": ""},
    "description": {"value": "", "isPublic": true, "lastModified": ""}
  }],
  "education": [{
    "qualification": {"value": "", "isPublic": true, "lastModified": ""},
    "institution": {"value": "", "isPublic": true, "lastModified": ""},
    "yearCompleted": {"value": "", "isPublic": true, "lastModified": ""}
  }],
  "skills": [{
    "skillName": {"value": "", "isPublic": true, "lastModified": ""},
    "proficiency": {"value": "", "isPublic": true, "lastModified": ""}
  }]
}

Please fill in the lastModified with current ISO timestamp. Set isPublic to true for professional info, false for personal contact details. Here's my resume:

[PASTE YOUR RESUME TEXT HERE]</div>
                            </div>
                            
                            <!-- Claude Instructions -->
                            <div class="border border-slate-200 rounded-lg p-4">
                                <div class="flex items-center justify-between mb-3">
                                    <h4 class="font-medium text-slate-900 flex items-center">
                                        <div class="w-5 h-5 bg-orange-500 rounded mr-2"></div>
                                        Claude Instructions
                                    </h4>
                                    <button class="copy-prompt-btn text-slate-400 hover:text-slate-600" data-target="claude-prompt">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                                <div class="bg-slate-50 rounded p-3 font-mono text-sm" id="claude-prompt">Please help me convert my resume into a structured LifeCV JSON format. I need you to:

1. Extract all personal, professional, and educational information
2. Structure it according to the LifeCV schema with enhanced field format
3. Set appropriate privacy levels (isPublic: true for professional, false for personal)
4. Add current ISO timestamps for lastModified fields

Required format for each field:
{"value": "actual data", "isPublic": boolean, "lastModified": "ISO-8601 timestamp"}

Main sections needed: personalInfo, experience, education, skills, certifications, projects

Please be thorough and include all available information from my resume:

[PASTE YOUR RESUME TEXT HERE]</div>
                            </div>
                            
                            <!-- Gemini Instructions -->
                            <div class="border border-slate-200 rounded-lg p-4">
                                <div class="flex items-center justify-between mb-3">
                                    <h4 class="font-medium text-slate-900 flex items-center">
                                        <div class="w-5 h-5 bg-blue-500 rounded mr-2"></div>
                                        Google Gemini Instructions
                                    </h4>
                                    <button class="copy-prompt-btn text-slate-400 hover:text-slate-600" data-target="gemini-prompt">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                                <div class="bg-slate-50 rounded p-3 font-mono text-sm" id="gemini-prompt">I'm using LifeCV, a personal life documentation system. Please convert my resume/CV into the required JSON format:

Each data field should follow this structure:
{
  "value": "the actual content", 
  "isPublic": true/false, 
  "lastModified": "current ISO timestamp"
}

Main sections to extract:
- personalInfo (name, contact details)
- experience (jobs, roles, responsibilities)
- education (degrees, institutions, dates)
- skills (technical and soft skills)
- certifications (certificates, licenses)
- projects (personal/professional projects)

Privacy settings: Set isPublic to true for professional information, false for personal contact details.

My resume content:

[PASTE YOUR RESUME TEXT HERE]</div>
                            </div>
                        </div>
                        
                        <div class="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 class="font-medium text-green-900 mb-2">Next Steps</h4>
                            <ol class="text-green-800 text-sm space-y-1 list-decimal list-inside">
                                <li>Copy one of the prompts above</li>
                                <li>Paste it into your preferred AI assistant</li>
                                <li>Add your resume text where indicated</li>
                                <li>Copy the generated JSON response</li>
                                <li>Use the "Import from JSON" option to import into LifeCV</li>
                            </ol>
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="flex items-center justify-end p-6 border-t border-slate-200 bg-slate-50">
                    <button class="modal-close px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Got It
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.getElementById('modal-placeholder');
    modalContainer.innerHTML = modalHTML;
    
    // Get focusable elements
    const focusable = modalContainer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];
    
    // Set ARIA attributes
    modalContainer.setAttribute('role', 'dialog');
    modalContainer.setAttribute('aria-modal', 'true');
    
    // Trap focus
    modalContainer.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }
    });
    
    // Focus first element
    firstFocusable?.focus();
    
    // Setup copy functionality
    const copyButtons = document.querySelectorAll('.copy-prompt-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const targetId = button.dataset.target;
            const promptText = document.getElementById(targetId).textContent;
            
            try {
                await navigator.clipboard.writeText(promptText);
                const icon = button.querySelector('i');
                icon.className = 'fas fa-check text-green-600';
                setTimeout(() => {
                    icon.className = 'fas fa-copy';
                }, 2000);
                showNotification('Prompt copied to clipboard!', 'success');
            } catch (error) {
                showNotification('Failed to copy prompt', 'error');
            }
        });
    });
}

/**
 * Show Camera Capture Modal
 */
function showCameraCaptureModal() {
    const modalHTML = `
        <div class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <!-- Header -->
                <div class="flex items-center justify-between p-6 border-b border-slate-200">
                    <div class="flex items-center space-x-3">
                        <div class="p-2 bg-blue-100 rounded-lg">
                            <i class="fas fa-camera text-blue-600"></i>
                        </div>
                        <h2 class="text-xl font-bold text-slate-900">Capture Profile Picture</h2>
                    </div>
                    <button class="modal-close text-slate-400 hover:text-slate-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <!-- Content -->
                <div class="p-6">
                    <div class="text-center">
                        <video id="camera-preview" class="w-full max-w-md mx-auto rounded-lg border border-slate-200 mb-4" autoplay muted playsinline style="display: none;"></video>
                        
                        <div id="camera-placeholder" class="w-full max-w-md mx-auto h-64 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center mb-4">
                            <div class="text-center">
                                <i class="fas fa-camera text-slate-400 text-4xl mb-2"></i>
                                <p class="text-slate-500">Click "Start Camera" to begin</p>
                            </div>
                        </div>
                        
                        <canvas id="photo-canvas" style="display: none;"></canvas>
                        
                        <div class="space-x-3">
                            <button id="start-camera" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <i class="fas fa-video mr-2"></i>
                                Start Camera
                            </button>
                            <button id="capture-photo" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700" style="display: none;">
                                <i class="fas fa-camera mr-2"></i>
                                Take Photo
                            </button>
                            <button id="stop-camera" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" style="display: none;">
                                <i class="fas fa-stop mr-2"></i>
                                Stop Camera
                            </button>
                        </div>
                        
                        <div class="mt-4 text-sm text-slate-600">
                            <p>Your photo will be compressed and stored securely. You can add multiple profile pictures for different contexts.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modal-placeholder').innerHTML = modalHTML;
    
    // Setup camera functionality
    setupCameraCapture();
}

/**
 * Setup camera capture functionality
 */
function setupCameraCapture() {
    const video = document.getElementById('camera-preview');
    const placeholder = document.getElementById('camera-placeholder');
    const canvas = document.getElementById('photo-canvas');
    const startBtn = document.getElementById('start-camera');
    const captureBtn = document.getElementById('capture-photo');
    const stopBtn = document.getElementById('stop-camera');
    
    let stream = null;
    
    startBtn.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            });
            
            video.srcObject = stream;
            video.style.display = 'block';
            placeholder.style.display = 'none';
            
            startBtn.style.display = 'none';
            captureBtn.style.display = 'inline-block';
            stopBtn.style.display = 'inline-block';
            
        } catch (error) {
            console.error('Camera access error:', error);
            showNotification('Failed to access camera. Please check permissions.', 'error');
        }
    });
    
    captureBtn.addEventListener('click', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob(async (blob) => {
            try {
                // This would integrate with your profile picture manager
                if (window.profilePicManager && window.profilePicManager.addProfilePicture) {
                    const dataUrl = await readFileAsDataURL(blob);
                    await window.profilePicManager.addProfilePicture(dataUrl, {
                        caption: `Webcam capture ${new Date().toLocaleDateString()}`,
                        context: 'Professional'
                    });
                }
                
                hideModal();
                showNotification('Profile picture captured successfully!', 'success');
                
                // Stop camera
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                
            } catch (error) {
                console.error('Capture error:', error);
                showNotification('Failed to save captured photo', 'error');
            }
        }, 'image/jpeg', 0.85);
    });
    
    stopBtn.addEventListener('click', () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        
        video.style.display = 'none';
        placeholder.style.display = 'flex';
        
        startBtn.style.display = 'inline-block';
        captureBtn.style.display = 'none';
        stopBtn.style.display = 'none';
    });
}

/**
 * Show PII Warning Modal
 */
function showPIIWarningModal(data = {}) {
    const modalHTML = `
        <div class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl shadow-xl max-w-lg w-full">
                <!-- Header -->
                <div class="flex items-center justify-between p-6 border-b border-slate-200">
                    <div class="flex items-center space-x-3">
                        <div class="p-2 bg-red-100 rounded-lg">
                            <i class="fas fa-exclamation-triangle text-red-600"></i>
                        </div>
                        <h2 class="text-xl font-bold text-slate-900">Personal Information Detected</h2>
                    </div>
                </div>
                
                <!-- Content -->
                <div class="p-6">
                    <div class="mb-4">
                        <p class="text-slate-700 mb-4">We've detected personally identifiable information (PII) in your import that may need special privacy consideration:</p>
                        
                        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <h4 class="font-medium text-red-800 mb-2">Detected PII Fields:</h4>
                            <ul class="text-sm text-red-700 space-y-1" id="pii-fields-list">
                                ${(data.piiFields || []).map(field => `<li>• ${field}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="space-y-3">
                            <h4 class="font-medium text-slate-800">Privacy Options:</h4>
                            <div class="space-y-2">
                                <label class="flex items-start">
                                    <input type="radio" name="pii-action" value="private" class="mt-1 mr-3" checked>
                                    <div>
                                        <span class="font-medium text-slate-700">Set as Private</span>
                                        <p class="text-sm text-slate-600">Mark these fields as private (recommended)</p>
                                    </div>
                                </label>
                                <label class="flex items-start">
                                    <input type="radio" name="pii-action" value="public" class="mt-1 mr-3">
                                    <div>
                                        <span class="font-medium text-slate-700">Keep as Public</span>
                                        <p class="text-sm text-slate-600">These fields will be visible when sharing</p>
                                    </div>
                                </label>
                                <label class="flex items-start">
                                    <input type="radio" name="pii-action" value="exclude" class="mt-1 mr-3">
                                    <div>
                                        <span class="font-medium text-slate-700">Exclude from Import</span>
                                        <p class="text-sm text-slate-600">Don't import these fields at all</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
                    <button class="modal-close px-4 py-2 text-slate-600 hover:text-slate-800">Cancel Import</button>
                    <button id="continue-import-btn" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Continue Import
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modal-placeholder').innerHTML = modalHTML;
    
    // Setup PII handling
    const continueBtn = document.getElementById('continue-import-btn');
    
    continueBtn.addEventListener('click', () => {
        const selectedAction = document.querySelector('input[name="pii-action"]:checked').value;
        
        // Handle the PII according to user choice
        if (data.callback) {
            data.callback({
                action: selectedAction,
                fields: data.piiFields || []
            });
        }
        
        hideModal();
        
        // Show appropriate notification
        const messages = {
            private: 'PII fields set to private and imported',
            public: 'PII fields imported as public',
            exclude: 'PII fields excluded from import'
        };
        
        showNotification(messages[selectedAction], 'success');
    });
}
