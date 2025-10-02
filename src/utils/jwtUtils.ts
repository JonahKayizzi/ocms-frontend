// JWT utility functions for parsing and validating tokens

interface JWTPayload {
    sub: string; // username
    role?: string[];
    category?: string;
    exp?: number;
    iat?: number;
}

/**
 * Parse JWT token and extract payload
 */
export const parseJWT = (token: string): JWTPayload | null => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window
                .atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to parse JWT:', error);
        return null;
    }
};

/**
 * Check if JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
    const payload = parseJWT(token);
    if (!payload || !payload.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
};

/**
 * Get username from JWT token
 */
export const getUsernameFromToken = (token: string): string | null => {
    const payload = parseJWT(token);
    return payload?.sub || null;
};

/**
 * Get user roles from JWT token
 */
export const getRolesFromToken = (token: string): string[] => {
    const payload = parseJWT(token);
    if (payload?.role && Array.isArray(payload.role)) {
        return payload.role;
    }
    if (payload?.category) {
        return [payload.category];
    }
    return [];
};

/**
 * Check if user has admin role
 */
export const isAdmin = (token: string): boolean => {
    const roles = getRolesFromToken(token);
    return roles.some(role =>
        role.toLowerCase().includes('admin') ||
        role.toLowerCase() === 'administrator'
    );
};

/**
 * Store token in localStorage
 */
export const storeToken = (token: string): void => {
    localStorage.setItem('ocms.token', token);
    localStorage.setItem('ans-sms.token', token); // For compatibility
};

/**
 * Get token from localStorage or URL params
 */
export const getToken = (): string | null => {
    // First check URL params
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');

    if (urlToken) {
        // Store it for future use
        storeToken(urlToken);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return urlToken;
    }

    // Check localStorage
    return localStorage.getItem('ocms.token') ||
        localStorage.getItem('ans-sms.token') ||
        null;
};

/**
 * Remove token from localStorage
 */
export const removeToken = (): void => {
    localStorage.removeItem('ocms.token');
    localStorage.removeItem('ans-sms.token');
    localStorage.removeItem('ans-sms');
};

/**
 * Get user info from token
 */
export const getUserInfo = (token: string) => {
    const payload = parseJWT(token);
    if (!payload) return null;

    return {
        username: payload.sub,
        roles: getRolesFromToken(token),
        isAdmin: isAdmin(token),
        category: payload.category,
    };
};

