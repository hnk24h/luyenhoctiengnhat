// Helper to auto-map route with locale prefix
export function getLocaleHref(href: string, locale: string) {
  // Remove leading slashes and split
  const segments = href.replace(/^\/+/, '').split('/');
  if (["vi", "en"].includes(segments[0])) {
    segments[0] = locale;
  } else {
    segments.unshift(locale);
  }
  return '/' + segments.join('/');
}
