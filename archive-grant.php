
<?php
/**
 * Grant Archive Template - Complete Version
 * 助成金・補助金アーカイブページ完全版
 * 
 * @package Grant_Insight_Complete
 * @version 8.0.0-complete
 */

// セキュリティチェック
if (!defined('ABSPATH')) {
    exit;
}

// URLパラメータから検索条件を取得
$search_params = array(
    'search' => sanitize_text_field($_GET['search'] ?? ''),
    'category' => sanitize_text_field($_GET['category'] ?? ''),
    'prefecture' => sanitize_text_field($_GET['prefecture'] ?? ''),
    'industry' => sanitize_text_field($_GET['industry'] ?? ''),
    'amount' => sanitize_text_field($_GET['amount'] ?? ''),
    'status' => sanitize_text_field($_GET['status'] ?? ''),
    'difficulty' => sanitize_text_field($_GET['difficulty'] ?? ''),
    'success_rate' => sanitize_text_field($_GET['success_rate'] ?? ''),
    'orderby' => sanitize_text_field($_GET['orderby'] ?? 'date_desc'),
    'view' => sanitize_text_field($_GET['view'] ?? 'grid'),
    'page' => max(1, intval($_GET['page'] ?? 1))
);

// カテゴリと都道府県の取得
$grant_categories = get_terms(array(
    'taxonomy' => 'grant_category',
    'hide_empty' => false,
    'orderby' => 'count',
    'order' => 'DESC'
));

if (is_wp_error($grant_categories)) {
    $grant_categories = array();
}

$grant_prefectures = get_terms(array(
    'taxonomy' => 'grant_prefecture', 
    'hide_empty' => false,
    'orderby' => 'name',
    'order' => 'ASC'
));

if (is_wp_error($grant_prefectures)) {
    $grant_prefectures = array();
}

$grant_industries = get_terms(array(
    'taxonomy' => 'grant_industry',
    'hide_empty' => false,
    'orderby' => 'name',
    'order' => 'ASC'
));

if (is_wp_error($grant_industries)) {
    $grant_industries = array();
}

get_header(); 
?>

