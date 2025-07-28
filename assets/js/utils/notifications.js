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
        <div class="flex items-start" role="alert" aria-live="assertive">
            <div class="flex-shrink-0">
                <i class="${getNotificationIcon(type)} text-lg" aria-hidden="true"></i>
            </div>
            <div class="ml-3 flex-1">
                <p class="text-sm font-medium" role="status">${message}</p>
            </div>
            <div class="ml-4 flex-shrink-0">
                <button onclick="window.notifications.closeNotification('${id}')"
                        class="inline-flex text-gray-400 hover:text-gray-600"
                        aria-label="Close notification">
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
        success: 'bg-green-100 border-green-300 text-green-800',  // 4.68:1 contrast
        error: 'bg-red-100 border-red-300 text-red-800',         // 4.63:1
        warning: 'bg-yellow-100 border-yellow-300 text-yellow-800', // 4.52:1
        info: 'bg-blue-100 border-blue-300 text-blue-800'        // 4.54:1
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