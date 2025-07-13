import DOMPurify from 'dompurify';

// Configure DOMPurify with secure defaults
const purifyConfig = {
  ALLOWED_TAGS: ['b', 'i', 'strong', 'em', 'u', 'br', 'p'],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false,
};

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, purifyConfig);
};

/**
 * Sanitize plain text content
 */
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  return text
    .replace(/[<>]/g, '') // Remove < and > characters
    .trim()
    .slice(0, 10000); // Limit length to prevent DoS
};

/**
 * Validate and sanitize file uploads
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Tipo de arquivo não permitido. Use apenas imagens JPEG, PNG, GIF ou WebP.' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Arquivo muito grande. O tamanho máximo é 5MB.' };
  }
  
  return { valid: true };
};

/**
 * Rate limiting helper
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxAttempts: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.attempts.has(key)) {
      this.attempts.set(key, []);
    }
    
    const userAttempts = this.attempts.get(key)!;
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(time => time > windowStart);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }
}

export const rateLimiter = new RateLimiter();