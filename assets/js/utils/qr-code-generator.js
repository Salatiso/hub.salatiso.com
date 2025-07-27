/* ================================================================================= */
/* FILE: assets/js/utils/qr-code-generator.js                                        */
/* PURPOSE: A utility for generating QR codes. It uses an external library to        */
/* create a QR code as an SVG string, which can be easily embedded in the UI.        */
/* NOTE: This will be used in a future phase for public profiles.                    */
/* ================================================================================= */

// We will use a lightweight, popular QR code generation library.
// This script tag would need to be added to the main HTML file that uses this module.
// <script src="https://cdn.jsdelivr.net/npm/qr-code-styling@1.5.0/lib/qr-code-styling.js"></script>

/**
 * Generates a QR code for a given URL or text.
 * @param {object} options - The configuration options for the QR code.
 * @param {string} options.data - The data to encode in the QR code (e.g., a URL).
 * @param {HTMLElement} options.targetElement - The DOM element to append the QR code to.
 * @param {number} [options.width=200] - The width of the QR code.
 * @param {number} [options.height=200] - The height of the QR code.
 * @param {string} [options.colorDark='#000000'] - The color of the dark modules.
 * @param {string} [options.colorLight='#ffffff'] - The color of the light modules.
 */
function generateQRCode(options) {
    // Check if the QR code styling library is available
    if (typeof QRCodeStyling === 'undefined') {
        console.error("QR Code Styling library is not loaded. Please include the script tag.");
        // As a fallback, we can display a message.
        options.targetElement.innerHTML = `<p class="text-red-500 text-xs">QR Code library failed to load.</p>`;
        return;
    }
    
    // Clear the target element before generating a new QR code
    options.targetElement.innerHTML = '';

    const qrCode = new QRCodeStyling({
        width: options.width || 200,
        height: options.height || 200,
        data: options.data,
        margin: 5,
        qrOptions: {
            typeNumber: "0",
            mode: "Byte",
            errorCorrectionLevel: "Q",
        },
        imageOptions: {
            hideBackgroundDots: true,
            imageSize: 0.4,
            margin: 5,
        },
        dotsOptions: {
            type: "rounded",
            color: options.colorDark || "#000000",
        },
        backgroundOptions: {
            color: options.colorLight || "#ffffff",
        },
        cornersSquareOptions: {
            type: "extra-rounded",
            color: options.colorDark || "#000000",
        },
        cornersDotOptions: {
            type: "dot",
            color: options.colorDark || "#000000",
        },
    });

    qrCode.append(options.targetElement);
    console.log(`QR Code generated for data: "${options.data}"`);
}

export { generateQRCode };
