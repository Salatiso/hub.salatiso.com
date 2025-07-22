/* ================================================================================= */
/* FILE: assets/js/quiz-database.js (NEW)                                            */
/* PURPOSE: A centralized, expandable database for all quiz questions.               */
/* INSTRUCTIONS: To add new questions, simply add to the 'questions' array in any    */
/* category, or add new categories and levels. The quiz engine will adapt.           */
/* ================================================================================= */

export const quizDatabase = {
    levels: [
        {
            level: 1,
            title: "Foundations of Self",
            description: "Understanding your personal style and preferences.",
            categories: [
                {
                    name: "Personal Style",
                    questions: [
                        { q: "When facing a complex problem, I prefer to:", a: ["Analyze data and facts", "Brainstorm creative solutions", "Organize a step-by-step plan", "Collaborate with a team"] },
                        { q: "My ideal work environment is:", a: ["Structured and predictable", "Dynamic and fast-paced", "Quiet and independent", "Social and collaborative"] },
                        { q: "I feel most fulfilled when I:", a: ["Achieve a difficult, measurable goal", "Create something new and original", "Bring order to a chaotic situation", "Help and support others"] },
                        { q: "I learn best by:", a: ["Reading and studying alone", "Doing and experimenting", "Listening to an expert", "Discussing with others"] },
                        { q: "When making a decision, I rely most on:", a: ["Logic and reason", "Intuition and gut feeling", "Past experience", "Advice from trusted people"] }
                    ]
                },
                {
                    name: "Financial Habits (Basics)",
                    questions: [
                        { q: "When I receive money, my first instinct is to:", a: ["Save a portion of it", "Spend it on something I want", "Pay off debts", "Create a budget for it"] },
                        { q: "My feeling about financial risk is:", a: ["Avoid it at all costs", "Willing to take calculated risks for potential gain", "I enjoy high-risk, high-reward scenarios", "I don't think about it much"] },
                        { q: "A budget feels like:", a: ["A restriction on my freedom", "A roadmap to my financial goals", "A necessary but tedious task", "Something I've never tried"] },
                        { q: "When it comes to saving, I am:", a: ["Very consistent", "Good at it sometimes", "Struggling to be consistent", "Not currently saving"] },
                        { q: "Long-term financial planning (e.g., for retirement) is something I:", a: ["Have a clear plan for", "Think about but haven't started", "Find overwhelming", "Believe is too far away to worry about"] }
                    ]
                }
            ]
        },
        {
            level: 2,
            title: "Building Your Homestead",
            description: "Exploring how you manage your resources and relationships.",
            categories: [
                {
                    name: "Career & Skills",
                    questions: [
                        { q: "I see my career primarily as:", a: ["A source of income", "A path for personal growth and learning", "A way to make an impact on the world", "A series of interesting projects"] },
                        { q: "When learning a new skill for work, I'm most motivated by:", a: ["The potential for a higher salary", "The challenge of mastering something new", "How it helps my team or company succeed", "Its application in my personal projects"] },
                        { q: "The most important part of my LifeCV is my:", a: ["Formal qualifications and education", "Record of professional experience", "Portfolio of completed projects", "List of practical skills"] },
                        { q: "Feedback on my work is something I:", a: ["Actively seek out to improve", "Appreciate when it's given constructively", "Sometimes find difficult to hear", "Rarely receive"] },
                        { q: "My professional network is:", a: ["Large and actively maintained", "Small but strong", "Something I need to work on", "Mainly online"] }
                    ]
                },
                {
                    name: "Family & Relationships",
                    questions: [
                        { q: "In a family unit, the most important value is:", a: ["Loyalty", "Honesty", "Independence", "Mutual Support"] },
                        { q: "When a conflict arises with a partner, my first step is to:", a: ["Take some space to think", "Talk about it immediately", "Try to find a quick compromise", "Ask a trusted friend for advice"] },
                        { q: "My role in the family is often:", a: ["The provider", "The caregiver", "The planner/organizer", "The peacemaker"] },
                        { q: "Sharing financial information with a partner should be:", a: ["Completely transparent (open books)", "Shared on a need-to-know basis", "Kept mostly separate", "Something to discuss and agree upon"] },
                        { q: "A successful family is one that:", a: ["Achieves financial security", "Is happy and emotionally connected", "Upholds traditions and legacy", "Supports each member's individual growth"] }
                    ]
                }
                // ... More categories and questions can be added here for Level 2
            ]
        },
        // ... More levels can be added here
    ]
};
