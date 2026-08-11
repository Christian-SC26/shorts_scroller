document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('autoscroll-toggle');
    const speedRange = document.getElementById('speed-range');
    const speedVal = document.getElementById('speed-val');
    const speedBtns = document.querySelectorAll('.speed-btn');
    const keyNextBtn = document.getElementById('key-next-btn');
    const keyPrevBtn = document.getElementById('key-prev-btn');

    // Load saved settings
    chrome.storage.local.get(['yt_shorts_autoscroll', 'yt_shorts_speed', 'yt_shorts_key_next', 'yt_shorts_key_prev'], (result) => {
        toggle.checked = result.yt_shorts_autoscroll !== false;
        
        const speed = parseFloat(result.yt_shorts_speed) || 1.0;
        setSpeedUI(speed);

        const keyNext = result.yt_shorts_key_next || 'j';
        const keyPrev = result.yt_shorts_key_prev || 'k';
        keyNextBtn.textContent = formatKey(keyNext);
        keyPrevBtn.textContent = formatKey(keyPrev);
    });

    function formatKey(key) {
        if (!key) return 'None';
        if (key === ' ') return 'Space';
        if (key === 'ArrowUp') return '↑';
        if (key === 'ArrowDown') return '↓';
        if (key === 'ArrowLeft') return '←';
        if (key === 'ArrowRight') return '→';
        if (key.length === 1) return key.toUpperCase();
        return key;
    }

    function setSpeedUI(speed) {
        speedRange.value = speed;
        speedVal.textContent = speed.toFixed(2).replace('.00', '.0') + 'x';

        speedBtns.forEach(btn => {
            const btnSpeed = parseFloat(btn.dataset.speed);
            if (Math.abs(btnSpeed - speed) < 0.01) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function applySpeed(speed) {
        setSpeedUI(speed);
        chrome.storage.local.set({ yt_shorts_speed: speed });
        sendToTab({ action: 'set-speed', speed: speed });
    }

    toggle.addEventListener('change', () => {
        const isEnabled = toggle.checked;
        chrome.storage.local.set({ yt_shorts_autoscroll: isEnabled });
        sendToTab({ action: 'set-autoscroll', enabled: isEnabled });
    });

    speedBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const speed = parseFloat(btn.dataset.speed);
            applySpeed(speed);
        });
    });

    speedRange.addEventListener('input', () => {
        const speed = parseFloat(speedRange.value);
        applySpeed(speed);
    });

    // Key recording logic
    let recordingButton = null;

    function startRecording(btn) {
        if (recordingButton) {
            stopRecording();
        }
        recordingButton = btn;
        btn.classList.add('recording');
        btn.textContent = '...';

        window.addEventListener('keydown', onKeydown);
    }

    function stopRecording() {
        if (recordingButton) {
            recordingButton.classList.remove('recording');
            recordingButton = null;
        }
        window.removeEventListener('keydown', onKeydown);
    }

    function onKeydown(e) {
        e.preventDefault();
        e.stopPropagation();

        if (e.key === 'Escape') {
            stopRecording();
            chrome.storage.local.get(['yt_shorts_key_next', 'yt_shorts_key_prev'], (result) => {
                keyNextBtn.textContent = formatKey(result.yt_shorts_key_next || 'j');
                keyPrevBtn.textContent = formatKey(result.yt_shorts_key_prev || 'k');
            });
            return;
        }

        const pressedKey = e.key;
        const storageKey = recordingButton.id === 'key-next-btn' ? 'yt_shorts_key_next' : 'yt_shorts_key_prev';

        chrome.storage.local.set({ [storageKey]: pressedKey }, () => {
            recordingButton.textContent = formatKey(pressedKey);
            sendToTab({
                action: 'set-keys',
                keyNext: storageKey === 'yt_shorts_key_next' ? pressedKey : null,
                keyPrev: storageKey === 'yt_shorts_key_prev' ? pressedKey : null
            });
            stopRecording();
        });
    }

    keyNextBtn.addEventListener('click', () => {
        startRecording(keyNextBtn);
    });

    keyPrevBtn.addEventListener('click', () => {
        startRecording(keyPrevBtn);
    });

    function sendToTab(msg) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, msg).catch(() => {});
            }
        });
    }
});
