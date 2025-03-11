document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('api-key');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const urlInput = document.getElementById('url-input');
    const shortenBtn = document.getElementById('shorten-btn');
    const resultSection = document.getElementById('result-section');
    const shortenedUrlInput = document.getElementById('shortened-url');
    const copyBtn = document.getElementById('copy-btn');
    const errorMessage = document.getElementById('error-message');

    // Load saved API key
    chrome.storage.sync.get(['apiKey'], (result) => {
        if (result.apiKey) {
            apiKeyInput.value = result.apiKey;
        }
    });

    // Save API key
    saveApiKeyBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            chrome.storage.sync.set({ apiKey }, () => {
                showError('API key saved successfully!', 'success');
            });
        } else {
            showError('Please enter a valid API key');
        }
    });

    // Shorten URL
    shortenBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            showError('Please enter your TinyURL API key');
            return;
        }

        if (!url) {
            showError('Please enter a URL to shorten');
            return;
        }

        try {
            shortenBtn.disabled = true;
            shortenBtn.textContent = 'Shortening...';
            
            const response = await fetch('https://api.tinyurl.com/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    url: url,
                    domain: "tinyurl.com"
                })
            });

            const data = await response.json();

            if (data.code === 0 && data.data && data.data.tiny_url) {
                resultSection.classList.remove('hidden');
                shortenedUrlInput.value = data.data.tiny_url;
                errorMessage.classList.add('hidden');
            } else {
                throw new Error(data.errors?.[0] || 'Failed to shorten URL');
            }
        } catch (error) {
            showError(error.message);
            resultSection.classList.add('hidden');
        } finally {
            shortenBtn.disabled = false;
            shortenBtn.textContent = 'Shorten URL';
        }
    });

    // Copy shortened URL
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(shortenedUrlInput.value);
            showError('URL copied to clipboard!', 'success');
        } catch (err) {
            showError('Failed to copy URL');
        }
    });

    function showError(message, type = 'error') {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        errorMessage.style.backgroundColor = type === 'success' ? '#e8f5e9' : '#ffebee';
        errorMessage.style.color = type === 'success' ? '#2e7d32' : '#d32f2f';

        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 3000);
    }
}); 