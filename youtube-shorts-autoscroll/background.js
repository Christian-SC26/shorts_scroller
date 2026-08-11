// Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['yt_shorts_autoscroll', 'yt_shorts_speed', 'yt_shorts_key_next', 'yt_shorts_key_prev'], (result) => {
        if (result.yt_shorts_autoscroll === undefined) {
            chrome.storage.local.set({ yt_shorts_autoscroll: true });
        }
        if (result.yt_shorts_speed === undefined) {
            chrome.storage.local.set({ yt_shorts_speed: 1.0 });
        }
        if (result.yt_shorts_key_next === undefined) {
            chrome.storage.local.set({ yt_shorts_key_next: 'j' });
        }
        if (result.yt_shorts_key_prev === undefined) {
            chrome.storage.local.set({ yt_shorts_key_prev: 'k' });
        }
    });
});
