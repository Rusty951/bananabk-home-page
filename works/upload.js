(function () {
    const publicConfig = window.BANANABK_PUBLIC_CONFIG || {};
    const supabaseUrl = typeof publicConfig.supabaseUrl === 'string' ? publicConfig.supabaseUrl.trim() : '';
    const supabaseAnonKey = typeof publicConfig.supabaseAnonKey === 'string' ? publicConfig.supabaseAnonKey.trim() : '';
    const configuredFunctionsBaseUrl = typeof publicConfig.functionsBaseUrl === 'string'
        ? publicConfig.functionsBaseUrl.trim().replace(/\/$/, '')
        : '';
    const defaultFunctionsBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:54321/functions/v1'
        : `${supabaseUrl}/functions/v1`;
    const functionsBaseUrl = configuredFunctionsBaseUrl || defaultFunctionsBaseUrl;
    const fallbackFunctionsBaseUrl = functionsBaseUrl === `${supabaseUrl}/functions/v1`
        ? 'http://127.0.0.1:54321/functions/v1'
        : `${supabaseUrl}/functions/v1`;

    const requestWithBaseUrl = async (baseUrl, path, body) => {
        const response = await fetch(`${baseUrl}/${path}`, {
            method: 'POST',
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`
            },
            body
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(typeof result.error === 'string' ? result.error : '요청 처리에 실패했습니다.');
        }

        return result;
    };

    const postMultipart = async (path, body) => {
        try {
            return await requestWithBaseUrl(functionsBaseUrl, path, body);
        } catch (error) {
            const isNetworkError = error instanceof TypeError;
            if (!isNetworkError || !fallbackFunctionsBaseUrl || fallbackFunctionsBaseUrl === functionsBaseUrl) {
                throw error;
            }

            return requestWithBaseUrl(fallbackFunctionsBaseUrl, path, body);
        }
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

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('works-upload-form');
        const fileInput = document.getElementById('image-file');
        const statusElement = document.getElementById('works-upload-status');
        const fileMetaElement = document.getElementById('works-upload-file-meta');
        const submitButton = form ? form.querySelector('button[type="submit"]') : null;
        const submitLabel = submitButton ? submitButton.textContent : '업로드';

        if (!form || !fileInput || !statusElement || !fileMetaElement || !submitButton) {
            return;
        }

        const updateFileMeta = () => {
            const files = Array.from(fileInput.files || []);

            if (!files.length) {
                fileMetaElement.textContent = '선택된 파일이 없습니다.';
                return;
            }

            const totalSize = files.reduce((sum, file) => sum + file.size, 0);
            const totalSizeInMb = (totalSize / (1024 * 1024)).toFixed(2);
            const firstFile = files[0];

            fileMetaElement.textContent = files.length === 1
                ? `${firstFile.name} · ${totalSizeInMb}MB · ${firstFile.type || 'image/*'}`
                : `${files.length}장 선택됨 · 총 ${totalSizeInMb}MB · 첫 파일 ${firstFile.name}`;
        };

        const setSubmitting = (isSubmitting) => {
            submitButton.disabled = isSubmitting;
            submitButton.textContent = isSubmitting ? '업로드 중...' : submitLabel;
        };

        fileInput.addEventListener('change', updateFileMeta);
        updateFileMeta();

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (!supabaseUrl || !supabaseAnonKey) {
                setStatus(statusElement, 'public-config.js의 Supabase 설정이 필요합니다.', 'error');
                return;
            }

            if (!form.reportValidity()) {
                setStatus(statusElement, '필수 항목을 확인한 뒤 다시 업로드해 주세요.', 'error');
                return;
            }

            const formData = new FormData(form);
            const files = Array.from(fileInput.files || []);

            if (!files.length) {
                setStatus(statusElement, '업로드할 이미지를 선택해 주세요.', 'error');
                return;
            }

            const payload = new FormData();
            payload.set('category_slug', String(formData.get('category_slug') || ''));
            payload.set('caption', String(formData.get('caption') || ''));
            files.forEach((file) => {
                payload.append('files', file, file.name);
            });

            setSubmitting(true);
            setStatus(statusElement, '이미지를 업로드하고 있습니다...', null);

            try {
                const result = await postMultipart('upload-work-image', payload);

                form.reset();
                updateFileMeta();

                const uploadedCount = Array.isArray(result.records) ? result.records.length : 0;
                const successMessage = uploadedCount > 0
                    ? `${uploadedCount}장이 업로드되었습니다. ${result.records[0]?.category_slug || ''} 카테고리의 마지막 순서 뒤에 이어서 추가되었습니다.`
                    : '업로드와 DB row 생성이 완료되었습니다.';

                setStatus(statusElement, successMessage, 'success');
            } catch (error) {
                console.error(error);
                setStatus(
                    statusElement,
                    error instanceof Error ? error.message : '이미지 업로드 중 문제가 발생했습니다.',
                    'error'
                );
            } finally {
                setSubmitting(false);
            }
        });
    });
})();
