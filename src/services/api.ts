export const API_BASE_URL = "https://tikta-bk.webafri.com";
// export const API_BASE_URL = "http://127.0.0.1:8000";
export const API_USERS_BASE_URL = `${API_BASE_URL}/api/users`;
export const API_PAYMENTS_BASE_URL = `${API_BASE_URL}/api/payments`;

/**
 * Build absolute URL for media files (logos, documents, etc.)
 * @param relativePath Path returned from backend (e.g., "logos/company-1.jpg")
 * @returns Full URL to access the file (e.g., 
 */
export const getMediaUrl = (relativePath: string): string => {
    if (!relativePath) return '';
    // If it's already an absolute URL, return as-is
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath;
    }
    // Remove leading /media/ if it already exists
    const cleanPath = relativePath.startsWith('/media/') 
        ? relativePath.substring(7) 
        : relativePath;
    // Build the full media URL
    return `${API_BASE_URL}/media/${cleanPath}`;
};