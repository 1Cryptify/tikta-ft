/**
 * Closes the current browser tab. Payment pages are often opened from a QR
 * code or an external link, so `window.close()` can be refused by the browser;
 * in that case we replace the page with a blank one.
 */
export const closePaymentTab = (): void => {
  try {
    window.close();
  } catch {
    /* ignore */
  }
  // If the tab is still open shortly after, blank it out.
  window.setTimeout(() => {
    try {
      window.location.replace('about:blank');
    } catch {
      /* ignore */
    }
  }, 200);
};

export default closePaymentTab;
