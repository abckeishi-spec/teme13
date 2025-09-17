/**
 * Grant Insight Perfect - Unified Search System JavaScript
 * 統合検索システム JavaScript 完全版
 * 
 * @version 5.0-ultimate
 * @package Grant_Insight_Perfect
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    console.log('🚀 統合検索システム 初期化開始');

    // グローバル設定チェック
    if (typeof window.giSearchConfig === 'undefined') {
        console.error('❌ 検索設定が見つかりません');
        return;
    }

    // 統合検索システムメインクラス
    const GISearchManager = {
        // 設定
        config: {
            ajaxUrl: window.giSearchConfig.ajaxUrl,
            nonce: window.giSearchConfig.nonce,
            grantsUrl: window.giSearchConfig.grantsUrl || '/grants/',
            homeUrl: window.giSearchConfig.homeUrl || '/',
            debug: window.giSearchConfig.debug || false,
            timeout: 30000,
            debounceDelay: 500
        },

        // 状態管理
        state: {
            isLoading: false,
            lastSearch: null,
            searchResults: [],
            currentFilters: {},
            searchCache: new Map(),
            requestController: null
        },

        // DOM要素キャッシュ
        elements: {},

        /**
         * 初期化
         */
        init() {
            console.log('📝 統合検索システム初期化中...');
            
            this.cacheElements();
            this.bindEvents();
            this.setupSearchInterface();
            this.loadSavedFilters();
            
            console.log('✅ 統合検索システム初期化完了');
        },

        /**
         * DOM要素のキャッシュ
         */
        cacheElements() {
            // 検索フォーム要素
            this.elements = {
                searchForm: document.getElementById('unified-search-form'),
                searchInput: document.getElementById('search-keyword-input'),
                grantsSearchInput: document.getElementById('grant-search'),
                searchBtn: document.getElementById('search-btn'),
                searchSubmitBtn: document.getElementById('search-submit-btn'),
                clearBtn: document.getElementById('clear-search-btn'),
                
                // フィルター要素
                categoryFilter: document.getElementById('filter-category'),
                prefectureFilter: document.getElementById('filter-prefecture'),
                amountFilter: document.getElementById('filter-amount'),
                statusFilter: document.getElementById('filter-status'),
                difficultyFilter: document.getElementById('filter-difficulty'),
                successRateFilter: document.getElementById('filter-success-rate'),
                
                // 結果表示要素
                grantsContainer: document.getElementById('grants-display'),
                grantsGrid: document.querySelector('.grants-grid'),
                loadingIndicator: document.getElementById('loading-indicator'),
                resultsCount: document.getElementById('results-count'),
                paginationContainer: document.getElementById('pagination-container'),
                
                // プレビュー要素
                resultsPreview: document.getElementById('search-results-preview'),
                previewContent: document.getElementById('preview-content'),
                previewCount: document.getElementById('preview-count'),
                closePreview: document.getElementById('close-preview'),
                
                // サジェスト要素
                searchSuggestions: document.getElementById('search-suggestions'),
                
                // フィルター制御
                quickFilters: document.querySelectorAll('.quick-filter-pill'),
                applyFiltersBtn: document.getElementById('apply-filters'),
                resetFiltersBtn: document.getElementById('reset-all-filters')
            };

            // 存在しない要素を除外
            Object.keys(this.elements).forEach(key => {
                if (this.elements[key] === null) {
                    delete this.elements[key];
                }
            });
        },

        /**
         * イベントバインディング
         */
        bindEvents() {
            // 検索フォーム送信
            if (this.elements.searchForm) {
                this.elements.searchForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
            }

            // 検索ボタン
            if (this.elements.searchBtn) {
                this.elements.searchBtn.addEventListener('click', (e) => this.handleSearchClick(e));
            }

            if (this.elements.searchSubmitBtn) {
                this.elements.searchSubmitBtn.addEventListener('click', (e) => this.handleSearchClick(e));
            }

            // 検索入力
            const searchInputs = [this.elements.searchInput, this.elements.grantsSearchInput].filter(Boolean);
            searchInputs.forEach(input => {
                input.addEventListener('input', this.debounce((e) => this.handleSearchInput(e), this.config.debounceDelay));
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.executeSearch();
                    }
                });
                input.addEventListener('focus', () => this.showSuggestions());
                input.addEventListener('blur', () => setTimeout(() => this.hideSuggestions(), 200));
            });

            // クリアボタン
            if (this.elements.clearBtn) {
                this.elements.clearBtn.addEventListener('click', () => this.clearSearch());
            }

            // フィルター適用
            if (this.elements.applyFiltersBtn) {
                this.elements.applyFiltersBtn.addEventListener('click', () => this.applyFilters());
            }

            // フィルターリセット
            if (this.elements.resetFiltersBtn) {
                this.elements.resetFiltersBtn.addEventListener('click', () => this.resetFilters());
            }

            // クイックフィルター
            this.elements.quickFilters?.forEach(filter => {
                filter.addEventListener('click', (e) => this.handleQuickFilter(e));
            });

            // プレビュー閉じる
            if (this.elements.closePreview) {
                this.elements.closePreview.addEventListener('click', () => this.closePreview());
            }

            // フィルター変更
            const filterElements = [
                this.elements.categoryFilter,
                this.elements.prefectureFilter,
                this.elements.amountFilter,
                this.elements.statusFilter,
                this.elements.difficultyFilter,
                this.elements.successRateFilter
            ].filter(Boolean);

            filterElements.forEach(filter => {
                filter.addEventListener('change', () => this.handleFilterChange());
            });

            // ページ全体での動的要素対応
            document.addEventListener('click', (e) => this.handleGlobalClick(e));
        },

        /**
         * 検索インターフェースのセットアップ
         */
        setupSearchInterface() {
            // アーカイブページの検索フォームを統合検索に接続
            if (window.ArchiveManager) {
                console.log('🔗 アーカイブページ検索システムと連携');
                this.setupArchiveIntegration();
            }

            // フロントページの検索セクションと連携
            if (window.SearchSection) {
                console.log('🔗 検索セクションと連携');
                this.setupSectionIntegration();
            }

            // ローディング状態の初期化
            this.hideLoading();
        },

        /**
         * アーカイブページとの統合
         */
        setupArchiveIntegration() {
            if (!window.ArchiveManager) return;

            // アーカイブページの検索を統合システムに委譲
            const originalExecuteSearch = window.ArchiveManager.executeSearch;
            window.ArchiveManager.executeSearch = (...args) => {
                return this.executeSearch(...args);
            };
        },

        /**
         * 検索セクションとの統合
         */
        setupSectionIntegration() {
            if (!window.SearchSection) return;

            // 検索セクションの検索を統合システムに委譲
            const originalExecuteSearch = window.SearchSection.executeSearch;
            window.SearchSection.executeSearch = (...args) => {
                return this.executeSearch(...args);
            };
        },

        /**
         * フォーム送信処理
         */
        handleFormSubmit(e) {
            e.preventDefault();
            this.executeSearch();
        },

        /**
         * 検索ボタンクリック処理
         */
        handleSearchClick(e) {
            e.preventDefault();
            this.executeSearch();
        },

        /**
         * 検索入力処理
         */
        handleSearchInput(e) {
            const value = e.target.value.trim();
            
            // クリアボタンの表示制御
            if (this.elements.clearBtn) {
                this.elements.clearBtn.classList.toggle('hidden', !value);
            }

            // サジェスト表示
            if (value.length >= 2) {
                this.showSuggestions(value);
            } else {
                this.hideSuggestions();
            }
        },

        /**
         * フィルター変更処理
         */
        handleFilterChange() {
            // リアルタイム検索（デバウンス）
            if (this.filterChangeTimeout) {
                clearTimeout(this.filterChangeTimeout);
            }

            this.filterChangeTimeout = setTimeout(() => {
                this.executeSearch();
            }, this.config.debounceDelay);
        },

        /**
         * クイックフィルター処理
         */
        handleQuickFilter(e) {
            const filter = e.currentTarget;
            const filterType = filter.dataset.filter;

            // アクティブ状態の切り替え
            filter.classList.toggle('active');

            // フィルターの適用
            this.applyQuickFilterLogic(filterType, filter.classList.contains('active'));
            
            // 即座に検索実行
            this.executeSearch();
        },

        /**
         * クイックフィルターロジック
         */
        applyQuickFilterLogic(filterType, isActive) {
            switch (filterType) {
                case 'all':
                    if (isActive) {
                        this.resetFilters(false); // 検索は実行しない
                    }
                    break;
                case 'active':
                    if (this.elements.statusFilter) {
                        this.elements.statusFilter.value = isActive ? 'active' : '';
                    }
                    break;
                case 'upcoming':
                    if (this.elements.statusFilter) {
                        this.elements.statusFilter.value = isActive ? 'upcoming' : '';
                    }
                    break;
                case 'high-amount':
                    if (this.elements.amountFilter) {
                        this.elements.amountFilter.value = isActive ? '1000+' : '';
                    }
                    break;
                case 'easy':
                    if (this.elements.difficultyFilter) {
                        this.elements.difficultyFilter.value = isActive ? 'easy' : '';
                    }
                    break;
                case 'high-success':
                    if (this.elements.successRateFilter) {
                        this.elements.successRateFilter.value = isActive ? 'high' : '';
                    }
                    break;
            }
        },

        /**
         * グローバルクリック処理
         */
        handleGlobalClick(e) {
            // ページネーションボタン
            if (e.target.classList.contains('pagination-btn')) {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (page) {
                    this.executeSearch({ page });
                }
                return;
            }

            // お気に入りボタン
            if (e.target.closest('.favorite-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.favorite-btn');
                const postId = btn.dataset.postId;
                if (postId) {
                    this.toggleFavorite(postId);
                }
                return;
            }

            // サジェストアイテム
            if (e.target.closest('.suggestion-item')) {
                const item = e.target.closest('.suggestion-item');
                const value = item.dataset.value;
                if (value && this.elements.searchInput) {
                    this.elements.searchInput.value = value;
                    this.hideSuggestions();
                    this.executeSearch();
                }
                return;
            }
        },

        /**
         * 検索実行（メイン関数）
         */
        async executeSearch(options = {}) {
            if (this.state.isLoading) return;

            this.state.isLoading = true;
            this.showLoading();

            // 前回のリクエストをキャンセル
            if (this.state.requestController) {
                this.state.requestController.abort();
            }

            this.state.requestController = new AbortController();

            try {
                // 検索パラメータの構築
                const params = this.buildSearchParams(options);
                
                // キャッシュチェック
                const cacheKey = this.generateCacheKey(params);
                if (this.state.searchCache.has(cacheKey) && !options.forceRefresh) {
                    const cachedResult = this.state.searchCache.get(cacheKey);
                    this.displayResults(cachedResult);
                    return;
                }

                // AJAX検索実行
                const formData = new FormData();
                formData.append('action', 'gi_load_grants');
                formData.append('nonce', this.config.nonce);
                
                // パラメータを追加
                Object.keys(params).forEach(key => {
                    if (Array.isArray(params[key])) {
                        formData.append(key, JSON.stringify(params[key]));
                    } else {
                        formData.append(key, params[key]);
                    }
                });

                const response = await fetch(this.config.ajaxUrl, {
                    method: 'POST',
                    body: formData,
                    signal: this.state.requestController.signal
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    // キャッシュに保存
                    this.state.searchCache.set(cacheKey, data.data);
                    
                    // 結果表示
                    this.displayResults(data.data);
                    
                    // 状態更新
                    this.state.lastSearch = params;
                    this.state.searchResults = data.data.grants || [];

                    if (this.config.debug) {
                        console.log('🔍 検索成功:', data.data);
                    }
                } else {
                    throw new Error(data.data?.message || '検索に失敗しました');
                }

            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('❌ 検索エラー:', error);
                    this.showError(error.message || '検索中にエラーが発生しました');
                }
            } finally {
                this.state.isLoading = false;
                this.hideLoading();
                this.state.requestController = null;
            }
        },

        /**
         * 検索パラメータ構築
         */
        buildSearchParams(options = {}) {
            const params = {
                search: '',
                categories: [],
                prefectures: [],
                industries: [],
                amount: '',
                status: [],
                difficulty: [],
                success_rate: [],
                sort: 'date_desc',
                view: 'grid',
                page: 1,
                posts_per_page: 12,
                ...options
            };

            // フォームデータから値を取得
            const searchValue = this.getSearchValue();
            if (searchValue) {
                params.search = searchValue;
            }

            // フィルター値を取得
            if (this.elements.categoryFilter?.value) {
                params.categories = [this.elements.categoryFilter.value];
            }

            if (this.elements.prefectureFilter?.value) {
                params.prefectures = [this.elements.prefectureFilter.value];
            }

            if (this.elements.amountFilter?.value) {
                params.amount = this.elements.amountFilter.value;
            }

            if (this.elements.statusFilter?.value) {
                params.status = [this.elements.statusFilter.value];
            }

            if (this.elements.difficultyFilter?.value) {
                params.difficulty = [this.elements.difficultyFilter.value];
            }

            if (this.elements.successRateFilter?.value) {
                params.success_rate = [this.elements.successRateFilter.value];
            }

            // アーカイブページのフィルターも考慮
            if (window.ArchiveManager?.state) {
                const archiveFilters = window.ArchiveManager.state.filters;
                if (archiveFilters) {
                    Object.keys(archiveFilters).forEach(key => {
                        if (archiveFilters[key] && params.hasOwnProperty(key)) {
                            params[key] = archiveFilters[key];
                        }
                    });
                }
            }

            return params;
        },

        /**
         * 検索値取得
         */
        getSearchValue() {
            if (this.elements.searchInput?.value) {
                return this.elements.searchInput.value.trim();
            }
            if (this.elements.grantsSearchInput?.value) {
                return this.elements.grantsSearchInput.value.trim();
            }
            return '';
        },

        /**
         * キャッシュキー生成
         */
        generateCacheKey(params) {
            return JSON.stringify(params);
        },

        /**
         * 結果表示
         */
        displayResults(data) {
            // 結果カウント更新
            this.updateResultsCount(data.found_posts || 0);

            // グリッド表示
            if (this.elements.grantsContainer || this.elements.grantsGrid) {
                const container = this.elements.grantsContainer || this.elements.grantsGrid;
                this.renderGrantsGrid(container, data.grants || []);
            }

            // ページネーション更新
            if (this.elements.paginationContainer && data.pagination?.html) {
                this.elements.paginationContainer.innerHTML = data.pagination.html;
            }

            // プレビュー表示
            if (this.elements.resultsPreview && data.grants?.length > 0) {
                this.showPreview(data);
            }

            // 結果なし表示
            if (data.found_posts === 0) {
                this.showNoResults();
            }

            // アーカイブページの状態更新
            if (window.ArchiveManager?.displayResults) {
                window.ArchiveManager.displayResults(data);
            }
        },

        /**
         * 助成金グリッド描画
         */
        renderGrantsGrid(container, grants) {
            if (!container || !grants) return;

            let html = '';
            grants.forEach(grant => {
                if (grant.html) {
                    html += grant.html;
                } else if (grant.data) {
                    // フォールバック：データからHTMLを生成
                    html += this.generateGrantCard(grant.data);
                }
            });

            container.innerHTML = html;

            // カードアニメーション
            container.querySelectorAll('.grant-card-modern, .grant-card-ultimate').forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        },

        /**
         * 助成金カード生成（フォールバック用）
         */
        generateGrantCard(grantData) {
            const title = grantData.title || '助成金情報';
            const permalink = grantData.permalink || '#';
            const excerpt = grantData.excerpt || '';
            const amount = grantData.amount || '-';
            const deadline = grantData.deadline || '-';
            const status = grantData.status || '募集中';
            const category = grantData.main_category || '';
            const prefecture = grantData.prefecture || '';

            return `
                <div class="grant-card-modern w-full" data-grant-id="${grantData.id || ''}">
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden h-full flex flex-col">
                        <div class="px-4 pt-4 pb-3">
                            <div class="flex items-center justify-between mb-3">
                                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    <span class="w-1.5 h-1.5 bg-current rounded-full mr-1.5"></span>
                                    ${status}
                                </span>
                                <button class="favorite-btn text-gray-400 hover:text-red-500 transition-colors p-1" data-post-id="${grantData.id || ''}">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                </button>
                            </div>
                            
                            <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2">
                                <a href="${permalink}" class="hover:text-emerald-600 transition-colors">
                                    ${title}
                                </a>
                            </h3>
                        </div>
                        
                        <div class="px-4 pb-3 flex-grow">
                            <div class="flex items-center gap-2 mb-3 flex-wrap">
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                                    ${category}
                                </span>
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                    📍 ${prefecture}
                                </span>
                            </div>
                            
                            <div class="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 mb-3 border border-emerald-100">
                                <div class="text-xs text-gray-600 mb-1">最大助成額</div>
                                <div class="text-xl font-bold text-emerald-700">
                                    ${amount}
                                </div>
                            </div>
                            
                            <div class="text-xs text-gray-600 mb-2">締切: ${deadline}</div>
                            <p class="text-sm text-gray-600 line-clamp-2">${excerpt}</p>
                        </div>
                        
                        <div class="px-4 pb-4 pt-3 border-t border-gray-100 mt-auto">
                            <a href="${permalink}" class="block w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-center py-2 px-4 rounded-lg transition-all duration-200 text-sm font-medium">
                                詳細を見る
                            </a>
                        </div>
                    </div>
                </div>
            `;
        },

        /**
         * 結果カウント更新
         */
        updateResultsCount(count) {
            // 複数の結果表示要素に対応
            const countElements = [
                this.elements.resultsCount,
                document.querySelector('#results-count .count-number'),
                document.querySelector('.results-title .count-number'),
                this.elements.previewCount
            ].filter(Boolean);

            countElements.forEach(el => {
                if (el) {
                    el.textContent = count.toLocaleString();
                }
            });
        },

        /**
         * プレビュー表示
         */
        showPreview(data) {
            if (!this.elements.resultsPreview) return;

            this.elements.resultsPreview.classList.remove('hidden');
            
            if (this.elements.previewContent && data.grants) {
                const previewGrants = data.grants.slice(0, 6);
                let html = '';
                previewGrants.forEach(grant => {
                    html += grant.html || this.generateGrantCard(grant.data || grant);
                });
                this.elements.previewContent.innerHTML = html;
            }
        },

        /**
         * 結果なし表示
         */
        showNoResults() {
            const container = this.elements.grantsContainer || this.elements.grantsGrid;
            if (!container) return;

            container.innerHTML = `
                <div class="col-span-full text-center py-16">
                    <div class="max-w-md mx-auto">
                        <i class="fas fa-search text-6xl text-gray-300 mb-6"></i>
                        <h3 class="text-xl font-bold text-gray-900 mb-4">該当する助成金が見つかりませんでした</h3>
                        <p class="text-gray-600 mb-6">検索条件を変更して再度お試しください</p>
                        <button onclick="GISearchManager.resetFilters()" class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
                            検索条件をリセット
                        </button>
                    </div>
                </div>
            `;
        },

        /**
         * サジェスト表示
         */
        showSuggestions(keyword = '') {
            if (!this.elements.searchSuggestions) return;

            // サンプルサジェスト
            const suggestions = [
                { icon: 'fa-fire', text: 'IT導入補助金', type: '人気' },
                { icon: 'fa-cogs', text: 'ものづくり補助金', type: '人気' },
                { icon: 'fa-building', text: '事業再構築補助金', type: 'おすすめ' },
                { icon: 'fa-users', text: '小規模事業者持続化補助金', type: '簡単' },
                { icon: 'fa-laptop', text: 'DX推進', type: 'トレンド' }
            ];

            let html = '';
            suggestions.forEach(item => {
                html += `
                    <div class="suggestion-item cursor-pointer px-4 py-3 hover:bg-gray-50 flex items-center gap-3" data-value="${item.text}">
                        <i class="fas ${item.icon} text-gray-400"></i>
                        <span class="flex-1 text-gray-700">${item.text}</span>
                        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">${item.type}</span>
                    </div>
                `;
            });

            this.elements.searchSuggestions.innerHTML = html;
            this.elements.searchSuggestions.classList.remove('hidden');
        },

        /**
         * サジェスト非表示
         */
        hideSuggestions() {
            if (this.elements.searchSuggestions) {
                this.elements.searchSuggestions.classList.add('hidden');
            }
        },

        /**
         * 検索クリア
         */
        clearSearch() {
            // 検索入力をクリア
            [this.elements.searchInput, this.elements.grantsSearchInput].forEach(input => {
                if (input) {
                    input.value = '';
                }
            });

            // クリアボタンを非表示
            if (this.elements.clearBtn) {
                this.elements.clearBtn.classList.add('hidden');
            }

            // サジェスト非表示
            this.hideSuggestions();

            // プレビュー閉じる
            this.closePreview();

            // 検索実行
            this.executeSearch();
        },

        /**
         * フィルター適用
         */
        applyFilters() {
            this.executeSearch();
        },

        /**
         * フィルターリセット
         */
        resetFilters(executeSearch = true) {
            // 検索入力クリア
            this.clearSearch();

            // フィルター選択リセット
            const filterElements = [
                this.elements.categoryFilter,
                this.elements.prefectureFilter,
                this.elements.amountFilter,
                this.elements.statusFilter,
                this.elements.difficultyFilter,
                this.elements.successRateFilter
            ].filter(Boolean);

            filterElements.forEach(filter => {
                filter.value = '';
            });

            // クイックフィルターリセット
            this.elements.quickFilters?.forEach(filter => {
                filter.classList.remove('active');
            });

            // 検索実行
            if (executeSearch) {
                this.executeSearch();
            }
        },

        /**
         * プレビュー閉じる
         */
        closePreview() {
            if (this.elements.resultsPreview) {
                this.elements.resultsPreview.classList.add('hidden');
            }
        },

        /**
         * お気に入り切り替え
         */
        async toggleFavorite(postId) {
            try {
                const formData = new FormData();
                formData.append('action', 'gi_toggle_favorite');
                formData.append('nonce', this.config.nonce);
                formData.append('post_id', postId);

                const response = await fetch(this.config.ajaxUrl, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    // UI更新
                    const btn = document.querySelector(`.favorite-btn[data-post-id="${postId}"]`);
                    if (btn) {
                        const svg = btn.querySelector('svg');
                        if (data.data.is_favorite) {
                            svg.setAttribute('fill', 'currentColor');
                            btn.classList.add('text-red-500');
                        } else {
                            svg.setAttribute('fill', 'none');
                            btn.classList.remove('text-red-500');
                        }
                    }

                    this.showNotification(data.data.message, 'success');
                } else {
                    throw new Error(data.data?.message || 'エラーが発生しました');
                }
            } catch (error) {
                console.error('お気に入りエラー:', error);
                this.showNotification('お気に入りの更新に失敗しました', 'error');
            }
        },

        /**
         * ローディング表示
         */
        showLoading() {
            if (this.elements.loadingIndicator) {
                this.elements.loadingIndicator.classList.remove('hidden');
            }

            // 検索ボタンのローディング状態
            const searchButtons = [this.elements.searchBtn, this.elements.searchSubmitBtn].filter(Boolean);
            searchButtons.forEach(btn => {
                const btnText = btn.querySelector('.btn-text, .btn-content');
                const btnLoading = btn.querySelector('.btn-loading');
                
                if (btnText) btnText.classList.add('hidden');
                if (btnLoading) btnLoading.classList.remove('hidden');
                
                btn.disabled = true;
            });
        },

        /**
         * ローディング非表示
         */
        hideLoading() {
            if (this.elements.loadingIndicator) {
                this.elements.loadingIndicator.classList.add('hidden');
            }

            // 検索ボタンのローディング状態解除
            const searchButtons = [this.elements.searchBtn, this.elements.searchSubmitBtn].filter(Boolean);
            searchButtons.forEach(btn => {
                const btnText = btn.querySelector('.btn-text, .btn-content');
                const btnLoading = btn.querySelector('.btn-loading');
                
                if (btnText) btnText.classList.remove('hidden');
                if (btnLoading) btnLoading.classList.add('hidden');
                
                btn.disabled = false;
            });
        },

        /**
         * エラー表示
         */
        showError(message) {
            this.showNotification(message, 'error');
            
            const container = this.elements.grantsContainer || this.elements.grantsGrid;
            if (container) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-16">
                        <div class="max-w-md mx-auto">
                            <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-6"></i>
                            <h3 class="text-xl font-bold text-gray-900 mb-4">エラーが発生しました</h3>
                            <p class="text-gray-600 mb-6">${message}</p>
                            <button onclick="GISearchManager.executeSearch({ forceRefresh: true })" class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                再試行
                            </button>
                        </div>
                    </div>
                `;
            }
        },

        /**
         * 通知表示
         */
        showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `fixed bottom-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg text-white transform translate-x-full transition-transform duration-300`;

            const styles = {
                'success': 'bg-green-500',
                'error': 'bg-red-500',
                'warning': 'bg-yellow-500',
                'info': 'bg-blue-500'
            };

            notification.classList.add(styles[type] || styles['info']);

            const icons = {
                'success': 'fa-check-circle',
                'error': 'fa-exclamation-circle',
                'warning': 'fa-exclamation-triangle',
                'info': 'fa-info-circle'
            };

            notification.innerHTML = `
                <div class="flex items-center gap-3">
                    <i class="fas ${icons[type] || icons['info']}"></i>
                    <span>${message}</span>
                    <button class="ml-4 text-white/80 hover:text-white transition-colors">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;

            document.body.appendChild(notification);

            // クリックで閉じる
            notification.querySelector('button').addEventListener('click', () => {
                notification.classList.add('translate-x-full');
                setTimeout(() => notification.remove(), 300);
            });

            // 表示
            setTimeout(() => {
                notification.classList.remove('translate-x-full');
            }, 10);

            // 自動で閉じる
            setTimeout(() => {
                notification.classList.add('translate-x-full');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }, 5000);
        },

        /**
         * 保存したフィルター読み込み
         */
        loadSavedFilters() {
            // LocalStorageから保存したフィルターを読み込み
            try {
                const saved = localStorage.getItem('gi_saved_filters');
                if (saved) {
                    this.savedFilters = JSON.parse(saved);
                }
            } catch (e) {
                console.warn('保存したフィルターの読み込みに失敗:', e);
                this.savedFilters = [];
            }
        },

        /**
         * デバウンス関数
         */
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        /**
         * ユーティリティ: 要素の存在確認
         */
        elementExists(element) {
            return element !== null && element !== undefined;
        }
    };

    // グローバルに公開
    window.GISearchManager = GISearchManager;

    // 初期化実行
    GISearchManager.init();

    console.log('✅ 統合検索システム 準備完了');
});