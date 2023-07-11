export function replaceURLParams(url: string, params: Record<string, string>) {
  return Object.keys(params).reduce((lastURL, currentKey) => {
    const currentValue = params[currentKey];
    const reg = new RegExp(`:${currentKey}`, 'g');
    return url.replace(reg, currentValue);
  }, url);
}
