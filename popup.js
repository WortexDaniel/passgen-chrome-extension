document.addEventListener('DOMContentLoaded', function() {
    const passwordOutput = document.getElementById('password-output');
    const generateButton = document.getElementById('generate-button');
    const copyButton = document.getElementById('copy-button');
    const openSettingsButton = document.getElementById('open-settings');
    const backToMainButton = document.getElementById('back-to-main');
    const settingsList = document.getElementById('settings-list');
    const settingsForm = document.getElementById('settings-form');
    const mainContent = document.getElementById('main-content');
    const settingsContent = document.getElementById('settings-content');

    function showContent(content) {
        mainContent.classList.add('hidden');
        settingsContent.classList.add('hidden');
        setTimeout(() => {
            content.classList.remove('hidden');
        }, 300);
    }

    openSettingsButton.addEventListener('click', () => showContent(settingsContent));
    backToMainButton.addEventListener('click', () => showContent(mainContent));

    function loadSettings() {
        chrome.storage.sync.get('passwordSettings', function(data) {
            const settings = data.passwordSettings || {};
            document.getElementById('password-length').value = settings.length || 12;
            document.getElementById('uppercase').checked = settings.uppercase !== false;
            document.getElementById('lowercase').checked = settings.lowercase !== false;
            document.getElementById('numbers').checked = settings.numbers !== false;
            document.getElementById('symbols').checked = settings.symbols !== false;
            document.getElementById('exclude-similar').checked = settings.excludeSimilarCharacters || false;
            document.getElementById('exclude-ambiguous').checked = settings.excludeAmbiguousCharacters || false;
            updateSettingsSummary(settings);
        });
    }

    function updateSettingsSummary(settings) {
        settingsList.innerHTML = '';
        const summaryItems = [
            `Length: ${settings.length || 12}`,
            settings.uppercase !== false ? 'Uppercase' : null,
            settings.lowercase !== false ? 'Lowercase' : null,
            settings.numbers !== false ? 'Numbers' : null,
            settings.symbols !== false ? 'Symbols' : null,
            settings.excludeSimilarCharacters ? 'Exclude Similar' : null,
            settings.excludeAmbiguousCharacters ? 'Exclude Ambiguous' : null
        ].filter(Boolean);

        summaryItems.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            settingsList.appendChild(li);
        });
    }

    function saveSettings() {
        const settings = {
            length: parseInt(document.getElementById('password-length').value),
            uppercase: document.getElementById('uppercase').checked,
            lowercase: document.getElementById('lowercase').checked,
            numbers: document.getElementById('numbers').checked,
            symbols: document.getElementById('symbols').checked,
            excludeSimilarCharacters: document.getElementById('exclude-similar').checked,
            excludeAmbiguousCharacters: document.getElementById('exclude-ambiguous').checked
        };

        chrome.storage.sync.set({ passwordSettings: settings }, function() {
            updateSettingsSummary(settings);
            showContent(mainContent);
            showToast('Settings saved successfully!');
        });
    }

    function generatePassword() {
        chrome.runtime.sendMessage({action: "generatePassword"}, function(response) {
            passwordOutput.value = response.password;
        });
    }

    function copyPassword() {
        passwordOutput.select();
        document.execCommand('copy');
        showToast('Password copied!');
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.className = 'toast';
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 2000);
    }

    generateButton.addEventListener('click', generatePassword);
    copyButton.addEventListener('click', copyPassword);
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveSettings();
    });

    loadSettings();
    generatePassword();
});