/* Basic Interactions for Banana Black */

document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');
    
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

        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();

            if (!privacyConsent.checked) {
                privacyConsent.focus();
                statusMessage.textContent = '개인정보 수집 및 이용 동의 후 문의를 진행해 주세요.';
                statusMessage.classList.remove('is-success');
                statusMessage.classList.add('is-error');
                return;
            }

            if (!contactForm.reportValidity()) {
                statusMessage.textContent = '필수 항목을 확인한 뒤 다시 진행해 주세요.';
                statusMessage.classList.remove('is-success');
                statusMessage.classList.add('is-error');
                return;
            }

            statusMessage.textContent = '현재 웹 폼은 접수 연동 준비 중입니다. 빠른 문의는 카카오톡 또는 이메일로 부탁드립니다.';
            statusMessage.classList.remove('is-error');
            statusMessage.classList.add('is-success');
        });
    }

    // 4. Works detail lightbox
    const isWorksDetailPage = document.body.matches('.product-page, .food-page, .portrait-page, .space-page');

    if (!isWorksDetailPage) {
        return;
    }

    const pageImageSelectors = {
        'product-page': ['#product-hero img', '#product-grid img'],
        'food-page': ['#food-hero img', '#food-grid img'],
        'portrait-page': ['#portrait-hero img', '#portrait-grid img'],
        'space-page': ['#space-hero img', '#space-grid img']
    };

    const currentPageClass = Object.keys(pageImageSelectors).find((className) => document.body.classList.contains(className));
    const lightboxTargets = currentPageClass
        ? document.querySelectorAll(pageImageSelectors[currentPageClass].join(', '))
        : [];

    if (!lightboxTargets.length) {
        return;
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

    lightboxTargets.forEach((img) => {
        img.setAttribute('tabindex', '0');
        img.setAttribute('role', 'button');
        img.setAttribute('aria-label', `${img.alt || 'Portfolio image'} enlarged view`);

        img.addEventListener('click', () => openLightbox(img));
        img.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openLightbox(img);
            }
        });
    });

    prevButton.addEventListener('click', (event) => {
        event.stopPropagation();
        showPreviousImage();
    });

    nextButton.addEventListener('click', (event) => {
        event.stopPropagation();
        showNextImage();
    });

    closeButton.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (event) => {
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
    });
});
