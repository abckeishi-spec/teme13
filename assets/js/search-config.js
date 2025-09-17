/**
 * 統合検索システム共通設定
 * Grant Insight Perfect - 統合検索システム究極版
 * 
 * @version 1.0.0-unified
 * @package Grant_Insight_Perfect
 */
window.GISearchConfig = {
    // 統一DOM要素ID
    elements: {
        // 検索入力（優先度順）
        searchInputs: [
            'gi-search-input-unified',  // 新統一ID
            'grant-search',             // archive用（既存）
            'search-keyword-input',     // section用（既存）
            'search-keyword'            // header用（既存）
        ],
        
        // 検索ボタン
        searchButtons: [
            'gi-search-btn-unified',    // 新統一ID
            'search-btn',               // archive用
            'search-submit-btn',        // section用
            'execute-search'            // header用
        ],
        
        // 結果表示
        resultsContainers: [
            'gi-results-unified',       // 新統一ID
            'grants-display',           // archive用
            'search-results-preview'    // section用
        ],
        
        // フィルター
        filters: {
            category: ['filter-category', 'gi-filter-category'],
            prefecture: ['filter-prefecture', 'gi-filter-prefecture'],
            industry: ['filter-industry', 'gi-filter-industry'],
            amount: ['filter-amount', 'gi-filter-amount'],
            status: ['filter-status', 'gi-filter-status'],
            difficulty: ['filter-difficulty', 'gi-filter-difficulty'],
            success_rate: ['filter-success-rate', 'gi-filter-success-rate']
        },
        
        // その他の要素
        loadingIndicator: ['gi-loading', 'search-loading'],
        errorContainer: ['gi-error', 'search-error'],
        suggestionContainer: ['gi-suggestions', 'search-suggestions'],
        voiceButton: ['gi-voice-btn', 'voice-search-btn', 'voice-search'],
        clearButton: ['gi-clear-btn', 'search-clear'],
        
        // ページネーション
        pagination: ['gi-pagination', 'search-pagination'],
        
        // フィルターパネル
        filterPanel: ['gi-filter-panel', 'advanced-filters'],
        filterToggle: ['gi-filter-toggle', 'filter-toggle-btn']
    },
    
    // AJAX設定
    ajax: {
        action: 'gi_unified_search',
        timeout: 30000,
        retryLimit: 3,
        retryDelay: 1000
    },
    
    // 統一CSS classes
    classes: {
        // 検索関連
        searchInput: 'gi-search-input-unified',
        searchButton: 'gi-search-button-unified',
        searchContainer: 'gi-search-container-unified',
        
        // 状態管理
        loadingState: 'gi-loading',
        errorState: 'gi-error',
        successState: 'gi-success',
        emptyState: 'gi-empty',
        
        // 結果表示
        grantCard: 'gi-grant-card-unified',
        grantGrid: 'gi-grant-grid-unified',
        grantList: 'gi-grant-list-unified',
        
        // フィルター
        filterActive: 'gi-filter-active',
        filterGroup: 'gi-filter-group',
        
        // アニメーション
        fadeIn: 'gi-fade-in',
        slideUp: 'gi-slide-up',
        pulse: 'gi-pulse',
        
        // 通知
        notification: 'gi-notification',
        notificationSuccess: 'gi-notification-success',
        notificationError: 'gi-notification-error',
        notificationWarning: 'gi-notification-warning',
        notificationInfo: 'gi-notification-info'
    },
    
    // デフォルト設定
    defaults: {
        // 検索パラメータ
        searchParams: {
            search: '',
            categories: [],
            prefectures: [],
            industries: [],
            amount: '',
            status: [],
            difficulty: [],
            success_rate: [],
            page: 1,
            posts_per_page: 12,
            orderby: 'date',
            order: 'DESC'
        },
        
        // 表示設定
        display: {
            postsPerPage: 12,
            maxSuggestions: 10,
            animationDelay: 100,
            notificationDuration: 5000
        },
        
        // 音声検索設定
        voice: {
            lang: 'ja-JP',
            continuous: false,
            interimResults: false,
            maxAlternatives: 1
        },
        
        // キャッシュ設定
        cache: {
            enabled: true,
            ttl: 300000, // 5分
            maxSize: 50
        }
    },
    
    // 統合フラグ（システム統合状態の追跡）
    integration: {
        initialized: false,
        legacySystems: {
            archiveManager: false,
            searchSection: false,
            headerSearch: false
        },
        bridgeLoaded: false,
        configLoaded: true
    },
    
    // デバッグ設定
    debug: {
        enabled: typeof window.gi_ajax !== 'undefined' && window.gi_ajax.debug,
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
        logPrefix: '[GI-Search]'
    },
    
    // 互換性設定
    compatibility: {
        // レガシーイベント名のマッピング
        eventMapping: {
            'search-execute': 'gi:search:execute',
            'search-complete': 'gi:search:complete',
            'search-error': 'gi:search:error',
            'filter-change': 'gi:filter:change',
            'results-update': 'gi:results:update'
        },
        
        // レガシー関数名のマッピング
        functionMapping: {
            'executeSearch': 'executeUnifiedSearch',
            'displayResults': 'renderResults',
            'showError': 'handleError',
            'clearSearch': 'resetSearch'
        }
    },
    
    // メッセージ定数
    messages: {
        loading: '検索中...',
        noResults: '該当する助成金が見つかりませんでした',
        error: 'エラーが発生しました',
        networkError: 'ネットワークエラーが発生しました',
        timeout: 'タイムアウトしました',
        voiceNotSupported: 'お使いのブラウザは音声検索に対応していません',
        voiceListening: '音声を認識中です...',
        voiceError: '音声認識に失敗しました',
        favoriteAdded: 'お気に入りに追加しました',
        favoriteRemoved: 'お気に入りから削除しました',
        searchReset: '検索条件をリセットしました',
        filterApplied: 'フィルターを適用しました'
    },
    
    // API エンドポイント
    endpoints: {
        search: 'gi_unified_search',
        suggestions: 'gi_get_search_suggestions',
        favorite: 'gi_toggle_favorite',
        stats: 'gi_get_search_stats'
    }
};

// 設定の凍結（変更防止）
if (typeof Object.freeze === 'function') {
    Object.freeze(window.GISearchConfig);
}

// 初期化完了イベントの発火
document.addEventListener('DOMContentLoaded', function() {
    // カスタムイベントで設定読み込み完了を通知
    const configLoadedEvent = new CustomEvent('gi:config:loaded', {
        detail: window.GISearchConfig
    });
    document.dispatchEvent(configLoadedEvent);
    
    // デバッグログ
    if (window.GISearchConfig.debug.enabled) {
        console.log(window.GISearchConfig.debug.logPrefix + ' 設定ファイルが読み込まれました', window.GISearchConfig);
    }
});

// グローバル参照の作成（互換性）
window.GI_CONFIG = window.GISearchConfig;
window.SearchConfig = window.GISearchConfig;