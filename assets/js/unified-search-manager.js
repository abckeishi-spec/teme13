/**
 * Grant Insight Perfect - Unified Search Manager
 * Version: 4.0.0
 * Phase: Production
 * 
 * Complete unified search system with proper error handling,
 * AbortController support, and improved DOM element collection
 */

class GIUnifiedSearchManager {
    constructor() {
        this.config = window.GISearchConfig || {};
        this.currentRequest = null;
        this.debounceTimer = null;
        this.searchParams = {};
        this.elements = {
            searchInputs: [],
            filters: {},
            sortSelect: null,
            perPageSelect: null,
            resultsContainer: null,
            pagination: null,
            loadingIndicator: null
        };
        this.isInitialized = false;
    }

    /**
     * Initialize the search manager
     */
    init() {
        try {
            this.debugLog('Initializing Unified Search Manager');
            
            // Check for required configuration
            if (!this.config || !this.config.elements) {
                throw new Error('GISearchConfig is missing or incomplete');
            }
            
            // Initialize DOM elements
            this.initializeElements();
            
            // Bind events
            this.bindEvents();
            
            // Set default parameters
            this.setDefaultParams();
            
            // Mark as initialized
            this.isInitialized = true;
            
            this.debugLog('Initialization complete', {
                elementsFound: this.getElementStats()
            });
            
            // Trigger initial search if on archive page
            if (this.shouldAutoSearch()) {
                this.executeUnifiedSearch();
            }
            
        } catch (error) {
            console.error('[GIUnifiedSearchManager] Initialization failed:', error);
        }
    }

