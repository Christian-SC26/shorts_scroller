document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('autoscroll-toggle');
    const speedRange = document.getElementById('speed-range');
    const speedVal = document.getElementById('speed-val');
    const speedBtns = document.querySelectorAll('.speed-btn');

    // Загрузка сохраненных настроек
    chrome.storage.local.get(['yt_shorts_autoscroll', 'yt_shorts_speed'], (result) => {
        toggle.checked = result.yt_shorts_autoscroll !== false;
        
        const speed = parseFloat(result.yt_shorts_speed) || 1.0;
        setSpeedUI(speed);
    });

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

    function sendToTab(msg) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, msg).catch(() => {});
            }
        });
    }
});
