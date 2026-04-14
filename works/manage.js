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
    const resolveImageUrl = (image) => {
        let url = '';

        if (image && image.resolved_url) {
            url = image.resolved_url;
        } else if (image && image.image_url && /^https?:\/\//.test(image.image_url)) {
            url = image.image_url;
        }

        if (url) {
            const localBaseUrl = supabaseUrl && supabaseUrl.includes('127.0.0.1') ? supabaseUrl : 'http://127.0.0.1:54321';
            return url.replace(/^http:\/\/kong:8000/, localBaseUrl);
        }

        if (image && image.image_path && supabaseUrl) {
            const normalizedPath = String(image.image_path)
                .trim()
                .replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/public\/works\//, '')
                .replace(/^\/+/, '')
                .replace(/^works\//, '');

            if (normalizedPath) {
                return `${supabaseUrl}/storage/v1/object/public/works/${normalizedPath}`;
            }
        }

        return '';
    };

    const setStatus = (element, message, type) => {
        element.textContent = message;
        element.classList.remove('is-error', 'is-success');

        if (type === 'error') {
            element.classList.add('is-error');
        }

        if (type === 'success') {
            element.classList.add('is-success');
        }
    };

    const escapeHtml = (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    document.addEventListener('DOMContentLoaded', () => {
        const panel = document.getElementById('works-manage-panel');
        const categorySelect = document.getElementById('manage-category');
        const grid = document.getElementById('works-manage-grid');
        const empty = document.getElementById('works-manage-empty');
        const status = document.getElementById('works-manage-status');

        if (!panel || !categorySelect || !grid || !empty || !status) {
            return;
        }

        let currentCategory = categorySelect.value;
        let images = [];

        const requestWithBaseUrl = async (baseUrl, payload) => {
            const response = await fetch(`${baseUrl}/manage-work-images`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(typeof result.error === 'string' ? result.error : '관리 요청에 실패했습니다.');
            }

            return result;
        };

        const postJson = async (payload) => {
            try {
                return await requestWithBaseUrl(functionsBaseUrl, payload);
            } catch (error) {
                const isNetworkError = error instanceof TypeError;
                if (!isNetworkError || !fallbackFunctionsBaseUrl || fallbackFunctionsBaseUrl === functionsBaseUrl) {
                    throw error;
                }

                return requestWithBaseUrl(fallbackFunctionsBaseUrl, payload);
            }
        };

        const renderGrid = () => {
            grid.innerHTML = '';
            empty.hidden = images.length > 0;

            if (!images.length) {
                return;
            }

            const heroId = (images.find((image) => image.is_visible) || {}).id;

            grid.innerHTML = images.map((image, index) => {
                const badges = [];
                if (image.id === heroId) {
                    badges.push('<span class="works-manage-badge">Hero</span>');
                }
                if (!image.is_visible) {
                    badges.push('<span class="works-manage-badge is-hidden">Hidden</span>');
                }

                return `
                    <article class="works-manage-card" data-image-id="${escapeHtml(image.id)}">
                        <div class="works-manage-thumb">
                            <img src="${escapeHtml(resolveImageUrl(image))}" alt="${escapeHtml(image.caption || image.category_slug)}" loading="lazy">
                            <div class="works-manage-badges">${badges.join('')}</div>
                        </div>
                        <div class="works-manage-meta">
                            <p class="works-manage-caption">${escapeHtml(image.caption || '(캡션 없음)')}</p>
                            <p class="works-manage-order">현재 순서 ${index + 1}</p>
                            <p class="works-manage-path">${escapeHtml(image.image_path)}</p>
                        </div>
                        <div class="works-manage-actions">
                            <button type="button" class="btn-contact btn-cta-secondary" data-action="move-up" ${index === 0 ? 'disabled' : ''}>위로 이동</button>
                            <button type="button" class="btn-contact btn-cta-secondary" data-action="move-down" ${index === images.length - 1 ? 'disabled' : ''}>아래로 이동</button>
                            <button type="button" class="btn-contact btn-cta-secondary" data-action="toggle-visibility">${image.is_visible ? '숨김' : '노출'}</button>
                            <button type="button" class="btn-contact btn-cta-primary" data-action="delete">삭제</button>
                        </div>
                    </article>
                `;
            }).join('');
        };

        const loadCategory = async (categorySlug, message) => {
            currentCategory = categorySlug;
            setStatus(status, message || '이미지 목록을 불러오고 있습니다...', null);

            try {
                const result = await postJson({
                    mode: 'list',
                    category_slug: categorySlug
                });
                images = Array.isArray(result.images) ? result.images : [];
                renderGrid();
                setStatus(status, `총 ${images.length}개의 이미지를 불러왔습니다.`, 'success');
            } catch (error) {
                console.error(error);
                images = [];
                renderGrid();
                setStatus(status, error instanceof Error ? error.message : '이미지 목록 로드에 실패했습니다.', 'error');
            }
        };
        loadCategory(categorySelect.value);

        categorySelect.addEventListener('change', () => {
            loadCategory(categorySelect.value);
        });

        grid.addEventListener('click', async (event) => {
            const button = event.target.closest('button[data-action]');
            if (!button) {
                return;
            }

            const card = button.closest('[data-image-id]');
            if (!card) {
                return;
            }

            const imageId = card.getAttribute('data-image-id');
            const action = button.getAttribute('data-action');
            if (!imageId || !action) {
                return;
            }

            if (action === 'delete' && !window.confirm('이 이미지를 삭제하시겠습니까? Storage 파일과 DB row가 함께 삭제됩니다.')) {
                return;
            }

            button.disabled = true;
            setStatus(status, '변경 사항을 저장하고 있습니다...', null);

            try {
                await postJson({
                    mode: action,
                    category_slug: currentCategory,
                    image_id: imageId
                });

                const successMessageMap = {
                    'move-up': '이미지를 위로 이동했습니다.',
                    'move-down': '이미지를 아래로 이동했습니다.',
                    'toggle-visibility': '노출 상태를 변경했습니다.',
                    'delete': '이미지를 삭제했습니다.'
                };

                await loadCategory(currentCategory, successMessageMap[action] || '변경 사항을 반영했습니다.');
            } catch (error) {
                console.error(error);
                setStatus(status, error instanceof Error ? error.message : '관리 작업에 실패했습니다.', 'error');
            } finally {
                button.disabled = false;
            }
        });
    });
})();
