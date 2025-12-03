/**
 * Load Paystack Inline JS
 * This is loaded via script tag in the document head
 */
export function loadPaystackScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('Window is not defined'));
            return;
        }

        // Check if already loaded
        if ((window as any).PaystackPop) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Paystack script'));
        document.head.appendChild(script);
    });
}

/**
 * Initialize Paystack payment popup
 */
export async function initializePaystackPayment(config: {
    key: string;
    email: string;
    amount: number;
    ref: string;
    onSuccess: (response: any) => void;
    onCancel: () => void;
}) {
    await loadPaystackScript();

    const handler = (window as any).PaystackPop.setup({
        key: config.key,
        email: config.email,
        amount: config.amount * 100, // Convert to kobo
        ref: config.ref,
        onClose: config.onCancel,
        callback: config.onSuccess,
    });

    handler.openIframe();
}
