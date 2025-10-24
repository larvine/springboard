// Model configuration (동적으로 API에서 가져옴)
let MODELS = [];  // API에서 동적으로 채워짐

// 모델 아이콘 매핑 (선택적)
const MODEL_ICONS = {
    'gpt': '🤖',
    'claude': '🧠',
    'deepseek': '🔍',
    'llama': '🦙',
    'gemini': '💎',
    'mistral': '🌪️',
    'default': '🔮'
};

// 모델명에서 아이콘 추론
function getModelIcon(modelName) {
    const lowerName = modelName.toLowerCase();
    
    for (const [key, icon] of Object.entries(MODEL_ICONS)) {
        if (lowerName.includes(key)) {
            return icon;
        }
    }
    
    return MODEL_ICONS.default;
}

// 모델명을 표시용으로 포맷팅
function formatModelName(modelName) {
    // "gpt-4" -> "GPT-4"
    // "gpt-oss-120b" -> "GPT-OSS-120B"
    return modelName
        .split('-')
        .map(part => part.toUpperCase())
        .join('-');
}

// Status thresholds (in milliseconds)
const THRESHOLDS = {
    healthy: 100,     // < 100ms
    warning: 200      // 100-200ms
    // > 200ms = critical
};

// API Configuration
const API_BASE_URL = 'http://localhost:8000';
const USE_REAL_API = true;  // true: Django API 사용, false: Mock 데이터 사용

// Refresh interval (30 seconds)
const REFRESH_INTERVAL = 30000;

// Global state
let refreshTimer = null;

/**
 * Initialize the status page
 */
async function initStatusPage() {
    // 먼저 API에서 모델 목록을 가져와서 초기화
    await fetchAndInitializeModels();
    
    // Auto-refresh every 30 seconds
    refreshTimer = setInterval(fetchAndUpdateStatus, REFRESH_INTERVAL);
}

/**
 * API에서 모델 목록을 가져와서 초기화
 */
async function fetchAndInitializeModels() {
    try {
        const metrics = await fetchMetrics();
        
        if (metrics && Object.keys(metrics).length > 0) {
            // API 데이터로 MODELS 배열 생성
            MODELS = Object.entries(metrics).map(([modelId, data]) => ({
                id: modelId,
                name: formatModelName(data.model_name || modelId),
                icon: getModelIcon(data.model_name || modelId),
                description: `AI Model: ${data.model_name || modelId}`
            }));
        } else {
            // 데이터가 없으면 빈 상태 표시
            MODELS = [];
        }
        
        // 모델 카드 렌더링
        renderModelCards();
        
        // 상태 업데이트
        updateModelStatus(metrics);
        updateOverallStatus(metrics);
        updateLastUpdateTime();
        
    } catch (error) {
        console.error('Failed to initialize models:', error);
        showError();
    }
}

/**
 * Render model status cards
 */
function renderModelCards() {
    const container = document.getElementById('model-status-container');
    
    if (!MODELS || MODELS.length === 0) {
        // 모델 데이터가 없는 경우
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info text-center">
                    <i class="fas fa-info-circle"></i>
                    <h5 class="mt-2">메트릭 데이터가 없습니다</h5>
                    <p class="mb-0">메트릭 수집을 실행하세요: <code>python3 manage.py collect_metrics</code></p>
                </div>
            </div>
        `;
        return;
    }
    
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
 * Fetch metrics from Django API
 */
async function fetchMetrics() {
    if (!USE_REAL_API) {
        // Mock data for testing
        return fetchMockMetrics();
    }
    
    try {
        // Call Django API endpoint
        const response = await fetch(`${API_BASE_URL}/api/metrics/p95/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error('API returned unsuccessful status');
        }
        
        // Convert API response to metrics format
        const metrics = {};
        
        data.data.forEach(item => {
            // API에서 받은 모델명을 그대로 ID로 사용 (동적)
            const modelId = item.model;
            
            metrics[modelId] = {
                p95: item.p95_latency_ms,  // 밀리초 단위
                timestamp: new Date(item.collected_at).getTime(),
                model_name: item.model
            };
        });
        
        return metrics;
        
    } catch (error) {
        console.error('Failed to fetch from API:', error);
        
        // Fallback to mock data if API fails
        console.warn('Falling back to mock data');
        return fetchMockMetrics();
    }
}


/**
 * Fetch mock metrics (for testing)
 */
