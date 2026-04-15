/**
 * Banana Black — GA4 Analytics Utilities
 *
 * 역할: GA4 커스텀 이벤트 발화 유틸리티 모음
 * 의존성: gtag (HTML <head>에서 로드된 Google tag 스크립트)
 *
 * 원칙:
 * - localhost / 127.0.0.1 에서는 이벤트를 발화하지 않고 콘솔에만 출력
 * - window.gtag 가 없으면 조용히 무시
 * - 기존 Supabase / main.js 기능과 완전 독립
 */

(function () {
    'use strict';

    const IS_LOCAL = (function () {
        const host = window.location.hostname;
        return host === 'localhost' || host === '127.0.0.1';
    })();

    /**
     * GA4 이벤트 전송 내부 함수
     * @param {string} eventName
     * @param {Object} [params]
     */
    function sendEvent(eventName, params) {
        if (IS_LOCAL) {
            console.log('[GA4 Dev]', eventName, params || {});
            return;
        }

        if (typeof window.gtag !== 'function') {
            return;
        }

        window.gtag('event', eventName, params || {});
    }

    /**
     * 카카오 문의 링크에서 utm_campaign 파싱
     * @param {string} href
     * @returns {string}
     */
    function parseCampaign(href) {
        try {
            const url = new URL(href);
            return url.searchParams.get('utm_campaign') || 'unknown';
        } catch {
            return 'unknown';
        }
    }

    /**
     * 공개 GA 유틸리티 네임스페이스
     * main.js / works-data.js 에서 window.BANANABK_GA.xxx() 형태로 호출
     */
    window.BANANABK_GA = {
        /**
         * Works 허브 페이지 조회
         * 발화 위치: works/works-data.js → renderHub() 완료 시
         */
        viewWorkCategory: function () {
            sendEvent('view_work_category', {
                page_path: window.location.pathname
            });
        },

        /**
         * Works 카테고리 상세 페이지 조회
         * 발화 위치: works/works-data.js → renderCategoryPage() 완료 시
         * @param {string} categorySlug - 'product' | 'food' | 'dessert' | 'space' | 'portrait'
         */
        viewWorkDetail: function (categorySlug) {
            sendEvent('view_work_detail', {
                category_slug: categorySlug,
                page_path: window.location.pathname
            });
        },

        /**
         * 카카오 문의 버튼 클릭
         * 발화 위치: main.js → 카카오 링크 클릭 이벤트 위임
         * @param {string} href - 클릭된 링크의 href (utm 파싱용)
         * @param {string} location - 버튼 위치 식별자 ('fixed_cta' | 'inline')
         */
        clickKakaoInquiry: function (href, location) {
            sendEvent('click_kakao_inquiry', {
                campaign: parseCampaign(href),
                button_location: location || 'inline'
            });
        },

        /**
         * Contact 정식 문의 폼 제출 성공
         * generate_lead 이벤트도 함께 발화 (Google Ads 전환 연동용)
         * 발화 위치: main.js → contactForm submit 성공 직후
         * @param {string} sourcePage - contact 폼의 data-source-page 값
         */
        submitContactForm: function (sourcePage) {
            const params = {
                source_page: sourcePage || window.location.pathname
            };

            sendEvent('submit_contact_form', params);

            // generate_lead: Google Ads 표준 전환 이벤트명
            sendEvent('generate_lead', params);
        },

        /**
         * 비공개 포트폴리오 페이지 조회
         * 발화 위치: main.js → DOMContentLoaded, hidden-portfolio / portrait-private 페이지 감지
         */
        viewHiddenCategory: function () {
            sendEvent('view_hidden_category', {
                page_path: window.location.pathname
            });
        }
    };
})();
