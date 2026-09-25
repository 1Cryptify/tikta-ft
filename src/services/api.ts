export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
export const API_USERS_BASE_URL = `${API_BASE_URL}/api/users`;
export const API_PAYMENTS_BASE_URL = `${API_BASE_URL}/api/payments`;
export const API_ZONES_BASE_URL = `${API_BASE_URL}/api/zones`;

/**
 * Build an absolute URL for a backend media file (logos, documents, images…).
 *
 * The backend exposes `MEDIA_URL = "media/"`, so a serialized field may come as
 * any of: `media/payment_methods/logos/x.png`, `/media/…`, or a bare
 * `payment_methods/logos/x.png`, or already an absolute URL. This helper
 * normalizes all of them without ever doubling `/media/`.
 */
export const getMediaUrl = (relativePath?: string | null): string => {
    if (!relativePath) return '';
    const raw = String(relativePath).trim();
    if (!raw) return '';
    // Already absolute (http/https or protocol-relative)
    if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:')) return raw;

    // Strip every leading slash, then a single leading `media/` segment.
    let clean = raw.replace(/^\/+/, '');
    clean = clean.replace(/^media\//i, '');

    return `${API_BASE_URL}/media/${clean}`;
};