<!-- 外部ライブラリ -->
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- 統合検索対応アーカイブページ -->
<div id="grant-archive-page" class="grant-archive-complete" data-search-params='<?php echo json_encode($search_params); ?>'>
    
    <!-- ヒーローセクション -->
    <section class="hero-section bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 py-16">
        <div class="container mx-auto px-4">
            <div class="text-center max-w-4xl mx-auto">
                <div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-bold mb-6 shadow-lg">
                    <i class="fas fa-database"></i>
                    <span>Grant Database System</span>
                </div>
                
                <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    <span class="block">助成金・補助金</span>
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                        完全データベース
                    </span>
                </h1>
                
                <p class="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    <?php if (!empty($search_params['search'])): ?>
                        <span class="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-md">
                            <i class="fas fa-search text-indigo-600"></i>
                            「<span class="font-bold text-gray-900 dark:text-white"><?php echo esc_html($search_params['search']); ?></span>」の検索結果
                        </span>
                    <?php else: ?>
                        全国の助成金から、あなたのビジネスに最適な支援制度をご提案
                    <?php endif; ?>
                </p>
                
                <!-- 統計情報（総支援額を削除） -->
                <div class="flex justify-center gap-8 text-sm">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-indigo-600" id="total-grants-count">0</div>
                        <div class="text-gray-600 dark:text-gray-400">登録助成金</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600" id="active-grants-count">0</div>
                        <div class="text-gray-600 dark:text-gray-400">募集中</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 検索・フィルターバー -->
    <section class="search-filter-bar sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div class="container mx-auto px-4 py-4">
            <!-- メイン検索バー -->
            <div class="search-container">
                <div class="flex flex-col lg:flex-row gap-4">
                    <!-- 検索入力 -->
                    <div class="flex-1">
                        <div class="search-input-group relative">
                            <div class="search-input-wrapper relative">
                                <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                <!-- 🔥 アーカイブ検索入力（統一ターゲット属性付き） -->
                                <input 
                                    type="text" 
                                    id="gi-search-input-archive"
                                    data-unified-target="gi-search-input-unified-main"
                                    class="gi-search-input search-input w-full pl-12 pr-32 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                    placeholder="キーワード、業種、地域などで検索..."
                                    value="<?php echo esc_attr($search_params['search']); ?>"
                                    autocomplete="off"
                                >
                                <div class="search-actions absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                    <button 
                                        id="gi-clear-btn-archive" 
                                        data-unified-target="gi-clear-btn-unified-main"
                                        class="gi-clear-button search-action-btn w-8 h-8 bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center transition-all <?php echo empty($search_params['search']) ? 'hidden' : ''; ?>"
                                        title="クリア"
                                    >
                                        <i class="fas fa-times text-sm"></i>
                                    </button>
                                    <button 
                                        id="gi-voice-btn-archive" 
                                        data-unified-target="gi-voice-btn-unified-main"
                                        class="gi-voice-button search-action-btn w-8 h-8 bg-gray-100 hover:bg-blue-100 text-gray-400 hover:text-blue-500 rounded-full flex items-center justify-center transition-all"
                                        title="音声検索"
                                    >
                                        <i class="fas fa-microphone text-sm"></i>
                                    </button>
                                </div>
                            </div>
                            <!-- アーカイブ検索サジェスト（統一ターゲット属性付き） -->
                            <div id="gi-suggestions-archive" 
                                 data-unified-target="gi-suggestions-unified-main"
                                 class="search-suggestions absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto hidden">
                                <!-- 動的に生成 -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- アーカイブ検索ボタン（統一ターゲット属性付き） -->
                    <button 
                        id="gi-search-btn-archive" 
                        data-unified-target="gi-search-btn-unified-main"
                        class="search-button px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl transition-all transform hover:scale-105 shadow-lg"
                    >
                        <span class="btn-content flex items-center">
                            <i class="fas fa-search mr-2"></i>
                            検索
                        </span>
                        <span class="btn-loading hidden flex items-center">
                            <i class="fas fa-spinner animate-spin mr-2"></i>
                            検索中
                        </span>
                    </button>
                </div>

                <!-- クイックフィルター -->
                <div class="quick-filters mt-4">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">
                            <i class="fas fa-filter mr-1"></i>
                            クイック:
                        </span>
                        <button 
                            class="quick-filter-pill inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm hover:bg-indigo-50 hover:border-indigo-300 transition-all <?php echo empty($search_params['status']) ? 'active bg-indigo-100 border-indigo-300' : ''; ?>"
                            data-filter="all"
                        >
                            <i class="fas fa-globe text-xs"></i>
                            すべて
                        </button>
                        <button 
                            class="quick-filter-pill inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm hover:bg-green-50 hover:border-green-300 transition-all <?php echo $search_params['status'] === 'active' ? 'active bg-green-100 border-green-300' : ''; ?>"
                            data-filter="active"
                        >
                            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            募集中
                        </button>
                        <button 
                            class="quick-filter-pill inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm hover:bg-yellow-50 hover:border-yellow-300 transition-all <?php echo $search_params['status'] === 'upcoming' ? 'active bg-yellow-100 border-yellow-300' : ''; ?>"
                            data-filter="upcoming"
                        >
                            <span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
                            募集予定
                        </button>
                        <button 
                            class="quick-filter-pill inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm hover:bg-yellow-50 hover:border-yellow-300 transition-all"
                            data-filter="high-amount"
                        >
                            <i class="fas fa-coins text-yellow-500 text-xs"></i>
                            高額補助
                        </button>
                        <button 
                            class="quick-filter-pill inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm hover:bg-blue-50 hover:border-blue-300 transition-all"
                            data-filter="easy"
                        >
                            <i class="fas fa-star text-blue-500 text-xs"></i>
                            申請簡単
                        </button>
                        <button 
                            class="quick-filter-pill inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm hover:bg-purple-50 hover:border-purple-300 transition-all"
                            data-filter="high-success"
                        >
                            <i class="fas fa-trophy text-purple-500 text-xs"></i>
                            高採択率
                        </button>
                        <button 
                            class="quick-filter-pill inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm hover:bg-red-50 hover:border-red-300 transition-all"
                            data-filter="deadline-soon"
                        >
                            <i class="fas fa-clock text-red-500 text-xs"></i>
                            締切間近
                        </button>
                    </div>
                </div>

                <!-- コントロールバー -->
                <div class="control-bar mt-4">
                    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div class="flex items-center gap-3 w-full md:w-auto">
                            <!-- ソート -->
                            <div class="control-group flex items-center gap-2">
                                <label class="control-label text-sm font-medium text-gray-600 flex items-center gap-1">
                                    <i class="fas fa-sort text-xs"></i>
                                    並び順:
                                </label>
                                <select 
                                    id="sort-order" 
                                    class="control-select border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none"
                                >
                                    <option value="date_desc" <?php selected($search_params['orderby'], 'date_desc'); ?>>新着順</option>
                                    <option value="date_asc" <?php selected($search_params['orderby'], 'date_asc'); ?>>古い順</option>
                                    <option value="amount_desc" <?php selected($search_params['orderby'], 'amount_desc'); ?>>金額が高い順</option>
                                    <option value="amount_asc" <?php selected($search_params['orderby'], 'amount_asc'); ?>>金額が低い順</option>
                                    <option value="deadline_asc" <?php selected($search_params['orderby'], 'deadline_asc'); ?>>締切が近い順</option>
                                    <option value="success_rate_desc" <?php selected($search_params['orderby'], 'success_rate_desc'); ?>>採択率順</option>
                                    <option value="popularity" <?php selected($search_params['orderby'], 'popularity'); ?>>人気順</option>
                                    <option value="title_asc" <?php selected($search_params['orderby'], 'title_asc'); ?>>名前順</option>
                                </select>
                            </div>

                            <!-- 表示件数 -->
                            <div class="control-group flex items-center gap-2">
                                <label class="control-label text-sm font-medium text-gray-600">
                                    表示:
                                </label>
                                <select 
                                    id="per-page" 
                                    class="control-select border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none"
                                >
                                    <option value="12">12件</option>
                                    <option value="24">24件</option>
                                    <option value="48">48件</option>
                                    <option value="96">96件</option>
                                </select>
                            </div>

                            <!-- 詳細フィルター -->
                            <button 
                                id="filter-toggle" 
                                class="filter-toggle-btn flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                            >
                                <i class="fas fa-sliders-h text-xs"></i>
                                詳細フィルター
                                <span id="filter-count" class="filter-badge hidden bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">0</span>
                            </button>

                            <!-- 保存した検索 -->
                            <button 
                                id="saved-search-toggle" 
                                class="saved-search-btn flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                            >
                                <i class="fas fa-bookmark text-xs"></i>
                                保存した検索
                            </button>
                        </div>

                        <div class="flex items-center gap-3">
                            <!-- 表示切替 -->
                            <div class="view-switcher flex bg-gray-100 rounded-lg p-1">
                                <button 
                                    id="grid-view" 
                                    class="view-btn px-3 py-2 rounded-md transition-all <?php echo $search_params['view'] === 'grid' ? 'active bg-white shadow' : 'text-gray-500 hover:text-gray-700'; ?>"
                                    data-view="grid"
                                    title="グリッド表示"
                                >
                                    <i class="fas fa-th text-sm"></i>
                                </button>
                                <button 
                                    id="list-view" 
                                    class="view-btn px-3 py-2 rounded-md transition-all <?php echo $search_params['view'] === 'list' ? 'active bg-white shadow' : 'text-gray-500 hover:text-gray-700'; ?>"
                                    data-view="list"
                                    title="リスト表示"
                                >
                                    <i class="fas fa-list text-sm"></i>
                                </button>
                                <button 
                                    id="compact-view" 
                                    class="view-btn px-3 py-2 rounded-md transition-all <?php echo $search_params['view'] === 'compact' ? 'active bg-white shadow' : 'text-gray-500 hover:text-gray-700'; ?>"
                                    data-view="compact"
                                    title="コンパクト表示"
                                >
                                    <i class="fas fa-bars text-sm"></i>
                                </button>
                            </div>

                            <!-- エクスポート -->
                            <div class="dropdown relative">
                                <button 
                                    id="export-toggle" 
                                    class="export-btn flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                                >
                                    <i class="fas fa-download text-xs"></i>
                                    エクスポート
                                </button>
                                <div id="export-menu" class="dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden">
                                    <button class="export-option w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2" data-format="csv">
                                        <i class="fas fa-file-csv text-green-600"></i>
                                        CSVファイル
                                    </button>
                                    <button class="export-option w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2" data-format="excel">
                                        <i class="fas fa-file-excel text-green-700"></i>
                                        Excelファイル
                                    </button>
                                    <button class="export-option w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2" data-format="pdf">
                                        <i class="fas fa-file-pdf text-red-600"></i>
                                        PDFファイル
                                    </button>
                                    <button class="export-option w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2" data-format="json">
                                        <i class="fas fa-code text-blue-600"></i>
                                        JSONファイル
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- メインコンテンツエリア -->
    <section class="main-content bg-gray-50 dark:bg-gray-900 py-8">
        <div class="container mx-auto px-4">
            <div class="flex flex-col lg:flex-row gap-8">
                
                <!-- サイドバーフィルター -->
                <aside id="filter-sidebar" class="lg:w-80 hidden lg:block">
                    <div class="filter-container bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
                        <!-- フィルターヘッダー -->
                        <div class="filter-header flex justify-between items-center mb-6">
                            <h3 class="filter-title text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <i class="fas fa-sliders-h text-indigo-600"></i>
                                詳細フィルター
                            </h3>
                            <button id="reset-all-filters" class="reset-filters-btn text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors">
                                <i class="fas fa-undo text-xs"></i>
                                リセット
                            </button>
                        </div>

                        <!-- カテゴリフィルター -->
                        <div class="filter-section mb-6">
                            <div class="filter-section-header flex justify-between items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50" data-toggle="categories">
                                <h4 class="filter-section-title text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <i class="fas fa-folder text-xs"></i>
                                    カテゴリ
                                </h4>
                                <i class="fas fa-chevron-down toggle-icon text-xs text-gray-400 transition-transform"></i>
                            </div>
                            <div id="categories-content" class="filter-section-content mt-3">
                                <div class="filter-search mb-3">
                                    <input 
                                        type="text" 
                                        placeholder="カテゴリを検索..." 
                                        class="filter-search-input w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none"
                                        data-filter="categories"
                                    >
                                </div>
                                <div class="filter-items max-h-48 overflow-y-auto space-y-1">
                                    <?php if (!empty($grant_categories)): ?>
                                        <?php foreach ($grant_categories as $category): ?>
                                            <label class="filter-item flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    name="category[]" 
                                                    value="<?php echo esc_attr($category->slug); ?>"
                                                    data-label="<?php echo esc_attr($category->name); ?>"
                                                    class="filter-checkbox category-checkbox w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                    <?php checked($search_params['category'], $category->slug); ?>
                                                >
                                                <span class="filter-item-content flex justify-between items-center flex-1 ml-3">
                                                    <span class="filter-item-label text-sm text-gray-700">
                                                        <?php echo esc_html($category->name); ?>
                                                    </span>
                                                    <span class="filter-item-count text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                                        <?php echo $category->count; ?>
                                                    </span>
                                                </span>
                                            </label>
                                        <?php endforeach; ?>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>

                        <!-- 地域フィルター -->
                        <div class="filter-section mb-6">
                            <div class="filter-section-header flex justify-between items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50" data-toggle="prefectures">
                                <h4 class="filter-section-title text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <i class="fas fa-map-marked-alt text-xs"></i>
                                    対象地域
                                </h4>
                                <i class="fas fa-chevron-down toggle-icon text-xs text-gray-400 transition-transform"></i>
                            </div>
                            <div id="prefectures-content" class="filter-section-content mt-3">
                                <!-- 地域タブ -->
                                <div class="region-tabs flex flex-wrap gap-1 mb-3">
                                    <button class="region-tab text-xs px-2 py-1 rounded bg-gray-100 hover:bg-indigo-100 transition-colors" data-region="all">全国</button>
                                    <button class="region-tab text-xs px-2 py-1 rounded bg-gray-100 hover:bg-indigo-100 transition-colors" data-region="hokkaido-tohoku">北海道・東北</button>
                                    <button class="region-tab text-xs px-2 py-1 rounded bg-gray-100 hover:bg-indigo-100 transition-colors" data-region="kanto">関東</button>
                                    <button class="region-tab text-xs px-2 py-1 rounded bg-gray-100 hover:bg-indigo-100 transition-colors" data-region="chubu">中部</button>
                                    <button class="region-tab text-xs px-2 py-1 rounded bg-gray-100 hover:bg-indigo-100 transition-colors" data-region="kinki">近畿</button>
                                    <button class="region-tab text-xs px-2 py-1 rounded bg-gray-100 hover:bg-indigo-100 transition-colors" data-region="chugoku-shikoku">中国・四国</button>
                                    <button class="region-tab text-xs px-2 py-1 rounded bg-gray-100 hover:bg-indigo-100 transition-colors" data-region="kyushu">九州</button>
                                </div>
                                <div class="filter-search mb-3">
                                    <input 
                                        type="text" 
                                        placeholder="地域を検索..." 
                                        class="filter-search-input w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none"
                                        data-filter="prefectures"
                                    >
                                </div>
                                <div class="filter-items max-h-48 overflow-y-auto space-y-1">
                                    <?php if (!empty($grant_prefectures)): ?>
                                        <?php foreach ($grant_prefectures as $prefecture): ?>
                                            <label class="filter-item flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer" data-prefecture="<?php echo esc_attr($prefecture->slug); ?>">
                                                <input 
                                                    type="checkbox" 
                                                    name="prefecture[]" 
                                                    value="<?php echo esc_attr($prefecture->slug); ?>"
                                                    data-label="<?php echo esc_attr($prefecture->name); ?>"
                                                    class="filter-checkbox prefecture-checkbox w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                    <?php checked($search_params['prefecture'], $prefecture->slug); ?>
                                                >
                                                <span class="filter-item-content flex justify-between items-center flex-1 ml-3">
                                                    <span class="filter-item-label text-sm text-gray-700">
                                                        <?php echo esc_html($prefecture->name); ?>
                                                    </span>
                                                    <span class="filter-item-count text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                                        <?php echo $prefecture->count; ?>
                                                    </span>
                                                </span>
                                            </label>
                                        <?php endforeach; ?>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>

                        <!-- 業種フィルター -->
                        <div class="filter-section mb-6">
                            <div class="filter-section-header flex justify-between items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50" data-toggle="industries">
                                <h4 class="filter-section-title text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <i class="fas fa-building text-xs"></i>
                                    対象業種
                                </h4>
                                <i class="fas fa-chevron-down toggle-icon text-xs text-gray-400 transition-transform"></i>
                            </div>
                            <div id="industries-content" class="filter-section-content mt-3 hidden">
                                <div class="filter-items max-h-48 overflow-y-auto space-y-1">
                                    <?php if (!empty($grant_industries)): ?>
                                        <?php foreach ($grant_industries as $industry): ?>
                                            <label class="filter-item flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    name="industry[]" 
                                                    value="<?php echo esc_attr($industry->slug); ?>"
                                                    data-label="<?php echo esc_attr($industry->name); ?>"
                                                    class="filter-checkbox industry-checkbox w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                    <?php checked($search_params['industry'], $industry->slug); ?>
                                                >
                                                <span class="filter-item-content flex justify-between items-center flex-1 ml-3">
                                                    <span class="filter-item-label text-sm text-gray-700">
                                                        <?php echo esc_html($industry->name); ?>
                                                    </span>
                                                    <span class="filter-item-count text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                                        <?php echo $industry->count; ?>
                                                    </span>
                                                </span>
                                            </label>
                                        <?php endforeach; ?>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>

                        <!-- 金額フィルター -->
                        <div class="filter-section mb-6">
                            <div class="filter-section-header flex justify-between items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50" data-toggle="amount">
                                <h4 class="filter-section-title text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <i class="fas fa-yen-sign text-xs"></i>
                                    助成金額
                                </h4>
                                <i class="fas fa-chevron-down toggle-icon text-xs text-gray-400 transition-transform"></i>
                            </div>
                            <div id="amount-content" class="filter-section-content mt-3">
                                <div class="filter-items space-y-2">
                                    <label class="filter-item flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input type="radio" name="amount" value="" class="filter-radio w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" <?php checked($search_params['amount'], ''); ?>>
                                        <span class="filter-item-label ml-3 text-sm text-gray-700">すべて</span>
                                    </label>
                                    <label class="filter-item flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input type="radio" name="amount" value="0-100" class="filter-radio w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" <?php checked($search_params['amount'], '0-100'); ?>>
                                        <span class="filter-item-label ml-3 text-sm text-gray-700">〜100万円</span>
                                    </label>
                                    <label class="filter-item flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input type="radio" name="amount" value="100-500" class="filter-radio w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" <?php checked($search_params['amount'], '100-500'); ?>>
                                        <span class="filter-item-label ml-3 text-sm text-gray-700">100〜500万円</span>
                                    </label>
                                    <label class="filter-item flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input type="radio" name="amount" value="500-1000" class="filter-radio w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" <?php checked($search_params['amount'], '500-1000'); ?>>
                                        <span class="filter-item-label ml-3 text-sm text-gray-700">500〜1000万円</span>
                                    </label>
                                    <label class="filter-item flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input type="radio" name="amount" value="1000+" class="filter-radio w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" <?php checked($search_params['amount'], '1000+'); ?>>
                                        <span class="filter-item-label ml-3 text-sm text-gray-700">1000万円〜</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- ステータスフィルター -->
                        <div class="filter-section mb-6">
                            <div class="filter-section-header flex justify-between items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50" data-toggle="status">
                                <h4 class="filter-section-title text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <i class="fas fa-info-circle text-xs"></i>
                                    募集状況
                                </h4>
                                <i class="fas fa-chevron-down toggle-icon text-xs text-gray-400 transition-transform"></i>
                            </div>
                            <div id="status-content" class="filter-section-content mt-3">
                                <div class="filter-items space-y-2">
                                    <label class="filter-item flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            name="status[]" 
                                            value="active" 
                                            class="filter-checkbox status-checkbox w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            <?php checked($search_params['status'], 'active'); ?>
                                        >
                                        <span class="filter-item-content flex items-center gap-3 ml-3">
                                            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                            <span class="filter-item-label text-sm text-gray-700">募集中</span>
                                        </span>
                                    </label>
                                    <label class="filter-item flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            name="status[]" 
                                            value="upcoming" 
                                            class="filter-checkbox status-checkbox w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            <?php checked($search_params['status'], 'upcoming'); ?>
                                        >
                                        <span class="filter-item-content flex items-center gap-3 ml-3">
                                            <span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                            <span class="filter-item-label text-sm text-gray-700">募集予定</span>
                                        </span>
                                    </label>
                                    <label class="filter-item flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            name="status[]" 
                                            value="closed" 
                                            class="filter-checkbox status-checkbox w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            <?php checked($search_params['status'], 'closed'); ?>
                                        >
                                        <span class="filter-item-content flex items-center gap-3 ml-3">
                                            <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
                                            <span class="filter-item-label text-sm text-gray-700">募集終了</span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- フィルターアクション -->
                        <div class="filter-actions flex gap-3">
                            <button 
                                id="apply-filters" 
                                class="apply-filters-btn flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                            >
                                <i class="fas fa-check mr-2"></i>
                                フィルター適用
                            </button>
                            <button 
                                id="save-filter" 
                                class="save-filter-btn px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
                                title="検索条件を保存"
                            >
                                <i class="fas fa-bookmark"></i>
                            </button>
                        </div>
                    </div>
                </aside>

                <!-- メインコンテンツ -->
                <main class="flex-1">
                    <!-- 結果ヘッダー -->
                    <div class="results-header bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 id="results-count" class="results-title text-2xl font-bold text-gray-900 dark:text-white">
                                    <span class="count-number text-indigo-600">0</span>件の助成金
                                </h2>
                                <p id="results-description" class="results-description text-gray-600 dark:text-gray-300 mt-1">
                                    <?php if (!empty($search_params['search'])): ?>
                                        「<?php echo esc_html($search_params['search']); ?>」の検索結果
                                    <?php else: ?>
                                        すべての助成金を表示中
                                    <?php endif; ?>
                                </p>
                            </div>
                            
                            <!-- ローディングインジケーター -->
                            <div id="loading-indicator" class="loading-indicator flex items-center gap-3 text-indigo-600 hidden">
                                <div class="loading-spinner w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                <span class="text-sm font-medium">データを読み込み中...</span>
                            </div>

                            <!-- 結果アクション -->
                            <div class="result-actions flex gap-2">
                                <button class="action-btn px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm hidden" id="select-all">
                                    <i class="fas fa-check-square mr-1"></i>
                                    すべて選択
                                </button>
                                <button class="action-btn px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm" id="compare-selected">
                                    <i class="fas fa-columns mr-1"></i>
                                    比較モード
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- アクティブフィルター表示 -->
                    <div id="active-filters" class="active-filters bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6 hidden">
                        <div class="active-filters-header flex justify-between items-center mb-3">
                            <h3 class="active-filters-title text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <i class="fas fa-filter text-indigo-600"></i>
                                適用中のフィルター
                            </h3>
                            <button id="clear-all-filters" class="clear-all-btn text-sm text-red-600 hover:text-red-700 font-medium">
                                すべてクリア
                            </button>
                        </div>
                        <div id="active-filter-tags" class="active-filter-tags flex flex-wrap gap-2">
                            <!-- フィルタータグが動的に生成される -->
                        </div>
                    </div>

                    <!-- 助成金リスト -->
                    <div id="grants-container" class="grants-container">
                        <!-- 🔥 アーカイブ結果表示（統一ターゲット属性付き） -->
                        <div id="gi-results-archive"
                             data-unified-target="gi-results-unified-main"
                             class="gi-search-results grants-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            <!-- 初期ローディング表示 -->
                            <div class="initial-loading col-span-full">
                                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    <?php for($i = 0; $i < 6; $i++): ?>
                                    <div class="loading-card bg-white rounded-xl shadow-lg p-6 animate-pulse">
                                        <div class="skeleton bg-gray-200 h-40 rounded-lg mb-4"></div>
                                        <div class="skeleton bg-gray-200 h-6 rounded mb-3"></div>
                                        <div class="skeleton bg-gray-200 h-4 rounded mb-2"></div>
                                        <div class="skeleton bg-gray-200 h-4 rounded w-3/4"></div>
                                    </div>
                                    <?php endfor; ?>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ページネーション -->
                    <div id="pagination-container" class="pagination-container mt-8">
                        <!-- ページネーションが動的に生成される -->
                    </div>

                    <!-- 結果なし表示 -->
                    <div id="no-results" class="no-results bg-white rounded-xl shadow-lg p-12 text-center hidden">
                        <div class="no-results-content max-w-md mx-auto">
                            <div class="no-results-icon mb-6">
                                <i class="fas fa-search text-6xl text-gray-300"></i>
                            </div>
                            <h3 class="no-results-title text-xl font-bold text-gray-900 mb-4">
                                該当する助成金が見つかりませんでした
                            </h3>
                            <p class="no-results-description text-gray-600 mb-6">
                                検索条件を変更して再度お試しください
                            </p>
                            <div class="no-results-suggestions mb-6">
                                <h4 class="suggestions-title text-sm font-semibold text-gray-700 mb-3">検索のヒント:</h4>
                                <ul class="suggestions-list text-sm text-gray-600 text-left space-y-1">
                                    <li class="flex items-center gap-2">
                                        <i class="fas fa-check text-green-500 text-xs"></i>
                                        キーワードを変更してみる
                                    </li>
                                    <li class="flex items-center gap-2">
                                        <i class="fas fa-check text-green-500 text-xs"></i>
                                        フィルターを減らしてみる
                                    </li>
                                    <li class="flex items-center gap-2">
                                        <i class="fas fa-check text-green-500 text-xs"></i>
                                        地域を「全国」に変更してみる
                                    </li>
                                </ul>
                            </div>
                            <button 
                                id="reset-search" 
                                class="reset-search-btn px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
                            >
                                <i class="fas fa-undo mr-2"></i>
                                検索条件をリセット
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    </section>

    <!-- 比較モーダル -->
    <div id="compare-modal" class="fixed inset-0 z-50 hidden">
        <div class="modal-overlay absolute inset-0 bg-black bg-opacity-50"></div>
        <div class="modal-content relative bg-white rounded-xl max-w-6xl mx-auto mt-20 p-6 max-h-[80vh] overflow-y-auto">
            <div class="modal-header flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold">助成金比較</h2>
                <button id="close-compare" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            <div id="compare-table" class="overflow-x-auto">
                <!-- 比較テーブルが動的に生成される -->
            </div>
        </div>
    </div>

    <!-- トースト通知 -->
    <div id="toast-container" class="fixed bottom-6 right-6 z-50 space-y-2">
        <!-- トースト通知が動的に生成される -->
    </div>
