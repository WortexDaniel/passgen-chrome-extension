document.addEventListener('DOMContentLoaded', function() {
    const passwordOutput = document.getElementById('password-output');
    const generateButton = document.getElementById('generate-button');
    const copyButton = document.getElementById('copy-button');
    const openOptionsButton = document.getElementById('open-options');
    const settingsList = document.getElementById('settings-list');

    // Load and display current settings
    function loadSettings() {
        chrome.storage.sync.get('passwordSettings', function(data) {
            const settings = data.passwordSettings || {};
            settingsList.innerHTML = '';
            for (const [key, value] of Object.entries(settings)) {
                if (typeof value === 'boolean' && value) {
                    const li = document.createElement('li');
                    li.textContent = key.charAt(0).toUpperCase() + key.slice(1);
                    settingsList.appendChild(li);
                } else if (key === 'length') {
                    const li = document.createElement('li');
                    li.textContent = `Length: ${value}`;
                    settingsList.appendChild(li);
                }
            }
        });
    }

    // Generate password
    function generatePassword() {
        chrome.runtime.sendMessage({action: "generatePassword"}, function(response) {
            passwordOutput.value = response.password;
        });
    }

    // Copy password to clipboard
    function copyPassword() {
        passwordOutput.select();
        document.execCommand('copy');
        showToast('Password copied!');
    }

    // Show a toast message
    function showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.className = 'toast';
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 2000);
    }

    // Open options page
    function openOptions() {
        chrome.runtime.openOptionsPage();
    }

    // Event listeners
    generateButton.addEventListener('click', generatePassword);
    copyButton.addEventListener('click', copyPassword);
    openOptionsButton.addEventListener('click', openOptions);

    // Initialize
    loadSettings();
    generatePassword();
});
