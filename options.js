// Retrieve DOM elements
const form = document.getElementById('settings-form');
const passwordLength = document.getElementById('password-length');
const uppercase = document.getElementById('uppercase');
const lowercase = document.getElementById('lowercase');
const numbers = document.getElementById('numbers');
const symbols = document.getElementById('symbols');
const excludeSimilar = document.getElementById('exclude-similar');
const excludeAmbiguous = document.getElementById('exclude-ambiguous');
const status = document.getElementById('status');

// Save settings
function saveSettings() {
    const settings = {
        length: parseInt(passwordLength.value),
        uppercase: uppercase.checked,
        lowercase: lowercase.checked,
        numbers: numbers.checked,
        symbols: symbols.checked,
        excludeSimilarCharacters: excludeSimilar.checked,
        excludeAmbiguousCharacters: excludeAmbiguous.checked
    };

    chrome.storage.sync.set({ passwordSettings: settings }, function() {
        showStatus('Settings saved successfully!');
    });
}

// Load settings
function loadSettings() {
    chrome.storage.sync.get('passwordSettings', function(data) {
        const settings = data.passwordSettings || {};
        passwordLength.value = settings.length || 12;
        uppercase.checked = settings.uppercase !== false;
        lowercase.checked = settings.lowercase !== false;
        numbers.checked = settings.numbers !== false;
        symbols.checked = settings.symbols !== false;
        excludeSimilar.checked = settings.excludeSimilarCharacters || false;
        excludeAmbiguous.checked = settings.excludeAmbiguousCharacters || false;
    });
}

// Show status message
function showStatus(message) {
    status.textContent = message;
    status.classList.add('show');
    setTimeout(() => {
        status.classList.remove('show');
    }, 3000);
}

// Validate settings
function validateSettings() {
    if (passwordLength.value < 4 || passwordLength.value > 64) {
        showStatus('Password length must be between 4 and 64');
        return false;
    }
    if (!uppercase.checked && !lowercase.checked && !numbers.checked && !symbols.checked) {
        showStatus('At least one character type must be selected');
        return false;
    }
    return true;
}

// Event listeners
form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (validateSettings()) {
        saveSettings();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', loadSettings);
