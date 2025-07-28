/* ================================================================================= */
/* FILE: assets/js/assessment.js (UPDATED - Saves to LifeCV)                        */
/* ================================================================================= */
import { addLifeCvEntry } from './services/life-cv-data-service.js';

// ...existing code...

function showResult(resultKey) {
    const result = assessmentData.results[resultKey];
    if (!result) {
        console.error("Result not found:", resultKey);
        return;
    }

    const resultHTML = `
        <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-check text-green-600 text-2xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-900 mb-2">Perfect Match Found!</h2>
                <p class="text-slate-600">Based on your responses, we recommend:</p>
            </div>
            
            <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mb-6">
                <h3 class="text-xl font-bold text-indigo-900 mb-2">${result.name}</h3>
                <p class="text-slate-700 mb-4">${result.desc}</p>
                
                <div class="flex flex-col sm:flex-row gap-3">
                    <a href="${result.url}" class="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium text-center hover:bg-indigo-700 transition-colors">
                        Get Started
                    </a>
                    <button onclick="restartAssessment()" class="flex-1 bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium border-2 border-indigo-600 hover:bg-indigo-50 transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
            
            <div class="text-center">
                <p class="text-sm text-slate-500 mb-4">Your assessment path:</p>
                <div class="flex flex-wrap justify-center gap-2">
                    ${userPath.map(q => `<span class="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">${q}</span>`).join('')}
                </div>
            </div>
        </div>
    `;

    // Show result
    assessmentContainer.innerHTML = resultHTML;

    // Save to LifeCV
    saveAssessmentToLifeCV(result, userPath);
}

async function saveAssessmentToLifeCV(result, path) {
    try {
        await addLifeCvEntry({
            entryType: 'assessment',
            title: 'Ecosystem Assessment Completed',
            description: `Completed guided assessment and was recommended: ${result.name}. ${result.desc}`,
            sourcePlatform: 'Hub Assessment',
            sourceUrl: '/assessment.html',
            tags: ['assessment', 'guidance', 'ecosystem-navigation'],
            completedAt: new Date().toISOString(),
            category: 'Personal Development',
            data: {
                recommendedModule: result.name,
                recommendedUrl: result.url,
                assessmentPath: path,
                completionScore: 100
            }
        });
        console.log("Assessment results saved to LifeCV");
    } catch (error) {
        console.error("Failed to save assessment to LifeCV:", error);
    }
}

