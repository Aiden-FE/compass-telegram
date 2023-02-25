import merge from 'lodash-es/merge';
import ky, { Options as KyOptions } from 'ky';

export interface TelegramCoreOption extends Exclude<
KyOptions, 'method' | 'json' | 'parseJson' | 'searchParams' | 'onDownloadProgress'
> {
}

export interface TelegramRequestOption extends KyOptions {
  domain?: string
}

const DEFAULT_DOMAIN = 'default';

export default class TelegramCore {
  private domainMap = new Map<string, TelegramCoreOption>();

  private readonly defaultOption: TelegramCoreOption = {
    headers: {
      'content-type': 'application/json',
    },
  };

  constructor(option: TelegramCoreOption) {
    this.defaultOption = merge(this.defaultOption, option);
    this.domainMap.set(DEFAULT_DOMAIN, this.defaultOption);
  }

  public register(domain: string, option: TelegramCoreOption) {
    if (domain === DEFAULT_DOMAIN) {
      throw new TypeError('Domain cannot be set to default!');
    }
    this.domainMap.set(domain, option);
    return this;
  }

  public unregister(domain: string) {
    if (domain === DEFAULT_DOMAIN) {
      throw new TypeError('Unable to unregister default domain');
    }
    this.domainMap.delete(domain);
    return this;
  }

  public request(option: Partial<TelegramRequestOption> & { url: string }) {
    const domain = option.domain || DEFAULT_DOMAIN;
    const defaultOption = this.domainMap.get(domain) || {};
    // TODO: 应该使用ky.extend更好
    const targetOption = merge({}, defaultOption, option);
    delete targetOption.domain;
    // @ts-ignore
    delete targetOption.url;
    // FIXME: 劫持返回
    return ky(option.url, option);
  }

  // public chain() {}
}
