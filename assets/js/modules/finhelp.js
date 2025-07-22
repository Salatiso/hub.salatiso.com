/* ================================================================================= */
/* FILE: assets/js/modules/finhelp.js (CONTROLLER - UNCHANGED)                     */
/* ================================================================================= */
import { auth } from '../firebase-config.js';

let personalFinanceModule;
let businessFinanceModule;
let isPersonalModuleLoaded = false;
let isBusinessModuleLoaded = false;

export function init(user) {
    if (!user || !user.uid) {
        console.error("FinHelp Error: User not authenticated.");
        return;
    }
    console.log("FinHelp main controller initialized.");

    const personalWorkspace = document.getElementById('personal-workspace');
    const businessWorkspace = document.getElementById('business-workspace');
    const personalBtn = document.getElementById('workspace-personal-btn');
    const businessBtn = document.getElementById('workspace-business-btn');

    const loadPersonalModule = async () => {
        if (!isPersonalModuleLoaded) {
            try {
                personalFinanceModule = await import('./finhelp-personal.js');
                personalFinanceModule.init(user);
                isPersonalModuleLoaded = true;
            } catch (error) {
                console.error("Failed to load personal finance module:", error);
            }
        }
    };

    const loadBusinessModule = async () => {
        if (!isBusinessModuleLoaded) {
            try {
                businessFinanceModule = await import('./finhelp-business.js');
                businessFinanceModule.init(user);
                isBusinessModuleLoaded = true;
            } catch (error) {
                console.error("Failed to load business finance module:", error);
            }
        }
    };

    personalBtn.addEventListener('click', () => {
        personalWorkspace.classList.remove('hidden');
        businessWorkspace.classList.add('hidden');
        personalBtn.classList.add('active');
        businessBtn.classList.remove('active');
        loadPersonalModule();
    });

    businessBtn.addEventListener('click', () => {
        personalWorkspace.classList.add('hidden');
        businessWorkspace.classList.remove('hidden');
        businessBtn.classList.add('active');
        personalBtn.classList.remove('active');
        loadBusinessModule();
    });

    // Load the default module
    loadPersonalModule();
}