    /**
     * Initialize and collect DOM elements based on configuration
     */
    initializeElements() {
        this.debugLog('Collecting DOM elements');
        
        // Reset elements
        this.elements = {
            searchInputs: [],
            filters: {},
            sortSelect: null,
            perPageSelect: null,
            resultsContainer: null,
            pagination: null,
            loadingIndicator: null
        };
        
        // Collect search input elements
        if (this.config.elements.searchInputs) {
            this.config.elements.searchInputs.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    this.elements.searchInputs.push(element);
                    this.debugLog(`Found search input: ${id}`);
                }
            });
        }
        
        // Collect filter elements
        if (this.config.elements.filters) {
            Object.keys(this.config.elements.filters).forEach(filterType => {
                this.elements.filters[filterType] = [];
                this.config.elements.filters[filterType].forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        this.elements.filters[filterType].push(element);
                        this.debugLog(`Found filter element: ${filterType}/${id}`);
                    }
                });
            });
        }
        
        // Collect single elements
        ['sortSelect', 'perPageSelect', 'resultsContainer', 'pagination', 'loadingIndicator'].forEach(key => {
            if (this.config.elements[key]) {
                const element = document.getElementById(this.config.elements[key]);
                if (element) {
                    this.elements[key] = element;
                    this.debugLog(`Found element: ${key}`);
                }
            }
        });
    }

    /**
     * Bind event handlers to elements
     */
    bindEvents() {
        this.debugLog('Binding events');
        
        // Search input events
        this.elements.searchInputs.forEach(input => {
            // Debounced search on input
            input.addEventListener('input', (e) => {
                this.handleSearchInput(e);
            });
            
            // Search on Enter key
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.executeUnifiedSearch();
                }
            });
        });
        
        // Filter change events
        Object.keys(this.elements.filters).forEach(filterType => {
            this.elements.filters[filterType].forEach(element => {
                element.addEventListener('change', () => {
                    this.debugLog(`Filter changed: ${filterType}`);
                    this.executeUnifiedSearch();
                });
            });
        });
        
        // Sort select change
        if (this.elements.sortSelect) {
            this.elements.sortSelect.addEventListener('change', () => {
                this.debugLog('Sort order changed');
                this.executeUnifiedSearch();
            });
        }
        
        // Per page select change
        if (this.elements.perPageSelect) {
            this.elements.perPageSelect.addEventListener('change', () => {
                this.debugLog('Per page changed');
                this.executeUnifiedSearch({ page: 1 }); // Reset to page 1
            });
        }
    }

    /**
     * Handle search input with debouncing
     */
    handleSearchInput(event) {
        // Clear existing timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        // Set new timer
        this.debounceTimer = setTimeout(() => {
            this.debugLog('Debounced search triggered');
            this.executeUnifiedSearch({ page: 1 });
        }, this.config.ui?.debounceDelay || 300);
    }

    /**
     * Set default search parameters
     */
    setDefaultParams() {
        this.searchParams = {
            ...this.config.defaults,
            page: 1
        };
    }

    /**
     * Get current filter value by type
     */
    getFilterValue(filterType) {
        const elements = this.elements.filters[filterType];
        if (!elements || elements.length === 0) return '';
        
        const values = [];
        
        elements.forEach(element => {
            if (element.type === 'checkbox' || element.type === 'radio') {
                if (element.checked) {
                    values.push(element.value);
                }
            } else if (element.tagName === 'SELECT') {
                if (element.multiple) {
                    Array.from(element.selectedOptions).forEach(option => {
                        if (option.value) values.push(option.value);
                    });
                } else if (element.value) {
                    values.push(element.value);
                }
            } else if (element.value) {
                values.push(element.value);
            }
        });
        
        // Return comma-separated for multiple values, or single value
        return filterType === 'amount' || filterType === 'status' 
            ? values.join(',') 
            : values[0] || '';
    }

    /**
     * Collect all search parameters from form elements
     */
    collectSearchParams(overrides = {}) {
        const params = {
            // Get search keyword
            keyword: this.elements.searchInputs.length > 0 
                ? this.elements.searchInputs[0].value.trim() 
                : '',
            
            // Get filters
            amount: this.getFilterValue('amount'),
            status: this.getFilterValue('status'),
            industry: this.getFilterValue('industry'),
            region: this.getFilterValue('region'),
            
            // Get sort and display options
            orderby: this.elements.sortSelect?.value || 'date_desc',
            posts_per_page: parseInt(this.elements.perPageSelect?.value || 20),
            
            // Page number
            page: this.searchParams.page || 1,
            
            // Apply overrides
            ...overrides
        };
        
        this.debugLog('Collected search params:', params);
        return params;
    }

    /**
     * Execute unified search with AbortController and timeout
     */
    async executeUnifiedSearch(overrides = {}) {
        if (!this.isInitialized) {
            console.warn('[GIUnifiedSearchManager] Not initialized yet');
            return;
        }
        
        try {
            // Abort any pending request
            if (this.currentRequest) {
                this.debugLog('Aborting previous request');
                this.currentRequest.abort();
            }
            
            // Show loading
            this.showLoading(true);
            
            // Collect parameters
            const params = this.collectSearchParams(overrides);
            this.searchParams = params;
            
            // Perform search
            const response = await this.performAjaxSearch(params);
            
            if (response.success) {
                this.handleSearchSuccess(response);
            } else {
                this.handleSearchError(response.data || 'Search failed');
            }
            
        } catch (error) {
            if (error.name === 'AbortError') {
                this.debugLog('Search request was aborted');
            } else {
                console.error('[GIUnifiedSearchManager] Search error:', error);
                this.handleSearchError(error.message);
            }
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Perform AJAX search with AbortController
     */
    performAjaxSearch(params) {
        // Create new AbortController
        this.currentRequest = new AbortController();
        
        // Set timeout
        const timeoutId = setTimeout(() => {
            if (this.currentRequest) {
                this.currentRequest.abort();
            }
        }, this.config.timeout || 30000);
        
        // Prepare form data
        const formData = new FormData();
        formData.append('action', this.config.api?.endpoint || 'gi_unified_search');
        formData.append('nonce', gi_ajax?.nonce || '');
        
        // Add search parameters
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                formData.append(key, params[key]);
            }
        });
        
        this.debugLog('Sending AJAX request', { 
            action: formData.get('action'),
            params: params 
        });
        
        // Make fetch request
        return fetch(gi_ajax?.ajax_url || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData,
            signal: this.currentRequest.signal
        })
        .then(response => {
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .finally(() => {
            clearTimeout(timeoutId);
            this.currentRequest = null;
        });
    }

    /**
     * Handle successful search response
     */
    handleSearchSuccess(response) {
        this.debugLog('Search successful', {
            results: response.data?.results_count || 0,
            pages: response.data?.max_pages || 0
        });
        
        // Update results
        if (this.elements.resultsContainer) {
            this.elements.resultsContainer.innerHTML = response.data?.html || '';
        }
        
        // Update pagination
        if (response.data?.pagination) {
            this.updatePagination(response.data.pagination);
        }
        
        // Scroll to results if configured
        if (this.config.ui?.scrollToResults && this.elements.resultsContainer) {
            const offset = this.config.ui.scrollOffset || 100;
            const top = this.elements.resultsContainer.offsetTop - offset;
            window.scrollTo({ top: top, behavior: 'smooth' });
        }
        
        // Trigger custom event
        this.dispatchCustomEvent('gi:search:success', {
            results: response.data?.results_count || 0,
            params: this.searchParams
        });
    }

    /**
     * Handle search error
     */
    handleSearchError(error) {
        console.error('[GIUnifiedSearchManager] Search error:', error);
        
        if (this.elements.resultsContainer) {
            const errorMessage = this.config.messages?.error || 'エラーが発生しました';
            this.elements.resultsContainer.innerHTML = `
                <div class="search-error-message bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    <p class="font-medium">${errorMessage}</p>
                    <p class="text-sm mt-1">${error}</p>
                </div>
            `;
        }
        
        // Trigger custom event
        this.dispatchCustomEvent('gi:search:error', { error });
    }

    /**
     * Update pagination with event handlers
     */
    updatePagination(paginationHtml) {
        if (!this.elements.pagination) return;
        
        this.elements.pagination.innerHTML = paginationHtml;
        
        // Add event handlers to pagination links
        this.elements.pagination.querySelectorAll('a[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(link.dataset.page, 10);
                if (page && page > 0) {
                    this.debugLog(`Pagination clicked: page ${page}`);
                    this.executeUnifiedSearch({ page });
                }
            });
        });
        
        // Also handle standard pagination links without data-page
        this.elements.pagination.querySelectorAll('a[href*="page="]').forEach(link => {
            if (!link.dataset.page) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const url = new URL(link.href, window.location);
                    const page = parseInt(url.searchParams.get('page'), 10);
                    if (page && page > 0) {
                        this.debugLog(`Pagination clicked (href): page ${page}`);
                        this.executeUnifiedSearch({ page });
                    }
                });
            }
        });
    }

    /**
     * Clear all filters and reset search
     */
    clearFilters() {
        this.debugLog('Clearing all filters');
        
        // Clear search inputs
        this.elements.searchInputs.forEach(input => {
            input.value = '';
        });
        
        // Clear filter elements
        Object.keys(this.elements.filters).forEach(filterType => {
            this.elements.filters[filterType].forEach(element => {
                if (element.type === 'checkbox' || element.type === 'radio') {
                    element.checked = false;
                } else if (element.tagName === 'SELECT') {
                    element.selectedIndex = 0;
                } else {
                    element.value = '';
                }
            });
        });
        
        // Reset sort and per page to defaults
        if (this.elements.sortSelect) {
            this.elements.sortSelect.value = this.config.defaults?.orderby || 'date_desc';
        }
        if (this.elements.perPageSelect) {
            this.elements.perPageSelect.value = this.config.defaults?.posts_per_page || '20';
        }
        
        // Execute search with cleared parameters
        this.executeUnifiedSearch({ page: 1 });
    }

    /**
     * Show/hide loading indicator
     */
    showLoading(show) {
        if (!this.elements.loadingIndicator) return;
        
        if (show) {
            this.elements.loadingIndicator.classList.remove('hidden');
            this.elements.loadingIndicator.style.display = 'block';
        } else {
            this.elements.loadingIndicator.classList.add('hidden');
            this.elements.loadingIndicator.style.display = 'none';
        }
    }

    /**
     * Check if auto-search should be triggered
     */
    shouldAutoSearch() {
        // Check if we're on an archive or search page
        return document.body.classList.contains('archive-grant') ||
               document.body.classList.contains('page-template-page-search') ||
               this.elements.resultsContainer !== null;
    }

    /**
     * Get statistics about found elements
     */
    getElementStats() {
        const stats = {
            searchInputs: this.elements.searchInputs.length,
            filters: {},
            others: 0
        };
        
        Object.keys(this.elements.filters).forEach(filterType => {
            stats.filters[filterType] = this.elements.filters[filterType].length;
        });
        
        ['sortSelect', 'perPageSelect', 'resultsContainer', 'pagination', 'loadingIndicator'].forEach(key => {
            if (this.elements[key]) stats.others++;
        });
        
        return stats;
    }

    /**
     * Dispatch custom event
     */
    dispatchCustomEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: detail,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }

    /**
     * Debug logging (only if debug mode is enabled)
     */
    debugLog(message, data = null) {
        if (typeof gi_ajax !== 'undefined' && gi_ajax.debug) {
            const prefix = '[GIUnifiedSearchManager]';
            if (data) {
                console.log(`${prefix} ${message}`, data);
            } else {
                console.log(`${prefix} ${message}`);
            }
        }
    }
}

// Initialize when DOM is ready
(function() {
    // Wait for both DOM and configuration to be ready
    function initWhenReady() {
        if (typeof window.GISearchConfig === 'undefined') {
            // Wait for configuration
            setTimeout(initWhenReady, 100);
            return;
        }
        
        // Create and initialize manager instance
        window.GIUnifiedSearchManager = new GIUnifiedSearchManager();
        window.GIUnifiedSearchManager.init();
    }
    
    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWhenReady);
    } else {
        initWhenReady();
    }
})();