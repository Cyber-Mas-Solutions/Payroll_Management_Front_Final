// src/utils/helpers.js

/**
 * Formats a number as a currency string (using Sri Lankan Rupees as a default, adjust as needed).
 * @param {number | string} amount - The amount to format.
 * @returns {string} The formatted currency string.
 */
export function formatCurrency(amount) {
    // Ensure amount is a number, defaulting to 0 if invalid
    const numericAmount = Number(amount) || 0;

    try {
        // Using 'en-US' locale and 'LKR' currency (common for Sri Lanka)
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'LKR', 
            minimumFractionDigits: 2,
        }).format(numericAmount);
    } catch (e) {
        // Fallback for environments that might not support Intl
        return `Rs. ${numericAmount.toFixed(2)}`;
    }
}

/**
 * 
 * * @param {'success' | 'error' | 'info'} type - The type of message.
 * @param {string} message - The message content.
 */
export function showToast(type, message) {
   
    // For now, we will use a simple alert/console log to ensure the app runs:
    console.log(`[TOAST - ${type.toUpperCase()}] ${message}`);
   
}