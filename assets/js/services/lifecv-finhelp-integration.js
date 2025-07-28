/**
 * LifeCV-FinHelp Integration Service
 * Syncs financial and legal information between LifeCV and FinHelp modules
 */

import { getLifeCvData, updateField } from './life-cv-data-service.js';
import { getDocument, saveDocument } from '../database.js';
import { auth } from '../firebase-config.js';

export class LifeCVFinHelpIntegration {
    constructor() {
        this.auth = null;
        this.user = null;
        this.lifeCvData = {};
        this.finHelpData = {};
        this.initialized = false;
    }

    async initialize() {
        if (!this.initialized) {
            // Initialize auth reference from firebase-config
            this.auth = auth;
            this.initialized = true;
        }
        
        this.user = this.auth.currentUser;
        if (!this.user) {
            throw new Error('User not authenticated');
        }

        await this.loadData();
    }

    async loadData() {
        try {
            // Load LifeCV data
            this.lifeCvData = getLifeCvData();
            
            // Load FinHelp data
            this.finHelpData = await getDocument('userFinances', this.user.uid) || this.getDefaultFinHelpData();
        } catch (error) {
            console.error('Error loading data for integration:', error);
            throw error;
        }
    }

    getDefaultFinHelpData() {
        return {
            personal: {
                income: [],
                expenses: [],
                assets: [],
                liabilities: [],
                insurances: [],
                savingsGoals: [],
                taxHistory: [],
                creditProfile: {},
                documents: []
            },
            business: {
                income: [],
                expenses: [],
                assets: [],
                liabilities: [],
                insurances: [],
                taxHistory: []
            },
            settings: {
                currency: 'ZAR',
                taxYear: new Date().getFullYear(),
                riskProfile: 'moderate'
            }
        };
    }

    /**
     * Sync LifeCV financial data to FinHelp
     */
    async syncLifeCVToFinHelp() {
        try {
            const financialSection = this.lifeCvData.financials || {};
            
            // Sync income information
            await this.syncIncome(financialSection);
            
            // Sync assets
            await this.syncAssets(financialSection);
            
            // Sync liabilities
            await this.syncLiabilities(financialSection);
            
            // Sync insurance information
            await this.syncInsurance(financialSection);
            
            // Sync tax information
            await this.syncTaxInfo(financialSection);
            
            // Save updated FinHelp data
            await this.saveFinHelpData();
            
            return {
                success: true,
                message: 'Financial data synced successfully',
                syncedItems: this.getSyncSummary()
            };
        } catch (error) {
            console.error('Error syncing LifeCV to FinHelp:', error);
            throw error;
        }
    }