</div>

<!-- JavaScript -->
<script>
// グローバル設定
window.giSearchConfig = {
    ajaxUrl: '<?php echo admin_url('admin-ajax.php'); ?>',
    nonce: '<?php echo wp_create_nonce('gi_ajax_nonce'); ?>',
    isUserLoggedIn: <?php echo is_user_logged_in() ? 'true' : 'false'; ?>,
    userId: <?php echo get_current_user_id(); ?>,
    currentUrl: '<?php echo esc_url(get_permalink()); ?>',
    homeUrl: '<?php echo esc_url(home_url('/')); ?>'
};

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    console.log('📄 Grant Archive - 統合検索システム委譲');

    // 初期パラメータを取得
    const archiveElement = document.getElementById('grant-archive-page');
    const initialParams = archiveElement ? JSON.parse(archiveElement.dataset.searchParams) : {};

    // 統合検索システムとの連携
    function waitForUnifiedSystem(maxAttempts = 50) {
        let attempts = 0;
        
        const checkSystem = () => {
            attempts++;
            
            if (window.unifiedSearch && window.unifiedSearch.isInitialized) {
                console.log('✅ 統合検索システム連携確立');
                
                // 初期検索実行
                if (Object.keys(initialParams).length > 0) {
                    setTimeout(() => {
                        window.unifiedSearch.executeUnifiedSearch('archive-initial', initialParams);
                    }, 100);
                }
                
                // アーカイブ固有の機能
                initArchiveSpecificFeatures();
                
            } else if (attempts < maxAttempts) {
                setTimeout(checkSystem, 100);
            } else {
                console.error('❌ 統合検索システムの初期化に失敗');
                showFallbackMessage();
            }
        };
        
        checkSystem();
    }

    // アーカイブページ固有機能
    function initArchiveSpecificFeatures() {
        // フィルターセクション切り替え
        document.querySelectorAll('.filter-section-header').forEach(header => {
            header.addEventListener('click', function() {
                const section = this.dataset.toggle;
                const content = document.getElementById(section + '-content');
                const icon = this.querySelector('.toggle-icon');
                
                if (content) {
                    content.classList.toggle('hidden');
                    if (icon) {
                        icon.style.transform = content.classList.contains('hidden') ? 'rotate(-90deg)' : 'rotate(0deg)';
                    }
                }
            });
        });

        // ビュー切り替え
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const view = this.dataset.view;
                
                document.querySelectorAll('.view-btn').forEach(b => {
                    b.classList.remove('active', 'bg-white', 'shadow');
                });
                
                this.classList.add('active', 'bg-white', 'shadow');
                
                // ビューをURLに反映
                const url = new URL(window.location);
                url.searchParams.set('view', view);
                window.history.replaceState({}, '', url);
            });
        });

        // クイックフィルター
        document.querySelectorAll('.quick-filter-pill').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const filter = this.dataset.filter;
                
                // アクティブ状態切り替え
                document.querySelectorAll('.quick-filter-pill').forEach(b => {
                    b.classList.remove('active', 'bg-indigo-100', 'border-indigo-300', 'bg-green-100', 'border-green-300', 'bg-yellow-100', 'border-yellow-300');
                });
                
                this.classList.add('active');
                
                // 統合検索システムにフィルター送信
                if (window.unifiedSearch) {
                    const filterParams = {};
                    
                    switch(filter) {
                        case 'active':
                            filterParams.status = ['active'];
                            this.classList.add('bg-green-100', 'border-green-300');
                            break;
                        case 'upcoming':
                            filterParams.status = ['upcoming'];
                            this.classList.add('bg-yellow-100', 'border-yellow-300');
                            break;
                        case 'high-amount':
                            filterParams.amount = '1000+';
                            break;
                        default:
                            this.classList.add('bg-indigo-100', 'border-indigo-300');
                    }
                    
                    window.unifiedSearch.executeUnifiedSearch('quick-filter', filterParams);
                }
            });
        });

        // ソート順変更
        const sortOrder = document.getElementById('sort-order');
        if (sortOrder) {
            sortOrder.addEventListener('change', function() {
                if (window.unifiedSearch) {
                    window.unifiedSearch.executeUnifiedSearch('sort', {
                        orderby: this.value
                    });
                }
            });
        }

        // 表示件数変更
        const perPage = document.getElementById('per-page');
        if (perPage) {
            perPage.addEventListener('change', function() {
                if (window.unifiedSearch) {
                    window.unifiedSearch.executeUnifiedSearch('per-page', {
                        posts_per_page: this.value
                    });
                }
            });
        }

        // フィルタートグル
        const filterToggle = document.getElementById('filter-toggle');
        if (filterToggle) {
            filterToggle.addEventListener('click', function() {
                const filterPanel = document.getElementById('filter-panel');
                if (filterPanel) {
                    filterPanel.classList.toggle('hidden');
                }
            });
        }

        // エクスポートメニュー
        const exportToggle = document.getElementById('export-toggle');
        if (exportToggle) {
            exportToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                const menu = document.getElementById('export-menu');
                if (menu) {
                    menu.classList.toggle('hidden');
                }
            });
        }

        // エクスポートオプション
        document.querySelectorAll('.export-option').forEach(option => {
            option.addEventListener('click', function(e) {
                e.preventDefault();
                const format = this.dataset.format;
                exportData(format);
            });
        });

        // エクスポート処理
        function exportData(format) {
            console.log(`📥 ${format}形式でエクスポート`);
            // TODO: エクスポート処理の実装
        }

        // フィルターリセット
        const resetFilters = document.getElementById('reset-filters');
        if (resetFilters) {
            resetFilters.addEventListener('click', function() {
                if (window.unifiedSearch) {
                    window.unifiedSearch.clearSearch();
                }
            });
        }

        // 保存した検索
        const savedSearchToggle = document.getElementById('saved-search-toggle');
        if (savedSearchToggle) {
            savedSearchToggle.addEventListener('click', function() {
                // TODO: 保存した検索の表示処理
                console.log('📡 保存した検索');
            });
        }
    }

    // フォールバック表示
    function showFallbackMessage() {
        const container = document.getElementById('gi-results-archive');
        if (container) {
            container.innerHTML = `
                <div class="col-span-full bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
                    <div class="text-yellow-600 mb-4">
                        <i class="fas fa-exclamation-triangle text-4xl"></i>
                    </div>
                    <div class="text-gray-700 text-lg font-semibold mb-2">
                        検索システムの初期化中です
                    </div>
                    <div class="text-gray-600">
                        しばらくお待ちください...
                    </div>
                </div>
            `;
        }
    }

    // 初期化開始
    waitForUnifiedSystem();
});
</script>

<?php get_footer(); ?>
