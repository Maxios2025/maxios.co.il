// Analytics event helpers for GA4 and Facebook Pixel
// Replace placeholder IDs in index.html before these will fire

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

export function trackAddToCart(productName: string, price: number, quantity: number) {
  // GA4
  window.gtag?.('event', 'add_to_cart', {
    currency: 'ILS',
    value: price * quantity,
    items: [{ item_name: productName, price, quantity }],
  });
  // Facebook Pixel
  window.fbq?.('track', 'AddToCart', {
    content_name: productName,
    content_type: 'product',
    value: price * quantity,
    currency: 'ILS',
  });
}

export function trackBeginCheckout(total: number) {
  window.gtag?.('event', 'begin_checkout', {
    currency: 'ILS',
    value: total,
  });
  window.fbq?.('track', 'InitiateCheckout', {
    value: total,
    currency: 'ILS',
  });
}

export function trackPurchase(orderNumber: string, total: number, items: { name: string; price: number; qty: number }[]) {
  window.gtag?.('event', 'purchase', {
    transaction_id: orderNumber,
    currency: 'ILS',
    value: total,
    items: items.map(i => ({ item_name: i.name, price: i.price, quantity: i.qty })),
  });
  window.fbq?.('track', 'Purchase', {
    value: total,
    currency: 'ILS',
    content_type: 'product',
  });
}
