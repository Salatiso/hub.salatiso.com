// /assets/js/modules/training-lms.js

import { db } from '../firebase-config.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth } from '../firebase-config.js';

// ** FIX **: Wait for the 'firebase-ready' event from auth.js before running.
document.addEventListener('firebase-ready', () => {
    const courseGrid = document.getElementById('course-grid');
    const loadingIndicator = document.getElementById('loading-indicator');
    const noResults = document.getElementById('no-results');
    const categoryFilter = document.getElementById('category-filter');
    const audienceFilter = document.getElementById('audience-filter');
    const typeFilter = document.getElementById('type-filter');

    let allCourses = []; // Cache for all courses

    /**
     * ** NEW **: Generates an SVG placeholder image as a data URL.
     * @param {string} title - The course title to display in the SVG.
     * @returns {string} - A data URL for the generated SVG.
     */
    function generateSvgPlaceholder(title) {
        const words = title.split(' ');
        const initials = words.length > 1 
            ? (words[0][0] + words[1][0]).toUpperCase()
            : title.substring(0, 2).toUpperCase();
        
        const svg = `
            <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
                <rect width="100%" height="100%" fill="#4a5568"></rect>
                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, sans-serif" font-size="90" fill="#ffffff" font-weight="bold">${initials}</text>
                <text x="50%" y="70%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, sans-serif" font-size="30" fill="#cbd5e0">${title}</text>
            </svg>
        `;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }


    /**
     * Fetches courses from Firestore and populates the page
     */
    async function loadCourses() {
        if (!courseGrid || !loadingIndicator) return;
        
        loadingIndicator.style.display = 'block';
        courseGrid.innerHTML = '';

        try {
            const coursesQuery = query(collection(db, 'courses'), orderBy('title'));
            const coursesCollection = await getDocs(coursesQuery);
            allCourses = coursesCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            if (allCourses.length > 0) {
                populateFilters(allCourses);
                displayCourses(allCourses);
            } else {
                noResults.classList.remove('hidden');
                noResults.innerHTML = `
                    <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300">No Courses in Database</h2>
                    <p class="text-gray-500 dark:text-gray-400 mt-2">Run the 'seed-courses.js' script from the console to populate content.</p>
                `;
            }
        } catch (error) {
            console.error("Error fetching courses: ", error);
            courseGrid.innerHTML = `<p class="text-center col-span-full text-red-500">Could not load courses. Ensure Firestore security rules allow reads on the 'courses' collection.</p>`;
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }

    /**
     * Displays an array of course objects as cards in the grid
     * @param {Array<Object>} courses - The courses to display
     */
    function displayCourses(courses) {
        courseGrid.innerHTML = '';
        noResults.classList.add('hidden');

        if (courses.length === 0) {
            noResults.classList.remove('hidden');
            noResults.innerHTML = `
                <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300">No Courses Found</h2>
                <p class="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your filters to find what you're looking for.</p>
            `;
            return;
        }

        courses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'course-card bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col';
            
            const audienceTagColor = course.audience === 'children' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            const typeTagColor = course.type === 'game' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
            
            // ** FIX **: Use the SVG placeholder if no imageUrl is provided
            const imageUrl = course.imageUrl || generateSvgPlaceholder(course.title);

            card.innerHTML = `
                <div class="course-card-image">
                    <img src="${imageUrl}" alt="${course.title}" class="w-full h-48 object-cover">
                </div>
                <div class="p-6 flex-grow flex flex-col">
                    <div class="flex justify-between items-center mb-2">
                        <p class="text-sm text-indigo-500 dark:text-indigo-400 font-semibold">${course.category || 'General'}</p>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${course.title}</h3>
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow">${course.description || 'No description available.'}</p>
                    <div class="flex justify-between items-center mt-auto pt-4">
                         <div>
                           <span class="inline-block rounded-full px-3 py-1 text-xs font-semibold mr-2 ${audienceTagColor}">${course.audience || 'All'}</span>
                           <span class="inline-block rounded-full px-3 py-1 text-xs font-semibold ${typeTagColor}">${course.type || 'Course'}</span>
                        </div>
                        <a href="${course.link || '#'}" class="text-center block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                           <i class="fas fa-play mr-2"></i>Start
                        </a>
                    </div>
                </div>
            `;
            courseGrid.appendChild(card);
        });
    }

    function populateFilters(courses) {
        const categories = [...new Set(courses.map(course => course.category).filter(Boolean))];
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        categories.sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    function applyFilters() {
        const category = categoryFilter.value;
        const audience = audienceFilter.value;
        const type = typeFilter.value;

        let filteredCourses = allCourses;

        if (category !== 'all') {
            filteredCourses = filteredCourses.filter(course => course.category === category);
        }
        if (audience !== 'all') {
            filteredCourses = filteredCourses.filter(course => course.audience === audience);
        }
        if (type !== 'all') {
            filteredCourses = filteredCourses.filter(course => course.type === type);
        }

        displayCourses(filteredCourses);
    }

    categoryFilter.addEventListener('change', applyFilters);
    audienceFilter.addEventListener('change', applyFilters);
    typeFilter.addEventListener('change', applyFilters);

    loadCourses();
});
