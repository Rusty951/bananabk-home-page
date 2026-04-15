/* Basic Interactions for Banana Black */

document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');
    const publicConfig = window.BANANABK_PUBLIC_CONFIG || {};
    const worksStaticPages = new Set(['index', 'product', 'food', 'dessert', 'space', 'portrait', 'portrait-private', 'upload', 'manage']);

    const normalizeWorksStaticPath = () => {
        const { pathname, search, hash } = window.location;
        const match = pathname.match(/^\/works\/([a-z-]+)\/?$/);

        if (!match) {
            return;
        }

        const slug = match[1];
        if (!worksStaticPages.has(slug)) {
            return;
        }

        window.history.replaceState(null, '', `/works/${slug}.html${search}${hash}`);
    };

    normalizeWorksStaticPath();
    
    // GA4: 카카오 문의 버튼 클릭 추적 (이벤트 위임 — 모든 카카오 링크 공통)
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href*="pf.kakao.com"]');
        if (!link) return;
        const isFixed = link.classList.contains('fixed-kakao-cta');
        window.BANANABK_GA?.clickKakaoInquiry(
            link.href || '',
            isFixed ? 'fixed_cta' : 'inline'
        );
    });

    // GA4: 비공개 포트폴리오 페이지 조회 추적
    if (window.location.pathname.includes('portrait-private')) {
        window.BANANABK_GA?.viewHiddenCategory();
    }

    // 1. Header scroll effect
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check on load

    // 2. Reveal animations on scroll
    // Only elements with the .reveal class will be animated
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply observer to all elements with .reveal class
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    // 3. Contact form UX
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        const privacyConsent = document.getElementById('privacy-consent');
        const statusMessage = document.getElementById('form-status');
        const consentToggle = document.querySelector('.contact-consent-toggle');
        const consentDetail = document.getElementById('privacy-detail');
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const submitButtonLabel = submitButton ? submitButton.textContent : '';
        const supabaseUrl = typeof publicConfig.supabaseUrl === 'string' ? publicConfig.supabaseUrl.trim() : '';
        const supabaseAnonKey = typeof publicConfig.supabaseAnonKey === 'string' ? publicConfig.supabaseAnonKey.trim() : '';
        const configuredFunctionsBaseUrl = typeof publicConfig.functionsBaseUrl === 'string'
            ? publicConfig.functionsBaseUrl.trim().replace(/\/$/, '')
            : '';
        const defaultFunctionsBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://127.0.0.1:54321/functions/v1'
            : `${supabaseUrl}/functions/v1`;
        const functionsBaseUrl = configuredFunctionsBaseUrl || defaultFunctionsBaseUrl;

        const setStatusMessage = (message, type) => {
            statusMessage.textContent = message;
            statusMessage.classList.remove('is-error', 'is-success');

            if (type === 'error') {
                statusMessage.classList.add('is-error');
            }

            if (type === 'success') {
                statusMessage.classList.add('is-success');
            }
        };

        const setSubmittingState = (isSubmitting) => {
            if (!submitButton) {
                return;
            }

            submitButton.disabled = isSubmitting;
            submitButton.textContent = isSubmitting ? '접수 중...' : submitButtonLabel;
        };

        if (consentToggle && consentDetail) {
            const syncConsentToggle = (expanded) => {
                consentDetail.hidden = !expanded;
                consentDetail.setAttribute('aria-hidden', expanded ? 'false' : 'true');
                consentToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
                consentToggle.textContent = expanded ? '접기' : '자세히 보기';
            };

            syncConsentToggle(false);

            consentToggle.addEventListener('click', () => {
                const willExpand = consentDetail.hidden;
                syncConsentToggle(willExpand);
            });
        }

        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (!privacyConsent.checked) {
                privacyConsent.focus();
                setStatusMessage('개인정보 수집 및 이용 동의 후 문의를 진행해 주세요.', 'error');
                return;
            }

            if (!contactForm.reportValidity()) {
                setStatusMessage('필수 항목을 확인한 뒤 다시 진행해 주세요.', 'error');
                return;
            }

            if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR_PROJECT_ID') || supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
                setStatusMessage('연동 설정이 아직 완료되지 않았습니다. public-config.js 값을 먼저 입력해 주세요.', 'error');
                return;
            }

            const sourcePage = contactForm.dataset.sourcePage || window.location.pathname || 'contact';
            const formData = new FormData(contactForm);
            const payload = {
                brand_name: (formData.get('company') || '').toString().trim(),
                contact_name: (formData.get('contact_name') || '').toString().trim(),
                email: (formData.get('email') || '').toString().trim(),
                phone: (formData.get('phone') || '').toString().trim(),
                message: (formData.get('message') || '').toString().trim(),
                privacy_agreed: privacyConsent.checked,
                source_page: sourcePage
            };

            setSubmittingState(true);
            setStatusMessage('문의 내용을 저장하고 있습니다...', null);

            try {
                const response = await fetch(`${functionsBaseUrl}/submit-contact-inquiry`, {
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
                    const errorMessage = typeof result.error === 'string'
                        ? result.error
                        : '문의 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
                    throw new Error(errorMessage);
                }

                contactForm.reset();

                if (consentToggle && consentDetail) {
                    consentDetail.hidden = true;
                    consentDetail.setAttribute('aria-hidden', 'true');
                    consentToggle.setAttribute('aria-expanded', 'false');
                    consentToggle.textContent = '자세히 보기';
                }

                setStatusMessage('문의가 정상적으로 접수되었습니다. 확인 후 이메일로 안내드리겠습니다.', 'success');

                // GA4: 폼 제출 성공 이벤트 발화 (submit_contact_form + generate_lead)
                window.BANANABK_GA?.submitContactForm(sourcePage);

                if (result && result.notificationSent === false && result.warning) {
                    console.warn('Inquiry saved but notification failed:', result.warning);
                }
            } catch (error) {
                console.error(error);
                setStatusMessage(
                    error instanceof Error
                        ? error.message
                        : '문의 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
                    'error'
                );
            } finally {
                setSubmittingState(false);
            }
        });
    }

    // 4. Works detail lightbox
    const pageImageSelectors = {
        'product-page': ['#product-hero img', '#product-grid img'],
        'food-page': ['#food-hero img', '#food-grid img'],
        'dessert-page': ['#dessert-hero img', '#dessert-grid img'],
        'portrait-page': ['#portrait-hero img', '#portrait-grid img'],
        'space-page': ['#space-hero img', '#space-grid img']
    };

    let teardownWorksLightbox = null;

    const initWorksLightbox = () => {
        if (typeof teardownWorksLightbox === 'function') {
            teardownWorksLightbox();
            teardownWorksLightbox = null;
        }

        const currentPageClass = Object.keys(pageImageSelectors).find((className) => document.body.classList.contains(className));
        const lightboxTargets = currentPageClass
            ? document.querySelectorAll(pageImageSelectors[currentPageClass].join(', '))
            : [];

        if (!lightboxTargets.length) {
            return;
        }

        const previousLightbox = document.querySelector('.works-lightbox');
        if (previousLightbox) {
            previousLightbox.remove();
        }

        const lightbox = document.createElement('div');
        lightbox.className = 'works-lightbox';
        lightbox.setAttribute('aria-hidden', 'true');
        lightbox.innerHTML = `
            <div class="works-lightbox__dialog" role="dialog" aria-modal="true" aria-label="Expanded portfolio image">
                <button type="button" class="works-lightbox__nav works-lightbox__nav--prev" aria-label="Previous image">&#8592;</button>
                <button type="button" class="works-lightbox__nav works-lightbox__nav--next" aria-label="Next image">&#8594;</button>
                <button type="button" class="works-lightbox__close" aria-label="Close image view">&times;</button>
                <div class="works-lightbox__stage">
                    <img class="works-lightbox__image works-lightbox__image--primary is-active" alt="">
                    <img class="works-lightbox__image works-lightbox__image--secondary" alt="">
                </div>
                <div class="works-lightbox__meta" aria-live="polite"></div>
            </div>
        `;

        document.body.appendChild(lightbox);

        const galleryImages = Array.from(lightboxTargets);
        const lightboxImages = Array.from(lightbox.querySelectorAll('.works-lightbox__image'));
        const lightboxStage = lightbox.querySelector('.works-lightbox__stage');
        const prevButton = lightbox.querySelector('.works-lightbox__nav--prev');
        const nextButton = lightbox.querySelector('.works-lightbox__nav--next');
        const closeButton = lightbox.querySelector('.works-lightbox__close');
        const metaLabel = lightbox.querySelector('.works-lightbox__meta');
        let lastOpenedTarget = null;
        let currentIndex = 0;
        let activeImageIndex = 0;
        let isTransitioning = false;
        let transitionTimer = null;

        const updateMeta = () => {
            metaLabel.textContent = `${currentIndex + 1} / ${galleryImages.length}`;
        };

        const updateOrientationClass = (imageElement) => {
            lightbox.classList.remove('is-portrait', 'is-landscape');

            if (!imageElement || !imageElement.naturalWidth || !imageElement.naturalHeight) {
                return;
            }

            const orientationClass = imageElement.naturalHeight > imageElement.naturalWidth ? 'is-portrait' : 'is-landscape';
            lightbox.classList.add(orientationClass);
        };

        const setImageSource = (imageElement, target) => {
            imageElement.src = target.currentSrc || target.src;
            imageElement.alt = target.alt || '';
        };

        const renderImageByIndex = (index, options = {}) => {
            const { animate = true } = options;
            currentIndex = (index + galleryImages.length) % galleryImages.length;
            const target = galleryImages[currentIndex];
            updateMeta();

            if (!animate) {
                const activeImage = lightboxImages[activeImageIndex];
                setImageSource(activeImage, target);
                activeImage.classList.add('is-active');

                if (activeImage.complete) {
                    updateOrientationClass(activeImage);
                } else {
                    activeImage.onload = () => {
                        activeImage.onload = null;
                        updateOrientationClass(activeImage);
                    };
                }
                return;
            }

            if (isTransitioning) {
                return;
            }

            isTransitioning = true;
            lightboxStage.classList.add('is-transitioning');
            const currentImage = lightboxImages[activeImageIndex];
            const nextImageIndex = activeImageIndex === 0 ? 1 : 0;
            const nextImage = lightboxImages[nextImageIndex];

            setImageSource(nextImage, target);

            const finalizeTransition = () => {
                window.clearTimeout(transitionTimer);

                window.setTimeout(() => {
                    nextImage.classList.add('is-active');
                    currentImage.classList.remove('is-active');
                    updateOrientationClass(nextImage);
                }, 120);

                transitionTimer = window.setTimeout(() => {
                    currentImage.removeAttribute('src');
                    currentImage.alt = '';
                    activeImageIndex = nextImageIndex;
                    lightboxStage.classList.remove('is-transitioning');
                    isTransitioning = false;
                }, 820);
            };

            if (nextImage.complete) {
                requestAnimationFrame(finalizeTransition);
                return;
            }

            nextImage.onload = () => {
                nextImage.onload = null;
                requestAnimationFrame(finalizeTransition);
            };
        };

        const openLightbox = (target) => {
            const targetIndex = galleryImages.indexOf(target);
            renderImageByIndex(targetIndex === -1 ? 0 : targetIndex, { animate: false });
            lightbox.classList.add('is-open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            lastOpenedTarget = target;
            closeButton.focus();
        };

        const closeLightbox = () => {
            lightbox.classList.remove('is-open');
            lightbox.setAttribute('aria-hidden', 'true');
            lightbox.classList.remove('is-portrait', 'is-landscape');
            lightboxStage.classList.remove('is-transitioning');
            window.clearTimeout(transitionTimer);
            lightboxImages.forEach((image, index) => {
                image.classList.toggle('is-active', index === 0);
                image.removeAttribute('src');
                image.alt = '';
                image.onload = null;
            });
            activeImageIndex = 0;
            isTransitioning = false;
            document.body.style.overflow = '';

            if (lastOpenedTarget) {
                lastOpenedTarget.focus();
            }
        };

        const showPreviousImage = () => renderImageByIndex(currentIndex - 1, { animate: true });
        const showNextImage = () => renderImageByIndex(currentIndex + 1, { animate: true });

        const imageClickHandlers = galleryImages.map((img) => {
            const handleClick = () => openLightbox(img);
            const handleKeydown = (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openLightbox(img);
                }
            };

            img.setAttribute('tabindex', '0');
            img.setAttribute('role', 'button');
            img.setAttribute('aria-label', `${img.alt || 'Portfolio image'} enlarged view`);
            img.addEventListener('click', handleClick);
            img.addEventListener('keydown', handleKeydown);

            return { img, handleClick, handleKeydown };
        });

        const handlePrevClick = (event) => {
            event.stopPropagation();
            showPreviousImage();
        };

        const handleNextClick = (event) => {
            event.stopPropagation();
            showNextImage();
        };

        const handleLightboxClick = (event) => {
            if (event.target === lightbox) {
                closeLightbox();
            }
        };

        const handleDocumentKeydown = (event) => {
            if (!lightbox.classList.contains('is-open')) {
                return;
            }

            if (event.key === 'Escape') {
                closeLightbox();
            } else if (event.key === 'ArrowLeft') {
                showPreviousImage();
            } else if (event.key === 'ArrowRight') {
                showNextImage();
            }
        };

        prevButton.addEventListener('click', handlePrevClick);
        nextButton.addEventListener('click', handleNextClick);
        closeButton.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', handleLightboxClick);
        document.addEventListener('keydown', handleDocumentKeydown);

        teardownWorksLightbox = () => {
            window.clearTimeout(transitionTimer);
            document.removeEventListener('keydown', handleDocumentKeydown);
            prevButton.removeEventListener('click', handlePrevClick);
            nextButton.removeEventListener('click', handleNextClick);
            closeButton.removeEventListener('click', closeLightbox);
            lightbox.removeEventListener('click', handleLightboxClick);
            imageClickHandlers.forEach(({ img, handleClick, handleKeydown }) => {
                img.removeEventListener('click', handleClick);
                img.removeEventListener('keydown', handleKeydown);
            });
            lightbox.remove();
            document.body.style.overflow = '';
        };
    };

    window.BANANABK_INIT_WORKS_LIGHTBOX = initWorksLightbox;

    if (document.body.matches('.product-page, .food-page, .dessert-page, .portrait-page, .space-page')) {
        initWorksLightbox();
    }
});
