<?php
/**
 * Template Name: 検索ページ
 * Template for dedicated search page
 * 
 * @package Grant_Insight_Perfect
 * @since 7.0.0
 */

get_header();
?>

<div id="primary" class="content-area">
    <main id="main" class="site-main">
        
        <div class="search-page-container max-w-7xl mx-auto px-4 py-8">
            
            <!-- Page Title -->
            <div class="page-header mb-8">
                <h1 class="page-title text-3xl font-bold text-gray-900">
                    <?php the_title(); ?>
                </h1>
                <?php if (has_excerpt()) : ?>
                    <div class="page-description mt-2 text-gray-600">
                        <?php the_excerpt(); ?>
                    </div>
                <?php endif; ?>
            </div>
            
            <!-- Search Section -->
            <section class="search-section bg-white rounded-lg shadow-lg p-6 mb-8">
                
                <!-- Search Header -->
                <div class="search-header mb-6">
                    <h2 class="text-2xl font-semibold text-gray-800">助成金・補助金を検索</h2>
                    <p class="text-gray-600 mt-2">条件を指定して、最適な助成金・補助金を見つけましょう</p>
                </div>
                
                <!-- Search Form -->
                <div class="search-form-wrapper">
                    
                    <!-- Main Search Input -->
                    <div class="search-input-group mb-6">
                        <label for="gi-search-input-unified-main" class="block text-sm font-medium text-gray-700 mb-2">
                            キーワード検索
                        </label>
                        <div class="relative">
                            <input type="text" 
                                   id="gi-search-input-unified-main" 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                   placeholder="助成金名、目的、対象業種などで検索">
                            <button type="button" 
                                    class="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    onclick="window.GIUnifiedSearchManager && window.GIUnifiedSearchManager.executeUnifiedSearch()">
                                <i class="fas fa-search mr-2"></i>検索
                            </button>
                        </div>
                    </div>
                    
                    <!-- Filter Section -->
                    <div class="filters-section">
                        
                        <!-- Filter Toggle Button (Mobile) -->
                        <button type="button" 
                                class="lg:hidden w-full mb-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                onclick="document.getElementById('search-filters').classList.toggle('hidden')">
                            <i class="fas fa-filter mr-2"></i>絞り込み条件を表示
                        </button>
                        
                        <!-- Filters Grid -->
                        <div id="search-filters" class="hidden lg:grid lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                            
                            <!-- Amount Filter -->
                            <div class="filter-group">
                                <label for="amount-filter" class="block text-sm font-medium text-gray-700 mb-2">
                                    助成金額
                                </label>
                                <select id="amount-filter" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="">すべて</option>
                                    <option value="0-100">100万円以下</option>
                                    <option value="100-500">100万円〜500万円</option>
                                    <option value="500-1000">500万円〜1,000万円</option>
                                    <option value="1000-3000">1,000万円〜3,000万円</option>
                                    <option value="3000+">3,000万円以上</option>
                                </select>
                            </div>
                            
                            <!-- Status Filter -->
                            <div class="filter-group">
                                <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-2">
                                    募集状況
                                </label>
                                <select id="status-filter" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="">すべて</option>
                                    <option value="active">募集中</option>
                                    <option value="upcoming">募集予定</option>
                                    <option value="closed">募集終了</option>
                                </select>
                            </div>
                            
                            <!-- Industry Filter -->
                            <div class="filter-group">
                                <label for="industry-filter" class="block text-sm font-medium text-gray-700 mb-2">
                                    対象業種
                                </label>
                                <select id="industry-filter" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="">すべて</option>
                                    <option value="manufacturing">製造業</option>
                                    <option value="retail">小売業</option>
                                    <option value="service">サービス業</option>
                                    <option value="it">IT・通信業</option>
                                    <option value="construction">建設業</option>
                                    <option value="healthcare">医療・福祉</option>
                                    <option value="agriculture">農林水産業</option>
                                    <option value="other">その他</option>
                                </select>
                            </div>
                            
                            <!-- Region Filter -->
                            <div class="filter-group">
                                <label for="region-filter" class="block text-sm font-medium text-gray-700 mb-2">
                                    対象地域
                                </label>
                                <select id="region-filter" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="">すべて</option>
                                    <option value="nationwide">全国</option>
                                    <option value="hokkaido">北海道</option>
                                    <option value="tohoku">東北</option>
                                    <option value="kanto">関東</option>
                                    <option value="chubu">中部</option>
                                    <option value="kinki">近畿</option>
                                    <option value="chugoku">中国</option>
                                    <option value="shikoku">四国</option>
                                    <option value="kyushu">九州・沖縄</option>
                                </select>
                            </div>
                            
                        </div>
                        
                        <!-- Sort and Display Options -->
                        <div class="flex flex-wrap gap-4 items-center justify-between mb-6">
                            
                            <!-- Sort Order -->
                            <div class="flex items-center gap-2">
                                <label for="sort-order" class="text-sm font-medium text-gray-700">
                                    並び替え:
                                </label>
                                <select id="sort-order" 
                                        class="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="date_desc">新着順</option>
                                    <option value="date_asc">古い順</option>
                                    <option value="amount_desc">金額が高い順</option>
                                    <option value="amount_asc">金額が低い順</option>
                                    <option value="deadline_asc">締切が近い順</option>
                                    <option value="success_rate_desc">採択率が高い順</option>
                                    <option value="popularity">人気順</option>
                                    <option value="title_asc">名前順</option>
                                </select>
                            </div>
                            
                            <!-- Per Page -->
                            <div class="flex items-center gap-2">
                                <label for="per-page-select" class="text-sm font-medium text-gray-700">
                                    表示件数:
                                </label>
                                <select id="per-page-select" 
                                        class="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="10">10件</option>
                                    <option value="20" selected>20件</option>
                                    <option value="50">50件</option>
                                    <option value="100">100件</option>
                                </select>
                            </div>
                            
                        </div>
                        
                        <!-- Clear Filters Button -->
                        <div class="flex justify-center mb-6">
                            <button type="button" 
                                    class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    onclick="window.GIUnifiedSearchManager && window.GIUnifiedSearchManager.clearFilters()">
                                <i class="fas fa-times mr-2"></i>条件をクリア
                            </button>
                        </div>
                        
                    </div>
                </div>
                
            </section>
            
            <!-- Loading Indicator -->
            <div id="search-loading" class="hidden text-center py-8">
                <div class="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-700 rounded-lg">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    検索中...
                </div>
            </div>
            
            <!-- Search Results Container -->
            <div id="search-results-unified" class="search-results-container">
                <!-- Results will be dynamically loaded here -->
            </div>
            
            <!-- Pagination Container -->
            <div id="pagination-unified" class="pagination-container mt-8">
                <!-- Pagination will be dynamically loaded here -->
            </div>
            
        </div>
        
        <!-- Page Content (if any) -->
        <?php if (have_posts()) : while (have_posts()) : the_post(); ?>
            <?php if (get_the_content()) : ?>
                <div class="page-content max-w-7xl mx-auto px-4 py-8">
                    <div class="prose prose-lg max-w-none">
                        <?php the_content(); ?>
                    </div>
                </div>
            <?php endif; ?>
        <?php endwhile; endif; ?>
        
    </main>
</div>

<?php
get_footer();