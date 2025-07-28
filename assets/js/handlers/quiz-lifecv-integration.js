/* ================================================================================= */
/* FILE: Quiz to LifeCV Integration Service                                         */
/* ================================================================================= */

import { getLifeCvData, updateField, addArrayItem } from './life-cv-data-service.js';

/**
 * Process quiz results and add to LifeCV
 */
export async function integrateQuizResults(quizData) {
    try {
        const { results, recommendations, completedDate, quizType } = quizData;
        
        // Add to achievements section
        await addArrayItem('achievements', {
            title: { value: `${quizType} Assessment Completed`, isPublic: false },
            description: { value: `Completed ${quizType} assessment with ${results.score}% score`, isPublic: false },
            date: { value: completedDate, isPublic: false },
            category: { value: 'Assessment', isPublic: false },
            skills: { value: results.identifiedSkills || [], isPublic: false }
        });

        // Add to skills section if skills identified
        if (results.identifiedSkills && results.identifiedSkills.length > 0) {
            for (const skill of results.identifiedSkills) {
                await addArrayItem('skills', {
                    name: { value: skill.name, isPublic: true },
                    level: { value: skill.level || 'Intermediate', isPublic: true },
                    category: { value: 'Assessment Identified', isPublic: true },
                    verified: { value: true, isPublic: false },
                    source: { value: `${quizType} Assessment`, isPublic: false }
                });
            }
        }

        // Add recommendations to goals section
        if (recommendations && recommendations.length > 0) {
            for (const rec of recommendations) {
                await addArrayItem('goals', {
                    title: { value: rec.title, isPublic: false },
                    description: { value: rec.description, isPublic: false },
                    category: { value: 'Assessment Recommendation', isPublic: false },
                    priority: { value: rec.priority || 'Medium', isPublic: false },
                    status: { value: 'Not Started', isPublic: false },
                    dateCreated: { value: completedDate, isPublic: false }
                });
            }
        }

        return { success: true, message: 'Quiz results integrated into LifeCV' };
    } catch (error) {
        console.error('Error integrating quiz results:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Process assessment results and add to LifeCV
 */
export async function integrateAssessmentResults(assessmentData) {
    try {
        const { result, scores, recommendations, completedDate } = assessmentData;
        
        // Add to portfolio section
        await addArrayItem('portfolio', {
            title: { value: `Career Path Assessment - ${result.name}`, isPublic: true },
            description: { value: result.desc, isPublic: true },
            category: { value: 'Career Assessment', isPublic: true },
            date: { value: completedDate, isPublic: true },
            url: { value: result.url, isPublic: false },
            tags: { value: ['Assessment', 'Career Planning'], isPublic: true }
        });

        // Update career interests based on assessment
        if (result.name) {
            await updateField('professionalSummary.careerInterests', {
                value: `Identified interest in ${result.name} through assessment`,
                isPublic: true
            });
        }

        return { success: true, message: 'Assessment results integrated into LifeCV' };
    } catch (error) {
        console.error('Error integrating assessment results:', error);
        return { success: false, error: error.message };
    }
}