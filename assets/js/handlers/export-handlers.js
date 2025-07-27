/* ================================================================================= */
/* FILE: assets/js/handlers/export-handlers.js                                      */
/* PURPOSE: Handle different export formats for LifeCV data                         */
/* ================================================================================= */

import { downloadAsFile, convertToCSV } from '../utils/helpers.js';
import { generateQRCode } from '../utils/helpers.js';

/**
 * Export data in specified format
 */
export async function exportData(data, format, options = {}) {
    const { includePrivate = false, sections = null } = options;
    
    // Filter data based on options
    let exportData = filterExportData(data, includePrivate, sections);
    
    switch (format) {
        case 'json':
            return exportJSON(exportData);
        case 'csv':
            return exportCSV(exportData);
        case 'pdf':
            return exportPDF(exportData);
        case 'html':
            return exportHTML(exportData);
        default:
            throw new Error(`Unsupported export format: ${format}`);
    }
}

/**
 * Filter data for export
 */
function filterExportData(data, includePrivate, sections) {
    let filtered = { ...data };
    
    // Filter by sections if specified
    if (sections && Array.isArray(sections)) {
        const sectionData = {};
        sections.forEach(section => {
            if (filtered[section]) {
                sectionData[section] = filtered[section];
            }
        });
        filtered = sectionData;
    }
    
    // Filter private data if not included
    if (!includePrivate) {
        Object.keys(filtered).forEach(sectionKey => {
            const section = filtered[sectionKey];
            
            if (Array.isArray(section)) {
                filtered[sectionKey] = section.map(item => {
                    const filteredItem = {};
                    Object.keys(item).forEach(fieldKey => {
                        const field = item[fieldKey];
                        if (field && typeof field === 'object' && field.isPublic !== false) {
                            filteredItem[fieldKey] = field;
                        }
                    });
                    return filteredItem;
                });
            } else if (typeof section === 'object' && section !== null) {
                filtered[sectionKey] = {};
                Object.keys(section).forEach(fieldKey => {
                    const field = section[fieldKey];
                    if (field && typeof field === 'object' && field.isPublic !== false) {
                        filtered[sectionKey][fieldKey] = field;
                    }
                });
            }
        });
    }
    
    return filtered;
}

/**
 * Export as JSON
 */
function exportJSON(data) {
    const jsonString = JSON.stringify(data, null, 2);
    const filename = `lifecv-export-${new Date().toISOString().split('T')[0]}.json`;
    downloadAsFile(jsonString, filename, 'application/json');
}

/**
 * Export as CSV
 */
function exportCSV(data) {
    // Flatten the data structure for CSV
    const flatData = [];
    
    Object.keys(data).forEach(sectionKey => {
        const section = data[sectionKey];
        
        if (Array.isArray(section)) {
            section.forEach((item, index) => {
                const flatItem = { section: sectionKey, index };
                Object.keys(item).forEach(fieldKey => {
                    const field = item[fieldKey];
                    if (field && typeof field === 'object') {
                        flatItem[fieldKey] = field.value;
                    }
                });
                flatData.push(flatItem);
            });
        } else if (typeof section === 'object' && section !== null) {
            const flatItem = { section: sectionKey, index: 0 };
            Object.keys(section).forEach(fieldKey => {
                const field = section[fieldKey];
                if (field && typeof field === 'object') {
                    flatItem[fieldKey] = field.value;
                }
            });
            flatData.push(flatItem);
        }
    });
    
    const csvString = convertToCSV(flatData);
    const filename = `lifecv-export-${new Date().toISOString().split('T')[0]}.csv`;
    downloadAsFile(csvString, filename, 'text/csv');
}

/**
 * Export as HTML
 */
function exportHTML(data) {
    const html = generateHTMLResume(data);
    const filename = `lifecv-resume-${new Date().toISOString().split('T')[0]}.html`;
    downloadAsFile(html, filename, 'text/html');
}

/**
 * Generate HTML resume
 */
function generateHTMLResume(data) {
    const personalInfo = data.personalInfo || {};
    const name = personalInfo.fullName?.value || 'Name Not Provided';
    const email = personalInfo.email?.value || '';
    const phone = personalInfo.phone?.value || '';
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Resume</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .item { margin-bottom: 15px; }
        .item h3 { margin: 0 0 5px 0; color: #444; }
        .item .meta { color: #666; font-style: italic; margin-bottom: 5px; }
        .contact-info { margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${name}</h1>
        <div class="contact-info">
            ${email ? `<span>📧 ${email}</span>` : ''}
            ${phone ? `<span style="margin-left: 20px;">📞 ${phone}</span>` : ''}
        </div>
    </div>
    
    ${generateSectionHTML('Professional Summary', data.professionalSummary)}
    ${generateSectionHTML('Experience', data.experience)}
    ${generateSectionHTML('Education', data.education)}
    ${generateSectionHTML('Skills', data.skills)}
    ${generateSectionHTML('Certifications', data.certifications)}
    ${generateSectionHTML('Projects', data.projects)}
    
    <div style="text-align: center; margin-top: 40px; color: #666; font-size: 12px;">
        Generated from LifeCV on ${new Date().toLocaleDateString()}
    </div>
</body>
</html>
    `;
}

/**
 * Generate HTML for a section
 */
function generateSectionHTML(title, sectionData) {
    if (!sectionData) return '';
    
    let html = `<div class="section"><h2>${title}</h2>`;
    
    if (Array.isArray(sectionData)) {
        sectionData.forEach(item => {
            html += '<div class="item">';
            
            // Handle different item types
            if (item.jobTitle?.value) {
                html += `<h3>${item.jobTitle.value} at ${item.company?.value || ''}</h3>`;
                html += `<div class="meta">${item.startDate?.value || ''} - ${item.endDate?.value || 'Present'}</div>`;
                html += `<p>${item.description?.value || ''}</p>`;
            } else if (item.qualification?.value) {
                html += `<h3>${item.qualification.value}</h3>`;
                html += `<div class="meta">${item.institution?.value || ''} (${item.yearCompleted?.value || ''})</div>`;
            } else if (item.skillName?.value) {
                html += `<span>${item.skillName.value} (${item.proficiency?.value || ''})</span>`;
            } else {
                // Generic item handling
                const firstField = Object.values(item)[0];
                if (firstField?.value) {
                    html += `<h3>${firstField.value}</h3>`;
                }
            }
            
            html += '</div>';
        });
    } else if (typeof sectionData === 'object') {
        Object.values(sectionData).forEach(field => {
            if (field?.value) {
                html += `<p>${field.value}</p>`;
            }
        });
    }
    
    html += '</div>';
    return html;
}

/**
 * Export as PDF (using browser's print functionality)
 */
function exportPDF(data) {
    // Create a new window with the HTML content
    const htmlContent = generateHTMLResume(data);
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Trigger print dialog
    printWindow.onload = () => {
        printWindow.print();
        setTimeout(() => printWindow.close(), 1000);
    };
}