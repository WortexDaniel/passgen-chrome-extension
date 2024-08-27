// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "insertPassword") {
        insertPassword(request.password);
    }
});

// Function to insert the password into the active element
function insertPassword(password) {
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        // If the active element is an input or textarea, insert the password
        if (activeElement.type === 'password' || activeElement.type === 'text') {
            activeElement.value = password;
            // Trigger input event to notify the page of the change
            const inputEvent = new Event('input', { bubbles: true });
            activeElement.dispatchEvent(inputEvent);
            // Trigger change event to notify the page of the change
            const changeEvent = new Event('change', { bubbles: true });
            activeElement.dispatchEvent(changeEvent);
        } else {
            console.warn('Active element is not a password or text input');
        }
    } else {
        console.warn('No suitable active element found for password insertion');
    }
}

// Function to create a custom event for password generation
function createCustomEvent(password) {
    return new CustomEvent('passwordGenerated', {
        detail: { password: password },
        bubbles: true,
        cancelable: true
    });
}

// Listen for the keyboard shortcut
document.addEventListener('keydown', (event) => {
    // Check if the pressed keys match the defined shortcut (Ctrl+Q or Command+Q on Mac)
    if ((event.ctrlKey || event.metaKey) && event.key === 'q') {
        event.preventDefault(); // Prevent the default action
        chrome.runtime.sendMessage({action: "generatePassword"}, (response) => {
            if (response && response.password) {
                insertPassword(response.password);
                // Dispatch custom event
                document.dispatchEvent(createCustomEvent(response.password));
            }
        });
    }
});
