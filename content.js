// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "insertPassword") {
        insertPassword(request.password);
    }
});

// Function to insert the password into the active element
function insertPassword(password) {
    let activeElement = document.activeElement;
    
    // If the active element is within an iframe, try to access it
    if (activeElement.tagName === 'IFRAME') {
        try {
            activeElement = activeElement.contentDocument.activeElement;
        } catch (e) {
            console.warn('Unable to access iframe content:', e);
        }
    }
    
    // If still no active element, try to find a suitable input
    if (!activeElement || (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA')) {
        activeElement = document.querySelector('input[type="password"], input[type="text"], textarea');
    }
    
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        if (activeElement.type === 'password' || activeElement.type === 'text') {
            // Use execCommand for wider compatibility
            activeElement.focus();
            document.execCommand('insertText', false, password);
            
            // Fallback to setting value directly if execCommand doesn't work
            if (activeElement.value !== password) {
                activeElement.value = password;
            }
            
            // Trigger events
            activeElement.dispatchEvent(new Event('input', { bubbles: true }));
            activeElement.dispatchEvent(new Event('change', { bubbles: true }));
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
    if ((event.ctrlKey || event.metaKey) && event.key === 'q') {
        event.preventDefault();
        chrome.runtime.sendMessage({action: "generatePassword"}, (response) => {
            if (response && response.password) {
                insertPassword(response.password);
                document.dispatchEvent(createCustomEvent(response.password));
            }
        });
    }
});

// MutationObserver to handle dynamically added elements
const observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
        if (mutation.type === 'childList') {
            const addedNodes = mutation.addedNodes;
            for (let node of addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const inputs = node.querySelectorAll('input[type="password"], input[type="text"]');
                    inputs.forEach(input => {
                        input.addEventListener('focus', () => {
                            // Update active element when an input is focused
                            document.activeElement = input;
                        });
                    });
                }
            }
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });