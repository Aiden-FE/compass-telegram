export function replaceURLParams(url: string, params: Record<string, string>) {
  return Object.keys(params).reduce((lastURL, currentKey) => {
    const currentValue = params[currentKey];
    const reg = new RegExp(`:${currentKey}`, 'g');
    return url.replace(reg, currentValue);
  }, url);
}

export function updateURLSearchParams(url: string, params: Record<string, string>) {
  const formatURL = new URLSearchParams(url);
  Object.keys(params).forEach((currentKey) => {
    const currentValue = params[currentKey];
    formatURL.set(currentKey, currentValue);
  });
  return formatURL.toString();
}
