document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('resources-gallery');

    // Expanded list of all resources with categories
    const resources = [
        // Category: Posters
        { title: 'DocuHelp Poster', file: 'docuhelp-poster.html', category: 'Posters & Visuals' },
        { title: 'FinHelp Poster', file: 'finhelp-poster.html', category: 'Posters & Visuals' },
        { title: 'HRHelp Poster', file: 'hrhelp-poster.html', category: 'Posters & Visuals' },
        { title: 'LegalHelp & Flamea Poster', file: 'legalhelp-flamea-poster.html', category: 'Posters & Visuals' },
        { title: 'SafetyHelp Poster', file: 'safetyhelp-poster.html', category: 'Posters & Visuals' },
        { title: 'Family Hub Poster', file: 'familyhub-poster.html', category: 'Posters & Visuals' },
        { title: 'LifeCV Poster', file: 'lifecv-poster.html', category: 'Posters & Visuals' },
        { title: 'CommsHub Poster', file: 'commshub-poster.html', category: 'Posters & Visuals' },
        { title: 'eKhaya Poster', file: 'ekhaya-poster.html', category: 'Posters & Visuals' },
        // Category: Explainers
        { title: 'The Hub & Ecosystem Explainer', file: 'the_hub-ecosystem-explainer.html', category: 'Foundational Explainers' },
        { title: 'DocuHelp Explainer', file: 'docuhelp-explainer.html', category: 'Foundational Explainers' },
        { title: 'FinHelp Explainer', file: 'finhelp-explainer.html', category: 'Foundational Explainers' },
        { title: 'HRHelp Explainer', file: 'hrhelp-explainer.html', category: 'Foundational Explainers' },
        // Category: Guides
        { title: 'First-Time User Guide', file: 'first-time-user-guide.html', category: 'User Guides' },
        { title: 'How-To: Create Your First Document', file: 'how-to-create-first-document.html', category: 'User Guides' },
        { title: 'How-To: Set Up a Family Budget', file: 'how-to-setup-family-budget.html', category: 'User Guides' },
        { title: 'How-To: Build Your LifeCV', file: 'how-to-build-your-lifecv.html', category: 'User Guides' },
        // Category: Brochures & Pamphlets
        { title: 'General Ecosystem Brochure', file: '../brochures/general-ecosystem-brochure.html', category: 'Brochures & Pamphlets' },
        { title: 'Explainer Pamphlet Template', file: '../pamphlets/explainer-pamphlet-template.html', category: 'Brochures & Pamphlets' }
    ];

    if (galleryContainer) {
        // Group resources by category
        const groupedResources = resources.reduce((acc, resource) => {
            (acc[resource.category] = acc[resource.category] || []).push(resource);
            return acc;
        }, {});

        // Generate HTML for each category and its resources
        for (const category in groupedResources) {
            // Add category header
            const categoryHeader = document.createElement('h2');
            categoryHeader.className = 'text-3xl font-bold font-roboto-slab text-gray-800 mb-6 mt-10 border-b-2 border-gray-200 dark:border-gray-700 pb-2';
            categoryHeader.textContent = category;
            galleryContainer.appendChild(categoryHeader);
            
            // Add grid for the resources in this category
            const grid = document.createElement('div');
            grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8';
            galleryContainer.appendChild(grid);

            groupedResources[category].forEach(resource => {
                const basePath = resource.category === 'Brochures & Pamphlets' ? 'templates/marketing/' : 'templates/marketing/posters/';
                const resourcePath = (resource.file.includes('../')) ? `templates/marketing/${resource.file.replace('../', '')}` : `templates/marketing/explainers/${resource.file}`;
                
                let path;
                if (resource.category === 'Posters & Visuals') {
                    path = `templates/marketing/posters/${resource.file}`;
                } else if (resource.category === 'Foundational Explainers') {
                    path = `templates/marketing/explainers/${resource.file}`;
                } else if (resource.category === 'User Guides') {
                     path = `templates/guides/${resource.file}`;
                } else {
                     path = `templates/marketing/${resource.file.replace('../', '')}`;
                }


                const thumbnailUrl = `https://placehold.co/600x800/374151/ffffff?text=${encodeURIComponent(resource.title.split(' ')[0])}`;

                const card = document.createElement('div');
                card.className = 'resource-card bg-white rounded-lg shadow-lg overflow-hidden flex flex-col';
                
                card.innerHTML = `
                    <div class="p-4">
                        <img src="${thumbnailUrl}" alt="${resource.title}" class="w-full h-auto object-cover rounded-md">
                    </div>
                    <div class="p-4 flex-grow flex flex-col">
                        <h3 class="text-lg font-bold text-gray-800">${resource.title}</h3>
                        <div class="mt-auto pt-4 flex justify-around">
                            <a href="${path}" target="_blank" class="text-blue-600 hover:text-blue-800 transition-colors" title="View Full Size">
                                <i class="fas fa-eye fa-2x"></i>
                            </a>
                            <a href="${path}" target="_blank" class="text-green-600 hover:text-green-800 transition-colors" title="Download / Print (Save as PDF)">
                                <i class="fas fa-download fa-2x"></i>
                            </a>
                            <button data-link="${window.location.origin}/${path}" class="share-btn text-purple-600 hover:text-purple-800 transition-colors" title="Share Link">
                                <i class="fas fa-share-alt fa-2x"></i>
                            </button>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        // Add event listeners for the share buttons
        document.querySelectorAll('.share-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const linkToShare = e.currentTarget.dataset.link;
                try {
                    if (navigator.share) {
                        await navigator.share({
                            title: 'The Hub by Salatiso - Resource',
                            text: `Check out this resource from The Hub: ${linkToShare}`,
                            url: linkToShare,
                        });
                    } else {
                        navigator.clipboard.writeText(linkToShare).then(() => {
                            alert('Link copied to clipboard!');
                        });
                    }
                } catch (err) {
                    console.error('Share failed:', err);
                    navigator.clipboard.writeText(linkToShare).then(() => {
                        alert('Link copied to clipboard!');
                    });
                }
            });
        });
    }
});
