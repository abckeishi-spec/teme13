/**
 * Legacy Bridge
 * 古いコードとの互換性を保つためのブリッジ
 * 
 * @version 7.0
 */

(function() {
    'use strict';

    console.log('Legacy Bridge: 初期化開始');

    // Grant Database Systemの初期化を確認
    if (typeof window.GrantDatabase === 'undefined') {
        console.warn('Legacy Bridge: GrantDatabaseが定義されていません');
        
        // フォールバック実装
        window.GrantDatabase = function() {
            this.init = function() {
                console.log('Grant Database: フォールバック実装で初期化');
            };
        };
    }

    // 古いAPIとの互換性
    window.initGrantSearch = function() {
        console.log('Legacy: initGrantSearch called');
        if (window.grantDB && typeof window.grantDB.init === 'function') {
            window.grantDB.init();
        } else {
            window.grantDB = new window.GrantDatabase();
        }
    };

    // 検索システムの互換性
    window.performGrantSearch = function(keyword, type, region) {
        console.log('Legacy: performGrantSearch called', { keyword, type, region });
        if (window.grantDB && typeof window.grantDB.performSearch === 'function') {
            window.grantDB.filters.keyword = keyword || '';
            window.grantDB.filters.type = type || '';
            window.grantDB.filters.region = region || '';
            window.grantDB.applyFilters();
        }
    };

    // jQueryとの互換性
    if (typeof jQuery !== 'undefined') {
        jQuery(document).ready(function($) {
            console.log('Legacy Bridge: jQuery ready');
            
            // 古い要素セレクタへの対応
            $('.grant-search-btn, #searchGrantBtn').on('click', function() {
                if (window.grantDB) {
                    window.grantDB.performSearch();
                }
            });
            
            // 古いフィルタへの対応
            $('#grantTypeSelect, .grant-type-select').on('change', function() {
                if (window.grantDB) {
                    window.grantDB.filters.type = $(this).val();
                    window.grantDB.applyFilters();
                }
            });
            
            $('#grantRegionSelect, .grant-region-select').on('change', function() {
                if (window.grantDB) {
                    window.grantDB.filters.region = $(this).val();
                    window.grantDB.applyFilters();
                }
            });
        });
    }

    // DOMContentLoaded イベント
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Legacy Bridge: DOMContentLoaded');
            initializeLegacyComponents();
        });
    } else {
        // 既にDOMが読み込まれている場合
        initializeLegacyComponents();
    }

    function initializeLegacyComponents() {
        console.log('Legacy Bridge: コンポーネント初期化');
        
        // 古いフォーム要素の確認
        const oldSearchForm = document.getElementById('grantSearchForm');
        if (oldSearchForm && !oldSearchForm.hasAttribute('data-initialized')) {
            oldSearchForm.setAttribute('data-initialized', 'true');
            oldSearchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                if (window.grantDB) {
                    window.grantDB.performSearch();
                }
            });
        }

        // 古いボタンの確認
        const oldButtons = document.querySelectorAll('.search-grant, .btn-grant-search');
        oldButtons.forEach(function(button) {
            if (!button.hasAttribute('data-initialized')) {
                button.setAttribute('data-initialized', 'true');
                button.addEventListener('click', function() {
                    if (window.grantDB) {
                        window.grantDB.performSearch();
                    }
                });
            }
        });

        // レガシーデータの移行
        if (typeof window.grantsData !== 'undefined') {
            console.log('Legacy Bridge: レガシーデータを検出');
            window.grantData = window.grantData || {};
            window.grantData.grants = window.grantsData;
        }
    }

    // グローバル変数のエイリアス
    window.GD = window.GrantDatabase;
    window.grantDatabase = window.GrantDatabase;

    console.log('Legacy Bridge: 初期化完了');

})();