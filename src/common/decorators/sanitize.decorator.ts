import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

/**
 * Decorator to sanitize HTML input and prevent XSS attacks
 * Removes all HTML tags and dangerous content from string fields
 */
export function Sanitize() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      // Remove all HTML tags and keep only plain text
      return sanitizeHtml(value, {
        allowedTags: [], // No HTML tags allowed
        allowedAttributes: {}, // No attributes allowed
        disallowedTagsMode: 'discard',
      });
    }
    return value;
  });
}

/**
 * Decorator to sanitize HTML but allow safe formatting tags
 * Allows basic formatting (bold, italic, lists) but blocks scripts and dangerous content
 */
export function SanitizeHtml() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return sanitizeHtml(value, {
        allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
        allowedAttributes: {},
        allowedSchemes: [],
        disallowedTagsMode: 'discard',
      });
    }
    return value;
  });
}
