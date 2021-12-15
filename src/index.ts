import {CheerioCrawler, CheerioCrawlerOptions} from './crawler/cheerio_crawler';
import {PuppeteerCarwler} from './crawler/puppeteer_crawler';
import {RequestOptionsPlusPlus} from './request';
import {URL} from 'url';
import {isArray} from './helper';

export enum CrawlerMode {
  CHEERIO = 0,
  PUPPETEER = 1,
}

export class BasicBuild {
  protected configure = new Map();
  protected setConfig(key: unknown, value: unknown) {
    this.configure.set(key, value);
    return this;
  }

  /**
   * @param requestOptions string | RequestOptions | URL | string[] | RequestOptions[] | URL[]
   * @returns this
   */
  setRequest(requestOptions: RequestOptionsPlusPlus) {
    return this.setConfig(
      'queue',
      isArray(requestOptions) ? requestOptions : [requestOptions]
    );
  }

  

  /**
   *
   * @param headers is a key value object which usually requires the following properties Cookie | User-Agent
   * @returns this
   */
  setHeaders(headers: {[key: string]: string}) {
    return this.setConfig('headers', headers);
  }

  setUserAgent(userAgent: string) {
    return this.setConfig('userAgent', userAgent);
  }

  setPageOperateBefore(pageOperateBefore: {
    (options: Pick<CheerioCrawlerOptions, 'pageOperateBefore'>): void;
  }) {
    return this.setConfig('pageOperateBefore', pageOperateBefore);
  }

  setPageOperateResponse(pageOperateResponse: {
    (options: Pick<CheerioCrawlerOptions, 'pageOperateResponse'>): void;
  }) {
    return this.setConfig('pageOperateResponse', pageOperateResponse);
  }

  setPageOperateComplete(pageOperateComplete: {
    (options: Pick<CheerioCrawlerOptions, 'pageOperateComplete'>): void;
  }) {
    return this.setConfig('pageOperateComplete', pageOperateComplete);
  }
}

export class CheerioBuild extends BasicBuild {
  build(): CheerioCrawler {
    return new CheerioCrawler(Object.fromEntries(this.configure));
  }
}

export class PuppeteerBuild extends BasicBuild {
  build(): PuppeteerCarwler {
    return new PuppeteerCarwler();
  }
}
export function createPupa(mode: CrawlerMode.CHEERIO): CheerioBuild;
export function createPupa(mode: CrawlerMode.PUPPETEER): PuppeteerBuild;
export function createPupa(mode: any) {
  switch (mode) {
    case CrawlerMode.CHEERIO:
      return new CheerioBuild();
    case CrawlerMode.PUPPETEER:
      return new PuppeteerBuild();
    default:
      return null;
  }
}
