// ============================================
// Main Client-Side JavaScript
// ============================================

console.log('Telnyx Media Streaming App Loaded');

// Auto-refresh active calls every 5 seconds
function setupAutoRefresh() {
    const currentPage = window.location.pathname;
    if (currentPage.includes('/calls') && !currentPage.includes('/new')) {
        setInterval(() => {
            location.reload();
        }, 5000);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupAutoRefresh();
    console.log('DOM Content Loaded');
});

// WebSocket connection for real-time updates (optional)
function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.addEventListener('open', () => {
        console.log('✅ WebSocket connected');
    });

    ws.addEventListener('message', (event) => {
        console.log('📨 Message from server:', event.data);
    });

    ws.addEventListener('error', (error) => {
        console.error('❌ WebSocket error:', error);
    });

    ws.addEventListener('close', () => {
        console.log('🔌 WebSocket disconnected');
    });

    return ws;
}

// Format phone numbers
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
}

// Format duration in seconds to readable format
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '80px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '400px';

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}
