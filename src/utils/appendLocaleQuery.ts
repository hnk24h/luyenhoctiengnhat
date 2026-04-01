// Helper to append locale as ?mode=vi or ?mode=en
export function appendLocaleQuery(href: string, locale: string) {
  if (!locale) return href;
  // Nếu đã có query, thêm hoặc thay thế mode
  const [path, query = ''] = href.split('?');
  const params = new URLSearchParams(query);
  params.set('mode', locale);
  return path + '?' + params.toString();
}
