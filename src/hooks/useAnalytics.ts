declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type SalesPage = 'corujao' | 'mix';

function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
}

export function useAnalytics() {
  function trackWhatsAppClick(page: SalesPage) {
    gtag('event', 'whatsapp_click', { page_label: page });
  }

  function trackCheckoutClick(page: SalesPage) {
    gtag('event', 'checkout_click', { page_label: page });
  }

  function trackCTAVisible(page: SalesPage) {
    gtag('event', 'cta_visible', { page_label: page });
  }

  function trackPageView(path: string) {
    gtag('event', 'page_view', { page_path: path });
  }

  return { trackWhatsAppClick, trackCheckoutClick, trackCTAVisible, trackPageView };
}
