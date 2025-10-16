// Model configuration
const MODELS = [
    {
        id: 'gpt-oss-120b',
        name: 'GPT-OSS-120B',
        icon: '🤖',
        description: 'Open Source GPT Model'
    },
    {
        id: 'claude-4.5',
        name: 'Claude 4.5',
        icon: '🧠',
        description: 'Anthropic Claude Model'
    },
    {
        id: 'deepseek-v3-r1',
        name: 'DeepSeek V3 R1',
        icon: '🔍',
        description: 'DeepSeek Reasoning Model'
    }
];

// Status thresholds (in seconds)
const THRESHOLDS = {
    healthy: 10,     // < 10 seconds
    warning: 30      // 10-30 seconds
    // > 30 seconds = critical
};

// Refresh interval (30 seconds)
const REFRESH_INTERVAL = 30000;

// Global state
let refreshTimer = null;

/**
 * Initialize the status page
 */
function initStatusPage() {
    renderModelCards();
    fetchAndUpdateStatus();
    
    // Auto-refresh every 30 seconds
    refreshTimer = setInterval(fetchAndUpdateStatus, REFRESH_INTERVAL);
}

/**
 * Render model status cards
 */
function renderModelCards() {
    const container = document.getElementById('model-status-container');
    
    const cardsHTML = MODELS.map(model => `
        <div class="col-md-6 col-lg-4">
            <div class="card model-card" id="card-${model.id}">
                <div class="card-body">
                    <div class="model-header">
                        <div class="model-name">
                            <div class="model-icon">${model.icon}</div>
                            <div>
                                <h4>${model.name}</h4>
                                <p class="text-muted mb-0" style="font-size: 0.875rem;">${model.description}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="model-metrics">
                        <div class="metric-item">
                            <div class="metric-label">
                                <i class="fas fa-tachometer-alt"></i>
                                P95 응답속도
                            </div>
                            <div class="metric-value" id="p95-${model.id}">
                                <i class="fas fa-spinner fa-spin"></i>
                            </div>
                        </div>
                        
                        <div class="metric-item">
                            <div class="metric-label">
                                <i class="fas fa-traffic-light"></i>
                                상태
                            </div>
                            <div id="status-${model.id}">
                                <span class="status-indicator"></span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <span class="status-text" id="status-text-${model.id}">
                            <i class="fas fa-spinner fa-spin"></i> 확인 중...
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = cardsHTML;
}

/**
 * Fetch metrics from Prometheus and update status
 */
async function fetchAndUpdateStatus() {
    try {
        // In a real implementation, this would fetch from a Prometheus API endpoint
        // For now, we'll use mock data
        const metrics = await fetchMetrics();
        
        updateModelStatus(metrics);
        updateOverallStatus(metrics);
        updateLastUpdateTime();
        
    } catch (error) {
        console.error('Failed to fetch metrics:', error);
        showError();
    }
}

/**
 * Fetch metrics from API (mock implementation)
 */
async function fetchMetrics() {
    // Mock API call - replace with actual Prometheus query
    // In production, this would call something like:
    // const response = await fetch('/api/metrics/p95?duration=1h');
    // return await response.json();
    
    return new Promise(resolve => {
        setTimeout(() => {
            // Generate mock data with realistic values
            const metrics = {};
            
            MODELS.forEach(model => {
                // Simulate different response times for different models
                let p95;
                const random = Math.random();
                
                if (model.id === 'gpt-oss-120b') {
                    // Sometimes slow
                    p95 = random < 0.7 ? 5 + Math.random() * 8 : 15 + Math.random() * 20;
                } else if (model.id === 'claude-4.5') {
                    // Usually fast
                    p95 = random < 0.9 ? 3 + Math.random() * 6 : 12 + Math.random() * 15;
                } else {
                    // Variable performance
                    p95 = random < 0.5 ? 6 + Math.random() * 10 : 25 + Math.random() * 15;
                }
                
                metrics[model.id] = {
                    p95: p95,
                    timestamp: Date.now()
                };
            });
            
            resolve(metrics);
        }, 500);
    });
}

/**
 * Update model status displays
 */
function updateModelStatus(metrics) {
    MODELS.forEach(model => {
        const metric = metrics[model.id];
        if (!metric) return;
        
        const p95Seconds = metric.p95;
        const status = getStatusLevel(p95Seconds);
        
        // Update P95 value
        const p95Element = document.getElementById(`p95-${model.id}`);
        p95Element.innerHTML = `
            ${p95Seconds.toFixed(2)} <span class="metric-unit">초</span>
        `;
        p95Element.className = `metric-value ${status}`;
        
        // Update status indicator
        const statusElement = document.getElementById(`status-${model.id}`);
        statusElement.innerHTML = `
            <span class="status-indicator status-${status}"></span>
        `;
        
        // Update status text
        const statusTextElement = document.getElementById(`status-text-${model.id}`);
        const statusInfo = getStatusInfo(status);
        statusTextElement.innerHTML = `
            <i class="${statusInfo.icon}"></i> ${statusInfo.text}
        `;
        statusTextElement.className = `status-text ${status}`;
    });
}

/**
 * Update overall system status
 */
function updateOverallStatus(metrics) {
    const statusCounts = {
        healthy: 0,
        warning: 0,
        critical: 0
    };
    
    MODELS.forEach(model => {
        const metric = metrics[model.id];
        if (!metric) return;
        
        const status = getStatusLevel(metric.p95);
        statusCounts[status]++;
    });
    
    const overallStatusElement = document.getElementById('overall-status');
    let overallStatus, overallText, overallIcon;
    
    if (statusCounts.critical > 0) {
        overallStatus = 'danger';
        overallText = '시스템 문제 감지';
        overallIcon = 'fa-exclamation-triangle';
    } else if (statusCounts.warning > 0) {
        overallStatus = 'warning';
        overallText = '일부 모델 지연';
        overallIcon = 'fa-exclamation-circle';
    } else {
        overallStatus = 'success';
        overallText = '모든 시스템 정상';
        overallIcon = 'fa-check-circle';
    }
    
    overallStatusElement.innerHTML = `
        <i class="fas ${overallIcon}"></i> ${overallText}
    `;
    overallStatusElement.className = `badge badge-lg badge-${overallStatus}`;
}

/**
 * Update last update time
 */
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR');
    document.getElementById('last-update').textContent = timeString;
}

/**
 * Get status level based on P95 value
 */
function getStatusLevel(p95Seconds) {
    if (p95Seconds < THRESHOLDS.healthy) {
        return 'healthy';
    } else if (p95Seconds <= THRESHOLDS.warning) {
        return 'warning';
    } else {
        return 'critical';
    }
}

/**
 * Get status information for display
 */
function getStatusInfo(status) {
    const statusMap = {
        healthy: {
            text: '정상',
            icon: 'fas fa-check-circle'
        },
        warning: {
            text: '경고',
            icon: 'fas fa-exclamation-circle'
        },
        critical: {
            text: '심각',
            icon: 'fas fa-exclamation-triangle'
        }
    };
    
    return statusMap[status] || statusMap.healthy;
}

/**
 * Show error state
 */
function showError() {
    const overallStatusElement = document.getElementById('overall-status');
    overallStatusElement.innerHTML = `
        <i class="fas fa-times-circle"></i> 연결 오류
    `;
    overallStatusElement.className = 'badge badge-lg badge-danger';
    
    MODELS.forEach(model => {
        const p95Element = document.getElementById(`p95-${model.id}`);
        p95Element.innerHTML = `<i class="fas fa-exclamation-triangle"></i>`;
        p95Element.className = 'metric-value critical';
        
        const statusTextElement = document.getElementById(`status-text-${model.id}`);
        statusTextElement.innerHTML = `
            <i class="fas fa-times-circle"></i> 데이터 없음
        `;
        statusTextElement.className = 'status-text critical';
    });
}

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStatusPage);
} else {
    initStatusPage();
}

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MODELS,
        THRESHOLDS,
        fetchMetrics,
        getStatusLevel
    };
}
