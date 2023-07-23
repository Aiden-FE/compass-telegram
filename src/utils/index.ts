import cloneDeep from 'lodash-es/cloneDeep';
import type {
  HttpTelegramInternalReqConfig,
  HttpTelegramReqInterceptor,
  HttpTelegramResInterceptor,
  HttpTelegramResponse,
} from '@/interfaces';

export function replaceURLParams(url: string, params: Record<string, string>) {
  return Object.keys(params).reduce((lastURL, currentKey) => {
    const currentValue = params[currentKey];
    const reg = new RegExp(`:${currentKey}`, 'g');
    return url.replace(reg, currentValue);
  }, url);
}

export async function executeReqInterceptorsSerially(
  functions: HttpTelegramReqInterceptor[],
  req: HttpTelegramInternalReqConfig,
) {
  if (!functions || !functions.length) {
    return req;
  }
  let reqConfig = req;
  // eslint-disable-next-line no-restricted-syntax
  for (const func of functions) {
    // eslint-disable-next-line no-await-in-loop
    reqConfig = await func(reqConfig);
  }
  return reqConfig;
}

export async function executeResInterceptorsSerially(
  functions: HttpTelegramResInterceptor[],
  res: HttpTelegramResponse,
) {
  if (!functions || !functions.length) {
    return res;
  }
  const responseData = res;
  let result = res.data ? cloneDeep(res.data) : res.data;

  // eslint-disable-next-line no-restricted-syntax
  for (const func of functions) {
    // eslint-disable-next-line no-await-in-loop
    result = await func(result, responseData);
  }
  return result;
}
