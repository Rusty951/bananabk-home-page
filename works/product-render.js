(function () {
    const SUPABASE_URL = 'https://gtuwmsynpdbjxmhfytao.supabase.co';
    const STORAGE_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/works/`;

    const escapeHtml = (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const renderEmptyState = (container) => {
        container.innerHTML = `
            <div class="container">
                <p class="works-cta-copy">아직 등록된 Product 이미지가 없습니다.</p>
            </div>
        `;
    };

    const renderProductHero = (container, image) => {
        const imageUrl = `${STORAGE_BASE_URL}${image.image_path}`;

        container.innerHTML = `
            <img
                src="${escapeHtml(imageUrl)}"
                alt="${escapeHtml(image.caption || 'Product hero')}"
                class="product-img"
            >
        `;
    };

    const initProductPage = async () => {
        const heroContainer = document.getElementById('product-hero-media');
        const publicConfig = window.BANANABK_PUBLIC_CONFIG || {};
        const supabaseAnonKey = typeof publicConfig.supabaseAnonKey === 'string'
            ? publicConfig.supabaseAnonKey.trim()
            : '';

        if (!heroContainer) {
            return;
        }

        if (!supabaseAnonKey || supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
            renderEmptyState(heroContainer);
            return;
        }

        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/works_images?select=id,category_slug,image_path,caption,sort_order,created_at,is_visible`,
                {
                    headers: {
                        apikey: supabaseAnonKey,
                        Authorization: `Bearer ${supabaseAnonKey}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Supabase request failed: ${response.status}`);
            }

            const rows = await response.json();
            const productImages = (Array.isArray(rows) ? rows : [])
                .filter((row) => row && row.category_slug === 'product' && row.is_visible === true)
                .sort((a, b) => {
                    const sortA = Number(a.sort_order) || 9999;
                    const sortB = Number(b.sort_order) || 9999;

                    if (sortA !== sortB) {
                        return sortA - sortB;
                    }

                    return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
                });

            if (!productImages.length || !productImages[0].image_path) {
                renderEmptyState(heroContainer);
                return;
            }

            renderProductHero(heroContainer, productImages[0]);
        } catch (error) {
            console.error('Failed to render Product hero', error);
            renderEmptyState(heroContainer);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProductPage, { once: true });
    } else {
        initProductPage();
    }
})();
