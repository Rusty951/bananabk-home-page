(function () {
    const publicConfig = window.BANANABK_PUBLIC_CONFIG || {};
    const supabaseUrl = typeof publicConfig.supabaseUrl === 'string' ? publicConfig.supabaseUrl.trim() : '';
    const supabaseAnonKey = typeof publicConfig.supabaseAnonKey === 'string' ? publicConfig.supabaseAnonKey.trim() : '';
    const configuredFunctionsBaseUrl = typeof publicConfig.functionsBaseUrl === 'string'
        ? publicConfig.functionsBaseUrl.trim().replace(/\/$/, '')
        : '';
    const defaultFunctionsBaseUrl = `${supabaseUrl}/functions/v1`;
    const functionsBaseUrl = configuredFunctionsBaseUrl || defaultFunctionsBaseUrl;
    const fallbackFunctionsBaseUrl = functionsBaseUrl;
    const useWorksFunction = publicConfig.useWorksFunction === true || Boolean(configuredFunctionsBaseUrl);

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR_PROJECT_ID') || supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
        return;
    }

    const defaultHeaders = {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
    };

    const layoutConfig = {
        product: {
            imageClass: 'product-img',
            heroContainerSelector: '#product-hero-media',
            labelSelector: '.product-page-label',
            gridSectionSelector: '#product-grid',
            navLinkBase: './'
        },
        food: {
            imageClass: 'food-img',
            heroContainerSelector: '#food-hero .container-full',
            labelSelector: '.food-page-label',
            gridSectionSelector: '#food-grid',
            navLinkBase: './'
        },
        dessert: {
            imageClass: 'dessert-img',
            heroContainerSelector: '#dessert-hero .container-full',
            labelSelector: '.dessert-page-label',
            gridSectionSelector: '#dessert-grid',
            navLinkBase: './'
        },
        space: {
            imageClass: 'space-img',
            heroContainerSelector: '#space-hero .space-hero-stage',
            labelSelector: '.space-page-label',
            gridSectionSelector: '#space-grid',
            navLinkBase: './'
        },
        portrait: {
            imageClass: 'portrait-img',
            heroContainerSelector: '#portrait-hero .portrait-hero-stage',
            labelSelector: '.portrait-page-label',
            gridSectionSelector: '#portrait-grid',
            navLinkBase: './'
        }
    };

    const fetchFromSupabase = async (path) => {
        const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
            headers: defaultHeaders
        });

        if (!response.ok) {
            throw new Error(`Supabase request failed: ${response.status}`);
        }

        return response.json();
    };

    const optimizeStorageImageUrl = (url) => {
        if (!url || !url.includes('/storage/v1/object/public/works/')) {
            return url;
        }

        const [baseUrl, query = ''] = url.split('?');
        const params = new URLSearchParams(query);
        params.set('width', params.get('width') || '1600');
        params.set('quality', params.get('quality') || '82');

        return `${baseUrl.replace('/storage/v1/object/public/works/', '/storage/v1/render/image/public/works/')}?${params.toString()}`;
    };

    const requestFunctionWithBaseUrl = async (baseUrl, path) => {
        const response = await fetch(`${baseUrl}/${path}`, {
            headers: defaultHeaders
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(typeof result.error === 'string' ? result.error : `Function request failed: ${response.status}`);
        }

        return result;
    };

    const fetchFromFunction = async (path) => {
        try {
            return await requestFunctionWithBaseUrl(functionsBaseUrl, path);
        } catch (error) {
            const isNetworkError = error instanceof TypeError;
            if (!isNetworkError || !fallbackFunctionsBaseUrl || fallbackFunctionsBaseUrl === functionsBaseUrl) {
                throw error;
            }

            return requestFunctionWithBaseUrl(fallbackFunctionsBaseUrl, path);
        }
    };

    const escapeHtml = (value) => {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    const resolveImageUrl = (image) => {
        let url = '';

        if (image && image.resolved_url) {
            url = image.resolved_url;
        } else if (image && image.image_url && /^https?:\/\//.test(image.image_url)) {
            url = image.image_url;
        }

        if (url) {
            const localBaseUrl = supabaseUrl && supabaseUrl.includes('127.0.0.1') ? supabaseUrl : 'http://127.0.0.1:54321';
            return optimizeStorageImageUrl(url.replace(/^http:\/\/kong:8000/, localBaseUrl));
        }

        if (image && image.image_path) {
            const normalizedPath = String(image.image_path)
                .trim()
                .replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/public\/works\//, '')
                .replace(/^\/+/, '')
                .replace(/^works\//, '');

            if (normalizedPath) {
                return optimizeStorageImageUrl(`${supabaseUrl}/storage/v1/object/public/works/${normalizedPath}`);
            }
        }

        return '';
    };

    const renderHeroFallback = (heroContainer, layout, altText) => {
        if (!heroContainer) {
            return false;
        }

        const fallbackSrc = heroContainer.dataset.fallbackSrc;
        if (!fallbackSrc) {
            return false;
        }

        heroContainer.innerHTML = `
            <img src="${escapeHtml(fallbackSrc)}" alt="${escapeHtml(heroContainer.dataset.fallbackAlt || altText)}" class="${layout.imageClass}" decoding="async" fetchpriority="high">
        `;
        return true;
    };

    const buildCategoryPageHref = (slug) => `/works/${slug}.html`;

    const renderWorksNav = (categories, currentSlug) => {
        const navContainer = document.querySelector('.works-local-links');
        if (!navContainer) {
            return;
        }

        navContainer.innerHTML = categories
            .filter((category) => category.is_public)
            .map((category) => {
                const isActive = category.slug === currentSlug;
                return `
                    <a href="${buildCategoryPageHref(category.slug)}"${isActive ? ' class="is-active" aria-current="page"' : ''}>
                        ${escapeHtml(category.name)}
                    </a>
                `;
            })
            .join('');
    };

    const renderHub = async () => {
        const hubGrid = document.querySelector('#works-hub .works-grid');

        if (!hubGrid) {
            return;
        }

        let categories = [];
        let firstImageBySlug = new Map();

        if (useWorksFunction) {
            try {
                const result = await fetchFromFunction('get-works-content?mode=hub');
                categories = Array.isArray(result.categories) ? result.categories : [];

                Object.entries(result.firstImageBySlug || {}).forEach(([slug, image]) => {
                    if (image) {
                        firstImageBySlug.set(slug, image);
                    }
                });
            } catch (functionError) {
                console.warn('Failed to load hub from function, falling back to REST.', functionError);
            }
        }

        if (!categories.length) {
            categories = await fetchFromSupabase('works_categories?select=slug,name,title,description,is_public,sort_order&is_public=eq.true&order=sort_order.asc');

            if (!categories.length) {
                return;
            }

            const slugFilter = categories.map((category) => `"${category.slug}"`).join(',');
            const images = await fetchFromSupabase(`works_images?select=category_slug,image_path,image_url,caption,sort_order,is_visible,created_at&is_visible=eq.true&category_slug=in.(${slugFilter})&order=category_slug.asc,sort_order.asc,created_at.asc`);

            images.forEach((image) => {
                if (!firstImageBySlug.has(image.category_slug)) {
                    firstImageBySlug.set(image.category_slug, image);
                }
            });
        }

        if (!categories.length) {
            return;
        }

        hubGrid.innerHTML = categories.map((category) => {
            const image = firstImageBySlug.get(category.slug);
            const imageUrl = image ? resolveImageUrl(image) : '../images/hero-main.png';
            const imageAlt = image && image.caption ? image.caption : `${category.name} hero`;
            const portraitModifier = category.slug === 'portrait' ? ' works-card--portrait' : '';

            return `
                <a href="${buildCategoryPageHref(category.slug)}" class="works-card${portraitModifier} reveal">
                    <div class="image-area">
                        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(imageAlt)}" class="works-card-image" loading="lazy" decoding="async">
                    </div>
                    <div class="text-area">
                        <h2 class="serif works-card-title">${escapeHtml(category.title || category.name)}</h2>
                    </div>
                </a>
            `;
        }).join('');

        hubGrid.querySelectorAll('.reveal').forEach((element) => {
            element.classList.add('revealed');
        });

        // GA4: Works 허브(카테고리 목록) 조회 이벤트
        window.BANANABK_GA?.viewWorkCategory();
    };

    const renderGridSectionMarkup = (layout, images, imageClass) => {
        if (!images.length) {
            return '';
        }

        return `
            <div class="container">
                <div class="works-gallery-grid works-gallery-grid--${layout}">
                    ${images.map((image, index) => `
                        <figure class="works-gallery-card${index === 0 ? ' is-first' : ''}">
                            <img src="${escapeHtml(resolveImageUrl(image))}" alt="${escapeHtml(image.caption || image.category_slug)}" class="${imageClass}" loading="lazy" decoding="async">
                            ${image.caption ? `<figcaption class="works-gallery-caption">${escapeHtml(image.caption)}</figcaption>` : ''}
                        </figure>
                    `).join('')}
                </div>
            </div>
        `;
    };

    const renderEmptyStateMarkup = (categoryName) => `
        <div class="container">
            <p class="works-cta-copy">아직 등록된 ${escapeHtml(categoryName)} 이미지가 없습니다.</p>
        </div>
    `;

    const renderCategoryPage = async () => {
        const body = document.body;
        const categorySlug = body.dataset.categorySlug;
        const categoryLayout = body.dataset.categoryLayout;

        if (!categorySlug || !categoryLayout) {
            return;
        }

        const layout = layoutConfig[categoryLayout];
        if (!layout) {
            return;
        }

        let categories = [];
        let category = null;
        let images = [];

        if (useWorksFunction) {
            try {
                const result = await fetchFromFunction(`get-works-content?mode=category&slug=${encodeURIComponent(categorySlug)}`);
                categories = Array.isArray(result.categories) ? result.categories : [];
                category = result.category || null;
                images = Array.isArray(result.images) ? result.images : [];
            } catch (functionError) {
                console.warn(`Failed to load category ${categorySlug} from function, falling back to REST.`, functionError);
            }
        }

        if (!category) {
            categories = await fetchFromSupabase('works_categories?select=slug,name,title,description,is_public,sort_order&order=sort_order.asc');
            category = categories.find((item) => item.slug === categorySlug) || null;

            if (!category) {
                throw new Error(`Missing works category: ${categorySlug}`);
            }

            images = await fetchFromSupabase(`works_images?select=id,category_slug,image_path,image_url,caption,sort_order,is_visible,created_at&category_slug=eq.${encodeURIComponent(categorySlug)}&is_visible=eq.true&order=sort_order.asc,created_at.asc`);
        }

        if (!category) {
            throw new Error(`Missing works category: ${categorySlug}`);
        }

        renderWorksNav(categories, categorySlug);

        document.title = `${category.title || category.name} | Banana Black`;

        // GA4: Works 카테고리 상세 페이지 조회 이벤트
        window.BANANABK_GA?.viewWorkDetail(categorySlug);

        const labelElement = document.querySelector(layout.labelSelector);
        if (labelElement) {
            labelElement.textContent = category.title || category.name;
        }

        const heroContainer = document.querySelector(layout.heroContainerSelector);
        const gridSection = layout.gridSectionSelector ? document.querySelector(layout.gridSectionSelector) : null;

        if (!images.length) {
            const hasFallback = renderHeroFallback(heroContainer, layout, `${category.name} hero`);

            if (gridSection) {
                gridSection.remove();
            }

            if (typeof window.BANANABK_INIT_WORKS_LIGHTBOX === 'function') {
                window.BANANABK_INIT_WORKS_LIGHTBOX();
            }

            if (!hasFallback) {
                console.warn(`No visible works image for category: ${categorySlug}`);
            }
            return;
        }

        if (!heroContainer) {
            throw new Error(`Missing hero container for category: ${categorySlug}`);
        }

        heroContainer.innerHTML = `
            <img src="${escapeHtml(resolveImageUrl(images[0]))}" alt="${escapeHtml(images[0].caption || `${category.name} hero`)}" class="${layout.imageClass}" decoding="async" fetchpriority="high">
        `;

        const remainingImages = images.slice(1);

        if (gridSection) {
            if (remainingImages.length) {
                gridSection.innerHTML = renderGridSectionMarkup(categoryLayout, remainingImages, layout.imageClass);
                gridSection.hidden = false;
                gridSection.style.display = '';
                gridSection.setAttribute('data-db-rendered', 'true');
            } else {
                gridSection.remove();
            }
        }

        if (typeof window.BANANABK_INIT_WORKS_LIGHTBOX === 'function') {
            window.BANANABK_INIT_WORKS_LIGHTBOX();
        }
    };

    document.addEventListener('DOMContentLoaded', async () => {
        try {
            if (document.body.dataset.worksHub === 'true') {
                await renderHub();
            }

            if (document.body.dataset.categorySlug) {
                await renderCategoryPage();
            }
        } catch (error) {
            console.error('Failed to load works data', error);
        }
    });
})();