    async syncIncome(financialSection) {
        const incomeData = financialSection.income?.value || '';
        const employmentSection = this.lifeCvData.experience || [];
        
        // Clear existing synced income
        this.finHelpData.personal.income = this.finHelpData.personal.income.filter(
            item => !item.syncedFromLifeCV
        );

        // Add current employment income
        if (Array.isArray(employmentSection)) {
            employmentSection.forEach((job, index) => {
                const jobTitle = job.jobTitle?.value || job.position?.value || 'Unknown Position';
                const company = job.company?.value || 'Unknown Company';
                const salary = job.salary?.value || job.compensation?.value;
                
                if (salary && !isNaN(parseFloat(salary))) {
                    this.finHelpData.personal.income.push({
                        id: `lifecv-job-${index}`,
                        source: `${jobTitle} at ${company}`,
                        monthlyAmount: parseFloat(salary),
                        type: 'salary',
                        taxable: true,
                        syncedFromLifeCV: true,
                        lastSynced: new Date().toISOString()
                    });
                }
            });
        }

        // Add other income sources from financial section
        if (incomeData) {
            const incomeLines = incomeData.split('\n').filter(line => line.trim());
            incomeLines.forEach((line, index) => {
                const amountMatch = line.match(/R?\s?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
                if (amountMatch) {
                    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
                    this.finHelpData.personal.income.push({
                        id: `lifecv-income-${index}`,
                        source: line.replace(amountMatch[0], '').trim() || 'Other Income',
                        monthlyAmount: amount,
                        type: 'other',
                        taxable: true,
                        syncedFromLifeCV: true,
                        lastSynced: new Date().toISOString()
                    });
                }
            });
        }
    }

    async syncAssets(financialSection) {
        const assetsData = financialSection.assets?.value || '';
        
        // Clear existing synced assets
        this.finHelpData.personal.assets = this.finHelpData.personal.assets.filter(
            item => !item.syncedFromLifeCV
        );

        if (assetsData) {
            const assetLines = assetsData.split('\n').filter(line => line.trim());
            assetLines.forEach((line, index) => {
                const valueMatch = line.match(/R?\s?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
                if (valueMatch) {
                    const value = parseFloat(valueMatch[1].replace(/,/g, ''));
                    const assetName = line.replace(valueMatch[0], '').trim() || 'Asset';
                    
                    // Determine asset type based on keywords
                    let assetType = 'other';
                    const lowerLine = line.toLowerCase();
                    if (lowerLine.includes('house') || lowerLine.includes('property') || lowerLine.includes('home')) {
                        assetType = 'property';
                    } else if (lowerLine.includes('car') || lowerLine.includes('vehicle')) {
                        assetType = 'vehicle';
                    } else if (lowerLine.includes('investment') || lowerLine.includes('stock') || lowerLine.includes('share')) {
                        assetType = 'investment';
                    } else if (lowerLine.includes('savings') || lowerLine.includes('account')) {
                        assetType = 'savings';
                    }

                    this.finHelpData.personal.assets.push({
                        id: `lifecv-asset-${index}`,
                        name: assetName,
                        type: assetType,
                        currentValue: value,
                        purchaseValue: value, // Default to current value
                        purchaseDate: new Date().toISOString().split('T')[0],
                        syncedFromLifeCV: true,
                        lastSynced: new Date().toISOString()
                    });
                }
            });
        }
    }

    async syncLiabilities(financialSection) {
        const liabilitiesData = financialSection.liabilities?.value || '';
        
        // Clear existing synced liabilities
        this.finHelpData.personal.liabilities = this.finHelpData.personal.liabilities.filter(
            item => !item.syncedFromLifeCV
        );

        if (liabilitiesData) {
            const liabilityLines = liabilitiesData.split('\n').filter(line => line.trim());
            liabilityLines.forEach((line, index) => {
                const amountMatch = line.match(/R?\s?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
                if (amountMatch) {
                    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
                    const liabilityName = line.replace(amountMatch[0], '').trim() || 'Liability';
                    
                    // Determine liability type based on keywords
                    let liabilityType = 'other';
                    const lowerLine = line.toLowerCase();
                    if (lowerLine.includes('home') || lowerLine.includes('mortgage') || lowerLine.includes('bond')) {
                        liabilityType = 'mortgage';
                    } else if (lowerLine.includes('car') || lowerLine.includes('vehicle') || lowerLine.includes('auto')) {
                        liabilityType = 'vehicle_loan';
                    } else if (lowerLine.includes('credit') || lowerLine.includes('card')) {
                        liabilityType = 'credit_card';
                    } else if (lowerLine.includes('personal') || lowerLine.includes('loan')) {
                        liabilityType = 'personal_loan';
                    } else if (lowerLine.includes('student')) {
                        liabilityType = 'student_loan';
                    }

                    this.finHelpData.personal.liabilities.push({
                        id: `lifecv-liability-${index}`,
                        name: liabilityName,
                        type: liabilityType,
                        currentBalance: amount,
                        originalAmount: amount, // Default to current balance
                        interestRate: 0, // Will need to be updated manually
                        monthlyPayment: Math.round(amount * 0.02), // Estimate 2% of balance
                        syncedFromLifeCV: true,
                        lastSynced: new Date().toISOString()
                    });
                }
            });
        }
    }

    async syncInsurance(financialSection) {
        const insuranceData = financialSection.insurance?.value || '';
        
        // Clear existing synced insurance
        this.finHelpData.personal.insurances = this.finHelpData.personal.insurances.filter(
            item => !item.syncedFromLifeCV
        );

        if (insuranceData) {
            const insuranceLines = insuranceData.split('\n').filter(line => line.trim());
            insuranceLines.forEach((line, index) => {
                const premiumMatch = line.match(/R?\s?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
                if (premiumMatch) {
                    const premium = parseFloat(premiumMatch[1].replace(/,/g, ''));
                    const insuranceName = line.replace(premiumMatch[0], '').trim() || 'Insurance Policy';
                    
                    // Determine insurance type based on keywords
                    let insuranceType = 'other';
                    const lowerLine = line.toLowerCase();
                    if (lowerLine.includes('car') || lowerLine.includes('vehicle') || lowerLine.includes('auto')) {
                        insuranceType = 'car';
                    } else if (lowerLine.includes('home') || lowerLine.includes('house') || lowerLine.includes('property')) {
                        insuranceType = 'home';
                    } else if (lowerLine.includes('life')) {
                        insuranceType = 'life';
                    } else if (lowerLine.includes('health') || lowerLine.includes('medical')) {
                        insuranceType = 'health';
                    } else if (lowerLine.includes('disability')) {
                        insuranceType = 'disability';
                    }

                    this.finHelpData.personal.insurances.push({
                        id: `lifecv-insurance-${index}`,
                        type: insuranceType,
                        provider: 'Unknown Provider',
                        policyNumber: `LIFECV-${index + 1}`,
                        monthlyPremium: premium,
                        coverageAmount: premium * 100, // Estimate coverage as 100x premium
                        startDate: new Date().toISOString().split('T')[0],
                        renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        syncedFromLifeCV: true,
                        lastSynced: new Date().toISOString()
                    });
                }
            });
        }
    }

    async syncTaxInfo(financialSection) {
        const taxData = financialSection.taxInformation?.value || '';
        
        if (taxData) {
            // Extract tax-related information and add to tax history
            const currentYear = new Date().getFullYear();
            
            if (!this.finHelpData.personal.taxHistory) {
                this.finHelpData.personal.taxHistory = [];
            }

            // Remove existing synced tax data for current year
            this.finHelpData.personal.taxHistory = this.finHelpData.personal.taxHistory.filter(
                item => !(item.syncedFromLifeCV && item.taxYear === currentYear)
            );

            // Add new tax information
            this.finHelpData.personal.taxHistory.push({
                id: `lifecv-tax-${currentYear}`,
                taxYear: currentYear,
                status: 'in_progress',
                notes: taxData,
                syncedFromLifeCV: true,
                lastSynced: new Date().toISOString()
            });
        }
    }

    /**
     * Sync FinHelp data back to LifeCV
     */
    async syncFinHelpToLifeCV() {
        try {
            const personalFinances = this.finHelpData.personal;
            
            // Create summary for LifeCV financial section
            const financialSummary = this.createFinancialSummary(personalFinances);
            
            // Update LifeCV financial section
            await updateField('financials.summary.value', financialSummary);
            
            // Update specific financial fields if they exist
            if (personalFinances.income.length > 0) {
                const incomeText = personalFinances.income
                    .map(income => `${income.source}: R${income.monthlyAmount.toLocaleString()}/month`)
                    .join('\n');
                await updateField('financials.income.value', incomeText);
            }

            if (personalFinances.assets.length > 0) {
                const assetsText = personalFinances.assets
                    .map(asset => `${asset.name}: R${asset.currentValue.toLocaleString()}`)
                    .join('\n');
                await updateField('financials.assets.value', assetsText);
            }

            if (personalFinances.liabilities.length > 0) {
                const liabilitiesText = personalFinances.liabilities
                    .map(liability => `${liability.name}: R${liability.currentBalance.toLocaleString()}`)
                    .join('\n');
                await updateField('financials.liabilities.value', liabilitiesText);
            }

            return {
                success: true,
                message: 'FinHelp data synced to LifeCV successfully'
            };
        } catch (error) {
            console.error('Error syncing FinHelp to LifeCV:', error);
            throw error;
        }
    }

    createFinancialSummary(personalFinances) {
        const totalIncome = personalFinances.income.reduce((sum, item) => sum + (item.monthlyAmount || 0), 0);
        const totalAssets = personalFinances.assets.reduce((sum, item) => sum + (item.currentValue || 0), 0);
        const totalLiabilities = personalFinances.liabilities.reduce((sum, item) => sum + (item.currentBalance || 0), 0);
        const netWorth = totalAssets - totalLiabilities;
        const totalInsurancePremiums = personalFinances.insurances.reduce((sum, item) => sum + (item.monthlyPremium || 0), 0);

        return `Financial Summary (Auto-generated from FinHelp):

Monthly Income: R${totalIncome.toLocaleString()}
Total Assets: R${totalAssets.toLocaleString()}
Total Liabilities: R${totalLiabilities.toLocaleString()}
Net Worth: R${netWorth.toLocaleString()}
Monthly Insurance Premiums: R${totalInsurancePremiums.toLocaleString()}

Active Policies: ${personalFinances.insurances.length}
Investment Accounts: ${personalFinances.assets.filter(a => a.type === 'investment').length}
Loan Accounts: ${personalFinances.liabilities.length}

Last Updated: ${new Date().toLocaleDateString()}`;
    }

    async saveFinHelpData() {
        try {
            await saveDocument('userFinances', this.user.uid, this.finHelpData);
        } catch (error) {
            console.error('Error saving FinHelp data:', error);
            throw error;
        }
    }

    getSyncSummary() {
        const summary = {
            income: this.finHelpData.personal.income.filter(item => item.syncedFromLifeCV).length,
            assets: this.finHelpData.personal.assets.filter(item => item.syncedFromLifeCV).length,
            liabilities: this.finHelpData.personal.liabilities.filter(item => item.syncedFromLifeCV).length,
            insurances: this.finHelpData.personal.insurances.filter(item => item.syncedFromLifeCV).length,
            taxHistory: this.finHelpData.personal.taxHistory.filter(item => item.syncedFromLifeCV).length
        };

        return summary;
    }

    /**
     * Get integration status
     */
    getIntegrationStatus() {
        const syncSummary = this.getSyncSummary();
        const totalSynced = Object.values(syncSummary).reduce((sum, count) => sum + count, 0);
        
        return {
            isIntegrated: totalSynced > 0,
            lastSync: this.getLastSyncDate(),
            syncedItems: syncSummary,
            totalSyncedItems: totalSynced
        };
    }

    getLastSyncDate() {
        const allSyncedItems = [
            ...this.finHelpData.personal.income.filter(item => item.syncedFromLifeCV),
            ...this.finHelpData.personal.assets.filter(item => item.syncedFromLifeCV),
            ...this.finHelpData.personal.liabilities.filter(item => item.syncedFromLifeCV),
            ...this.finHelpData.personal.insurances.filter(item => item.syncedFromLifeCV)
        ];

        if (allSyncedItems.length === 0) return null;

        const lastSyncDates = allSyncedItems
            .map(item => new Date(item.lastSynced))
            .filter(date => !isNaN(date.getTime()));

        return lastSyncDates.length > 0 ? new Date(Math.max(...lastSyncDates)) : null;
    }
}

// Export singleton instance
export const lifeCVFinHelpIntegration = new LifeCVFinHelpIntegration();

export default lifeCVFinHelpIntegration;