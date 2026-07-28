/**
 * Generates the SHA-256 hash (in hex format) for a given File or Blob object.
 * Uses the Web Crypto API (crypto.subtle.digest) natively available in modern browsers.
 * 
 * @param {File|Blob} file 
 * @returns {Promise<string>} Hexadecimal SHA-256 hash string
 */
export async function generateSHA256(file) {
    if (!file) return '';
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}
