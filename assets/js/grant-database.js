/**
 * Grant Database System
 * 助成金・補助金データベース管理システム
 * 
 * @version 7.0
 */

(function() {
    'use strict';

    // Grant Database Class
    class GrantDatabase {
        constructor() {
            this.grants = [];
            this.filters = {
                type: '',
                region: '',
                keyword: ''
            };
            this.isInitialized = false;
            this.init();
        }

        // 初期化
        init() {
            console.log('Grant Database System: 初期化開始');
            
            // DOMContentLoaded後に初期化
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
            } else {
                this.setupEventListeners();
            }

            // データの読み込み
            this.loadGrants();
            
            this.isInitialized = true;
            console.log('Grant Database System: 初期化完了');
        }

        // イベントリスナーの設定
        setupEventListeners() {
            // 検索フォームのイベント
            const searchForm = document.querySelector('.grant-search-form');
            if (searchForm) {
                searchForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.performSearch();
                });
            }

            // フィルターのイベント
            const typeFilter = document.getElementById('grant-type-filter');
            if (typeFilter) {
                typeFilter.addEventListener('change', (e) => {
                    this.filters.type = e.target.value;
                    this.applyFilters();
                });
            }

            const regionFilter = document.getElementById('grant-region-filter');
            if (regionFilter) {
                regionFilter.addEventListener('change', (e) => {
                    this.filters.region = e.target.value;
                    this.applyFilters();
                });
            }

            // 検索ボタン
            const searchButton = document.querySelector('.grant-search-button');
            if (searchButton) {
                searchButton.addEventListener('click', () => this.performSearch());
            }

            // クリアボタン
            const clearButton = document.querySelector('.grant-clear-button');
            if (clearButton) {
                clearButton.addEventListener('click', () => this.clearFilters());
            }
        }

        // 助成金データの読み込み
        loadGrants() {
            // WordPressのREST APIまたはAjaxを使用してデータを取得
            if (typeof grantData !== 'undefined' && grantData.grants) {
                this.grants = grantData.grants;
                this.displayGrants();
            } else {
                // フォールバック: サンプルデータ
                this.grants = this.getSampleGrants();
                this.displayGrants();
            }
        }

        // サンプルデータ
        getSampleGrants() {
            return [
                {
                    id: 1,
                    title: '中小企業デジタル化支援助成金',
                    description: 'デジタルツール導入による業務効率化を支援',
                    type: '助成金',
                    region: '全国',
                    amount: '最大500万円',
                    deadline: '2025-03-31',
                    organization: '経済産業省'
                },
                {
                    id: 2,
                    title: '地域活性化補助金',
                    description: '地域経済の活性化に資する事業への補助',
                    type: '補助金',
                    region: '全国',
                    amount: '最大1000万円',
                    deadline: '2025-02-28',
                    organization: '総務省'
                },
                {
                    id: 3,
                    title: 'スタートアップ支援補助金',
                    description: '新規創業・起業を支援する補助金',
                    type: '補助金',
                    region: '関東',
                    amount: '最大200万円',
                    deadline: '2025-01-31',
                    organization: '中小企業庁'
                },
                {
                    id: 4,
                    title: '環境保全活動助成金',
                    description: '環境保全・省エネルギー活動への支援',
                    type: '助成金',
                    region: '全国',
                    amount: '最大300万円',
                    deadline: '2025-04-30',
                    organization: '環境省'
                },
                {
                    id: 5,
                    title: '農業イノベーション助成金',
                    description: 'スマート農業技術導入支援',
                    type: '助成金',
                    region: '全国',
                    amount: '最大800万円',
                    deadline: '2025-05-31',
                    organization: '農林水産省'
                }
            ];
        }

        // 助成金の表示
        displayGrants(grantsToDisplay = null) {
            const container = document.querySelector('.grant-results-container, #grant-results');
            if (!container) return;

            const grants = grantsToDisplay || this.grants;
            
            if (grants.length === 0) {
                container.innerHTML = '<p class="no-results">該当する助成金・補助金が見つかりませんでした。</p>';
                return;
            }

            let html = '<div class="grant-list">';
            grants.forEach(grant => {
                html += this.createGrantCard(grant);
            });
            html += '</div>';
            
            container.innerHTML = html;
            
            // カードのクリックイベント
            this.attachCardEvents();
        }

        // 助成金カードの作成
        createGrantCard(grant) {
            return `
                <div class="grant-card" data-grant-id="${grant.id}">
                    <div class="grant-card-header">
                        <h3 class="grant-title">${grant.title}</h3>
                        <span class="grant-type grant-type-${grant.type === '助成金' ? 'joseikin' : 'hojokin'}">
                            ${grant.type}
                        </span>
                    </div>
                    <div class="grant-card-body">
                        <p class="grant-description">${grant.description}</p>
                        <div class="grant-meta">
                            <span class="grant-amount">
                                <i class="icon-yen"></i> ${grant.amount}
                            </span>
                            <span class="grant-region">
                                <i class="icon-map"></i> ${grant.region}
                            </span>
                            <span class="grant-deadline">
                                <i class="icon-calendar"></i> 締切: ${grant.deadline}
                            </span>
                        </div>
                        <div class="grant-organization">
                            <i class="icon-building"></i> ${grant.organization}
                        </div>
                    </div>
                    <div class="grant-card-footer">
                        <button class="grant-detail-button" data-grant-id="${grant.id}">
                            詳細を見る
                        </button>
                    </div>
                </div>
            `;
        }

        // カードイベントの設定
        attachCardEvents() {
            document.querySelectorAll('.grant-detail-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const grantId = e.target.dataset.grantId;
                    this.showGrantDetail(grantId);
                });
            });
        }

        // 詳細表示
        showGrantDetail(grantId) {
            const grant = this.grants.find(g => g.id == grantId);
            if (!grant) return;

            // モーダルまたは詳細ページへの遷移
            if (typeof jQuery !== 'undefined') {
                // jQueryが使用可能な場合
                jQuery('#grant-detail-modal').remove();
                const modal = `
                    <div id="grant-detail-modal" class="modal">
                        <div class="modal-content">
                            <span class="modal-close">&times;</span>
                            <h2>${grant.title}</h2>
                            <div class="modal-body">
                                <p>${grant.description}</p>
                                <dl>
                                    <dt>種類</dt><dd>${grant.type}</dd>
                                    <dt>金額</dt><dd>${grant.amount}</dd>
                                    <dt>対象地域</dt><dd>${grant.region}</dd>
                                    <dt>締切</dt><dd>${grant.deadline}</dd>
                                    <dt>実施機関</dt><dd>${grant.organization}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                `;
                jQuery('body').append(modal);
                jQuery('#grant-detail-modal').fadeIn();
                jQuery('.modal-close').on('click', function() {
                    jQuery('#grant-detail-modal').fadeOut(function() {
                        jQuery(this).remove();
                    });
                });
            } else {
                // jQueryが使用できない場合はアラート
                alert(`${grant.title}\n\n${grant.description}\n\n金額: ${grant.amount}\n地域: ${grant.region}\n締切: ${grant.deadline}`);
            }
        }

        // 検索実行
        performSearch() {
            const searchInput = document.querySelector('.grant-search-input, #grant-search-keyword');
            if (searchInput) {
                this.filters.keyword = searchInput.value.toLowerCase();
            }
            this.applyFilters();
        }

        // フィルター適用
        applyFilters() {
            let filteredGrants = this.grants;

            // タイプフィルター
            if (this.filters.type) {
                filteredGrants = filteredGrants.filter(grant => grant.type === this.filters.type);
            }

            // 地域フィルター
            if (this.filters.region) {
                filteredGrants = filteredGrants.filter(grant => grant.region === this.filters.region);
            }

            // キーワード検索
            if (this.filters.keyword) {
                filteredGrants = filteredGrants.filter(grant => 
                    grant.title.toLowerCase().includes(this.filters.keyword) ||
                    grant.description.toLowerCase().includes(this.filters.keyword) ||
                    grant.organization.toLowerCase().includes(this.filters.keyword)
                );
            }

            this.displayGrants(filteredGrants);
        }

        // フィルタークリア
        clearFilters() {
            this.filters = {
                type: '',
                region: '',
                keyword: ''
            };
            
            // フォームのリセット
            const typeFilter = document.getElementById('grant-type-filter');
            if (typeFilter) typeFilter.value = '';
            
            const regionFilter = document.getElementById('grant-region-filter');
            if (regionFilter) regionFilter.value = '';
            
            const searchInput = document.querySelector('.grant-search-input, #grant-search-keyword');
            if (searchInput) searchInput.value = '';
            
            this.displayGrants();
        }
    }

    // グローバルに公開
    window.GrantDatabase = GrantDatabase;
    
    // 自動初期化
    if (typeof grantDatabaseAutoInit === 'undefined' || grantDatabaseAutoInit !== false) {
        window.grantDB = new GrantDatabase();
    }

})();