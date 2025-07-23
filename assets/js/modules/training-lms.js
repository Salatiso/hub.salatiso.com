// /assets/js/modules/training-lms.js

document.addEventListener('DOMContentLoaded', () => {
    // Check if Firebase is initialized
    if (typeof firebase === 'undefined' || typeof firebase.firestore === 'undefined') {
        console.error("Firebase is not initialized. Make sure firebase-config.js is loaded correctly.");
        return;
    }

    const db = firebase.firestore();
    const courseGrid = document.getElementById('course-grid');
    const loadingIndicator = document.getElementById('loading-indicator');
    const noResults = document.getElementById('no-results');
    const categoryFilter = document.getElementById('category-filter');
    const audienceFilter = document.getElementById('audience-filter');
    const typeFilter = document.getElementById('type-filter');

    let allCourses = []; // Cache for all courses

    /**
     * Fetches courses from Firestore and populates the page
     */
    async function loadCourses() {
        if (!courseGrid || !loadingIndicator) return;
        
        loadingIndicator.style.display = 'block';
        courseGrid.innerHTML = '';

        try {
            const coursesCollection = await db.collection('courses').get();
            allCourses = coursesCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            if (allCourses.length > 0) {
                populateFilters(allCourses);
                displayCourses(allCourses);
            } else {
                courseGrid.innerHTML = '<p class="text-center col-span-full">No courses available yet. Run the seed script to populate content.</p>';
            }
        } catch (error) {
            console.error("Error fetching courses: ", error);
            courseGrid.innerHTML = '<p class="text-center col-span-full text-red-500">Could not load courses. Please check the console for errors.</p>';
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
            return;
        }

        courses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'course-card bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden';
            
            const audienceTagColor = course.audience === 'children' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
            const typeTagColor = course.type === 'game' ? 'bg-yellow-100 text-yellow-800' : 'bg-indigo-100 text-indigo-800';

            card.innerHTML = `
                <img src="${course.imageUrl || 'https://placehold.co/600x400/3498db/ffffff?text=' + encodeURIComponent(course.title)}" alt="${course.title}" class="w-full h-48 object-cover">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-2">
                        <p class="text-sm text-indigo-500 dark:text-indigo-400 font-semibold">${course.category || 'General'}</p>
                        <div>
                           <span class="inline-block rounded-full px-3 py-1 text-xs font-semibold mr-2 ${audienceTagColor}">${course.audience || 'All'}</span>
                           <span class="inline-block rounded-full px-3 py-1 text-xs font-semibold ${typeTagColor}">${course.type || 'Course'}</span>
                        </div>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${course.title}</h3>
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">${course.description || 'No description available.'}</p>
                    <a href="${course.link || '#'}" class="w-full text-center block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                        Start Learning
                    </a>
                </div>
            `;
            courseGrid.appendChild(card);
        });
    }

    /**
     * Populates the category filter dropdown from the course data
     * @param {Array<Object>} courses - The array of all courses
     */
    function populateFilters(courses) {
        const categories = [...new Set(courses.map(course => course.category).filter(Boolean))];
        
        // Clear existing options except the first one
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';

        categories.sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    /**
     * Filters the courses based on the selected filter values
     */
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

    // Add event listeners to filters
    categoryFilter.addEventListener('change', applyFilters);
    audienceFilter.addEventListener('change', applyFilters);
    typeFilter.addEventListener('change', applyFilters);

    // Initial load
    loadCourses();
});
