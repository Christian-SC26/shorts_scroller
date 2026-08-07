(function () {
    'use strict';

    let autoScrollEnabled = true;
    let playbackSpeed = 1.0;
    let isTransitioning = false;
    let lastVideoSrc = null;
    let lastShortUrl = null;

    // Load saved settings
    function syncSettings() {
        chrome.storage.local.get(['yt_shorts_autoscroll', 'yt_shorts_speed'], (result) => {
            if (result.yt_shorts_autoscroll !== undefined) {
                autoScrollEnabled = result.yt_shorts_autoscroll;
            }
            if (result.yt_shorts_speed !== undefined) {
                playbackSpeed = parseFloat(result.yt_shorts_speed) || 1.0;
            }
        });
    }

    syncSettings();

    // Get active Short container and video element
    function getActiveElements() {
        const activeRenderer = document.querySelector('ytd-reel-video-renderer[is-active]') ||
            document.querySelector('ytd-reel-video-renderer.is-active') ||
            document.querySelector('ytd-reel-video-renderer');

        let video = null;
        if (activeRenderer) {
            video = activeRenderer.querySelector('video');
        }

        if (!video) {
            const videos = Array.from(document.querySelectorAll('video'));
            video = videos.find(v => !v.paused && v.currentTime > 0) || videos[0];
        }

        return { activeRenderer, video };
    }

    // Scroll to next Short
    function triggerNext() {
        if (isTransitioning) return;
        isTransitioning = true;

        const { activeRenderer } = getActiveElements();

        let nextBtn = null;
        if (activeRenderer) {
            nextBtn = activeRenderer.querySelector('#navigation-button-down button') ||
                activeRenderer.querySelector('button[aria-label*="Next"]') ||
                activeRenderer.querySelector('button[aria-label*="Следующее"]');
        }
        if (!nextBtn) {
            nextBtn = document.querySelector('#navigation-button-down button') ||
                document.querySelector('button[aria-label*="Next"]') ||
                document.querySelector('button[aria-label*="Следующее"]');
        }

        if (nextBtn) {
            nextBtn.click();
        }

        if (activeRenderer && activeRenderer.nextElementSibling) {
            try {
                activeRenderer.nextElementSibling.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (e) { }
        }

        const container = document.querySelector('#shorts-container, ytd-shorts, #shorts-inner-container');
        if (container) {
            container.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
        } else {
            window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
        }

        const eventOptions = { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, which: 40, bubbles: true, cancelable: true };
        window.dispatchEvent(new KeyboardEvent('keydown', eventOptions));
        document.dispatchEvent(new KeyboardEvent('keydown', eventOptions));

        setTimeout(() => {
            isTransitioning = false;
        }, 1200);
    }

    // Change speed by delta (+0.25 / -0.25)
    function changeSpeed(delta) {
        let newSpeed = Math.round((playbackSpeed + delta) * 100) / 100;
        newSpeed = Math.max(0.25, Math.min(3.0, newSpeed));

        playbackSpeed = newSpeed;
        chrome.storage.local.set({ yt_shorts_speed: playbackSpeed });

        const { video } = getActiveElements();
        if (video) {
            video.playbackRate = playbackSpeed;
        }
    }

    // Keyboard shortcuts listener for < and >
    window.addEventListener('keydown', (e) => {
        // Do not intercept if user is typing in comments or search inputs
        const target = e.target;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
            return;
        }

        const key = e.key;
        const code = e.code;

        // Pressing '>' (Shift + .) or 'Ю'
        if (key === '>' || (e.shiftKey && code === 'Period') || key === 'Ю' || key === 'ю') {
            e.preventDefault();
            changeSpeed(0.25);
        }
        // Pressing '<' (Shift + ,) or 'Б'
        else if (key === '<' || (e.shiftKey && code === 'Comma') || key === 'Б' || key === 'б') {
            e.preventDefault();
            changeSpeed(-0.25);
        }
    });

    // Listen to popup messages
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === 'set-autoscroll') {
            autoScrollEnabled = request.enabled;
        } else if (request.action === 'set-speed') {
            playbackSpeed = request.speed;
            const { video } = getActiveElements();
            if (video) {
                video.playbackRate = playbackSpeed;
            }
        }
    });

    // Storage change listener
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.yt_shorts_autoscroll) {
            autoScrollEnabled = changes.yt_shorts_autoscroll.newValue;
        }
        if (changes.yt_shorts_speed) {
            playbackSpeed = parseFloat(changes.yt_shorts_speed.newValue) || 1.0;
        }
    });

    // Global ended event capture
    window.addEventListener('ended', (e) => {
        if (e.target && e.target.tagName === 'VIDEO' && autoScrollEnabled && window.location.pathname.startsWith('/shorts')) {
            triggerNext();
        }
    }, true);

    // Continuous video monitor and speed enforcement
    function monitor() {
        if (!window.location.pathname.startsWith('/shorts')) return;

        const videos = document.querySelectorAll('video');
        videos.forEach(v => {
            if (v.loop) {
                v.loop = false;
                v.removeAttribute('loop');
            }
        });

        const { video } = getActiveElements();
        if (!video) return;

        if (Math.abs(video.playbackRate - playbackSpeed) > 0.01) {
            video.playbackRate = playbackSpeed;
        }

        const currentSrc = video.currentSrc || video.src || '';
        const currentUrl = window.location.href;

        if (currentSrc !== lastVideoSrc || currentUrl !== lastShortUrl) {
            lastVideoSrc = currentSrc;
            lastShortUrl = currentUrl;
            isTransitioning = false;
        }

        if (autoScrollEnabled && !isTransitioning && video.duration > 0) {
            const remaining = video.duration - video.currentTime;
            if (video.ended || remaining <= 0.35) {
                triggerNext();
            }
        }
    }

    setInterval(monitor, 100);
})();
