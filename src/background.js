// Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['yt_shorts_autoscroll', 'yt_shorts_speed'], (result) => {
        if (result.yt_shorts_autoscroll === undefined) {
            chrome.storage.local.set({ yt_shorts_autoscroll: true });
        }
        if (result.yt_shorts_speed === undefined) {
            chrome.storage.local.set({ yt_shorts_speed: 1.0 });
        }
    });
});
