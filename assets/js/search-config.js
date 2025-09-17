/**
 * Grant Insight Perfect - Search Configuration
 * Version: 4.0.0
 * Phase: Production
 * 
 * Unified search system configuration
 */

const GISearchConfig = {
    // Version and phase information
    version: '4.0.0',
    phase: 'Production',
    timeout: 30000, // 30 seconds timeout
    
    // DOM element IDs configuration
    elements: {
        // Search input fields (can be multiple)
        searchInputs: ['gi-search-input-unified-main'],
        
        // Filter elements organized by type
        filters: {
            amount: ['amount-filter'],
            status: ['status-filter'], 
            industry: ['industry-filter'],
            region: ['region-filter']
        },
        
        // Sort and display controls
        sortSelect: 'sort-order',
        perPageSelect: 'per-page-select',
        
        // Result containers
        resultsContainer: 'search-results-unified',
        pagination: 'pagination-unified',
        loadingIndicator: 'search-loading'
    },
    
    // UI behavior configuration
    ui: {
        showLoadingOnSearch: true,
        enableAutoComplete: true,
        debounceDelay: 300,
        animationDuration: 200,
        scrollToResults: true,
        scrollOffset: 100
    },
    
    // API endpoint configuration
    api: {
        endpoint: 'gi_unified_search',
        suggest: 'gi_search_suggest',
        favorites: 'gi_toggle_favorite'
    },
    
    // Default search parameters
    defaults: {
        page: 1,
        posts_per_page: 20,
        orderby: 'date_desc',
        keyword: '',
        amount: '',
        status: '',
        industry: '',
        region: ''
    },
    
    // Validation rules
    validation: {
        minKeywordLength: 0,
        maxKeywordLength: 100,
        validOrderBy: [
            'date_desc',
            'date_asc', 
            'amount_desc',
            'amount_asc', 
            'deadline_asc', 
            'success_rate_desc', 
            'popularity', 
            'title_asc'
        ],
        validPerPage: [10, 20, 50, 100],
        maxPage: 1000
    },
    
    // Messages and strings
    messages: {
        loading: '検索中...',
        error: 'エラーが発生しました',
        noResults: '検索結果が見つかりませんでした',
        resultsCount: '件の結果が見つかりました',
        searchPlaceholder: '助成金を検索...',
        networkError: 'ネットワークエラーが発生しました',
        timeout: 'タイムアウトしました',
        invalidParams: '無効なパラメータです'
    }
};

// Export configuration (make available globally)
if (typeof window !== 'undefined') {
    window.GISearchConfig = GISearchConfig;
}

// Log configuration status if debug mode is enabled
if (typeof gi_ajax !== 'undefined' && gi_ajax.debug) {
    console.log('[GISearchConfig] Configuration loaded:', {
        version: GISearchConfig.version,
        phase: GISearchConfig.phase,
        elements: Object.keys(GISearchConfig.elements),
        api: GISearchConfig.api
    });
}