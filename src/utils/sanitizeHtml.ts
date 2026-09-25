/**
 * Client-side safety net for the group "header HTML".
 * The backend already restricts this to `<div style="...">`; this strips
 * everything else again before rendering with dangerouslySetInnerHTML.
 */
export const sanitizeHeaderHtml = (html?: string | null): string => {
  if (!html) return '';

  let output = String(html)
    // Remove script/style blocks entirely.
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  // Keep only <div ...> / </div>, preserving a sanitized inline style.
  output = output.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (match, tag, attrs) => {
    if (String(tag).toLowerCase() !== 'div') return '';
    if (match.startsWith('</')) return '</div>';

    const styleMatch = String(attrs).match(/style\s*=\s*("([^"]*)"|'([^']*)')/i);
    let style = (styleMatch && (styleMatch[2] || styleMatch[3])) || '';
    style = style
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/expression\(/gi, '')
      .replace(/@import/gi, '')
      .replace(/[<>"]/g, '');

    return style ? `<div style="${style}">` : '<div>';
  });

  return output.trim();
};

export default sanitizeHeaderHtml;
