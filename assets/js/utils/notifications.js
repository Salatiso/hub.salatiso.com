/* ================================================================================= */
/* FILE: assets/js/utils/notifications.js                                           */
/* PURPOSE: Toast notification system for user feedback                             */
/* ================================================================================= */

let notificationCount = 0;

/**
 * Show toast notification
 */
export function showNotification(message, type = 'info', duration = 5000) {
    const container = getOrCreateNotificationContainer();
    const id = `notification-${++notificationCount}`;
    
    const notification = document.createElement('div');
    notification.id = id;
    notification.className = `notification transform translate-x-full transition-transform duration-300 ease-in-out mb-3 p-4 rounded-lg shadow-lg ${getNotificationClasses(type)}`;
    
    notification.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0">
                <i class="${getNotificationIcon(type)} text-lg"></i>
            </div>
            <div class="ml-3 flex-1">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <div class="ml-4 flex-shrink-0">
                <button onclick="window.notifications.closeNotification('${id}')" class="inline-flex text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 10);
    
    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            closeNotification(id);
        }, duration);
    }
    
    return id;
}

/**
 * Close specific notification
 */
export function closeNotification(id) {
    const notification = document.getElementById(id);
    if (notification) {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

/**
 * Get or create notification container
 */
function getOrCreateNotificationContainer() {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'fixed bottom-5 right-5 z-50 max-w-sm';
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Get notification CSS classes based on type
 */
function getNotificationClasses(type) {
    const classes = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white'
    };
    
    return classes[type] || classes.info;
}

/**
 * Get notification icon based on type
 */
function getNotificationIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    return icons[type] || icons.info;
}

// Make functions globally available
window.notifications = {
    closeNotification
};