// ...existing code...
const assessmentData = {
    questions: {
        start: {
            question: "What is your primary goal today?",
            options: [
                { text: "Organize my personal & family life", next: "family_q" },
                { text: "Manage my finances or business", next: "finance_q" },
                { text: "Build my professional profile & skills", next: "profile_q" },
                { text: "Handle a legal or official document", next: "legal_q" }
            ]
        },
        family_q: {
            question: "What aspect of family life needs the most attention?",
            options: [
                { text: "Connecting with my partner on a deeper level", next: "result_familyhub_lifesync" },
                { text: "Creating a formal parenting plan", next: "result_legalhelp_flamea" },
                { text: "Organizing our family structure and members", next: "result_familyhub_value" }
            ]
        },
        finance_q: {
            question: "Are you focused on personal or business finances?",
            options: [
                { text: "Personal: Budgeting and tracking expenses", next: "result_finhelp_personal" },
                { text: "Business: Invoicing clients and tracking bills", next: "result_finhelp_business" },
                { text: "Both: I need a holistic view", next: "result_finhelp_business" }
            ]
        },
        profile_q: {
            question: "What is your main professional objective?",
            options: [
                { text: "Create a comprehensive CV of all my skills", next: "result_lifecv" },
                { text: "Plan my personal development and goals", next: "result_hrhelp" },
                { text: "Learn new skills through online courses", next: "result_training" }
            ]
        },
        legal_q: {
            question: "What kind of assistance do you need?",
            options: [
                { text: "I need to generate a formal document like an affidavit", next: "result_docuhelp" },
                { text: "I need to track events for a legal case", next: "result_legalhelp_tracker" },
                { text: "I need to create a fair parenting plan", next: "result_legalhelp_flamea" }
            ]
        }
    },
    results: {
        result_lifecv: { name: 'LifeCV', desc: 'The perfect place to start. Document all your skills and experiences to build your dynamic profile.', url: './life-cv.html' },
        result_finhelp_personal: { name: 'FinHelp (Personal)', desc: 'Switch to the Personal workspace to track your income, expenses, and generate a tax pack.', url: './finhelp.html' },
        result_finhelp_business: { name: 'FinHelp (Business)', desc: 'Switch to the Business workspace to manage clients, send invoices, and track bills.', url: './finhelp.html' },
        result_familyhub_lifesync: { name: 'Family Hub (LifeSync)', desc: 'Invite your partner to sync your profiles and build a compatibility dashboard together.', url: './family-hub.html' },
        result_familyhub_value: { name: 'Family Hub (Family Value)', desc: 'Formalize your family unit, add members, and manage your shared identity from one place.', url: './family-hub.html' },
        result_legalhelp_tracker: { name: 'LegalHelp (Case Tracker)', desc: 'Use the Case Tracker to securely log all events, dates, and details related to your legal matters.', url: './legalhelp.html' },
        result_legalhelp_flamea: { name: 'LegalHelp (Parenting Plans)', desc: 'Use the Flamea-integrated wizard to create a comprehensive, fair parenting plan step-by-step.', url: './legalhelp.html' },
        result_hrhelp: { name: 'HRHelp', desc: 'Create detailed Personal Development Plans to define your goals and track your progress.', url: './hrhelp.html' },
        result_training: { name: 'Training', desc: 'Browse our library of courses to learn new skills and enhance your LifeCV.', url: './training.html' },
        result_docuhelp: { name: 'DocuHelp', desc: 'Generate formal documents like affidavits or lease agreements using our smart templates.', url: './docuhelp.html' }
    }
};

export function init(user) {
    if (!user) return;
    console.log("Assessment Engine Initialized.");
    const form = document.getElementById('assessment-form');
    if(form) { // Check if the new form exists
        form.style.display = 'none'; // Hide old form
        const container = document.getElementById('assessment-container');
        container.innerHTML = `<h1 class="text-3xl font-bold text-slate-900">Find the Right Tool</h1><p class="mt-2 text-slate-600 mb-6">Answer a few questions to get a recommendation.</p><div id="wizard-container"></div>`;
        renderWizardStep('start');
    }
}

function renderWizardStep(stepId) {
    const container = document.getElementById('wizard-container');
    const stepData = assessmentData.questions[stepId];
    if (!stepData) return;

    const optionsHtml = stepData.options.map(opt => 
        `<button class="wizard-option block w-full text-left p-4 my-2 bg-slate-100 hover:bg-indigo-100 rounded-lg transition-colors" data-next="${opt.next}">${opt.text}</button>`
    ).join('');

    container.innerHTML = `
        <h2 class="text-xl font-semibold text-slate-800 mb-4">${stepData.question}</h2>
        <div>${optionsHtml}</div>
    `;

    container.querySelectorAll('.wizard-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const nextStep = e.target.dataset.next;
            if (nextStep.startsWith('result_')) {
                renderResult(nextStep);
            } else {
                renderWizardStep(nextStep);
            }
        });
    });
}

function renderResult(resultId) {
    const container = document.getElementById('wizard-container');
    const resultData = assessmentData.results[resultId];
    if (!resultData) return;

    container.innerHTML = `
        <div class="p-6 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg">
            <h3 class="text-xl font-bold text-indigo-900">We recommend you start with: ${resultData.name}</h3>
            <p class="mt-2 text-indigo-800">${resultData.desc}</p>
            <div class="mt-4">
                <a href="${resultData.url}" class="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md text-sm">Go to ${resultData.name}</a>
                <button id="restart-assessment-btn" class="ml-4 text-sm text-slate-600 font-semibold">Start Over</button>
            </div>
        </div>
    `;
    document.getElementById('restart-assessment-btn').addEventListener('click', () => renderWizardStep('start'));
}