function fetchMockMetrics() {
    return new Promise(resolve => {
        setTimeout(() => {
            // Mock 데이터 - 실제와 비슷한 모델명
            const mockModels = [
                'gpt-4',
                'gpt-3.5-turbo',
                'claude-3-opus',
                'llama-2-70b',
                'mistral-large'
            ];
            
            const metrics = {};
            
            mockModels.forEach((modelName, index) => {
                const random = Math.random();
                let p95;
                
                // 모델마다 다른 성능 특성
                if (index === 0) {
                    p95 = random < 0.7 ? 50 + Math.random() * 80 : 150 + Math.random() * 200;
                } else if (index === 1) {
                    p95 = random < 0.9 ? 30 + Math.random() * 60 : 120 + Math.random() * 150;
                } else {
                    p95 = random < 0.5 ? 60 + Math.random() * 100 : 250 + Math.random() * 150;
                }
                
                metrics[modelName] = {
                    p95: p95,
                    timestamp: Date.now(),
                    model_name: modelName
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
        if (!metric) {
            // 데이터가 없는 경우
            updateModelAsNoData(model.id);
            return;
        }
        
        const p95Ms = metric.p95;  // 밀리초 단위
        const status = getStatusLevel(p95Ms);
        
        // Update P95 value
        const p95Element = document.getElementById(`p95-${model.id}`);
        p95Element.innerHTML = `
            ${p95Ms.toFixed(2)} <span class="metric-unit">ms</span>
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
 * Update model display when no data is available
 */
function updateModelAsNoData(modelId) {
    const p95Element = document.getElementById(`p95-${modelId}`);
    p95Element.innerHTML = `<span class="text-muted">데이터 없음</span>`;
    p95Element.className = 'metric-value';
    
    const statusElement = document.getElementById(`status-${modelId}`);
    statusElement.innerHTML = `
        <span class="status-indicator" style="background-color: #999;"></span>
    `;
    
    const statusTextElement = document.getElementById(`status-text-${modelId}`);
    statusTextElement.innerHTML = `
        <i class="fas fa-info-circle"></i> 수집 대기 중
    `;
    statusTextElement.className = 'status-text text-muted';
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
 * Get status level based on P95 value (in milliseconds)
 */
function getStatusLevel(p95Ms) {
    if (p95Ms < THRESHOLDS.healthy) {
        return 'healthy';
    } else if (p95Ms <= THRESHOLDS.warning) {
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

/**
 * Profile Dropdown Functionality
 */
function initProfileDropdown() {
    const dropdownToggle = document.getElementById('profileDropdownToggle');
    const dropdownMenu = document.getElementById('profileDropdownMenu');
    const logoutButton = document.getElementById('logoutButton');
    const profileSettings = document.getElementById('profileSettings');
    const accountSettings = document.getElementById('accountSettings');
    
    // Create overlay for closing dropdown
    const overlay = document.createElement('div');
    overlay.className = 'dropdown-overlay';
    overlay.id = 'dropdownOverlay';
    document.body.appendChild(overlay);
    
    // Toggle dropdown
    dropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdownMenu.classList.contains('show');
        
        if (isOpen) {
            closeDropdown();
        } else {
            openDropdown();
        }
    });
    
    // Close dropdown when clicking overlay
    overlay.addEventListener('click', closeDropdown);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
            closeDropdown();
        }
    });
    
    // Logout functionality
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });
    
    // Profile settings
    profileSettings.addEventListener('click', (e) => {
        e.preventDefault();
        alert('프로필 설정 페이지로 이동합니다.');
        closeDropdown();
    });
    
    // Account settings
    accountSettings.addEventListener('click', (e) => {
        e.preventDefault();
        alert('계정 설정 페이지로 이동합니다.');
        closeDropdown();
    });
    
    function openDropdown() {
        dropdownMenu.classList.add('show');
        dropdownToggle.classList.add('active');
        overlay.classList.add('show');
    }
    
    function closeDropdown() {
        dropdownMenu.classList.remove('show');
        dropdownToggle.classList.remove('active');
        overlay.classList.remove('show');
    }
    
    function handleLogout() {
        // Confirm logout
        if (confirm('로그아웃 하시겠습니까?')) {
            // Show loading state
            logoutButton.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                <span>로그아웃 중...</span>
            `;
            
            // Simulate logout process
            setTimeout(() => {
                // In a real application, you would:
                // 1. Call logout API endpoint
                // 2. Clear session/tokens
                // 3. Redirect to login page
                
                alert('로그아웃 되었습니다.');
                closeDropdown();
                
                // Reset logout button
                logoutButton.innerHTML = `
                    <i class="fas fa-sign-out-alt"></i>
                    <span>로그아웃</span>
                `;
                
                // Redirect to login page (uncomment in production)
                // window.location.href = '/login';
            }, 1000);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initStatusPage();
        initProfileDropdown();
    });
} else {
    initStatusPage();
    initProfileDropdown();
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
