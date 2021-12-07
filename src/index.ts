import {CheerioCrawler, CheerioCrawlerOptions} from './crawler/cheerio_crawler';
import {PuppeteerCarwler} from './crawler/puppeteer_crawler';
import {RequestOptions} from 'http';
import {URL} from 'url';
import {isArray} from './helper';
export enum CrawlerMode {
  CHEERIO = 0,
  PUPPETEER = 1,
}

type SetRequestOptions =
  | string
  | string[]
  | URL
  | URL[]
  | RequestOptions
  | RequestOptions[];

export class BasicBuild {
  protected configure = new Map();
  protected setConfig(key: unknown, value: unknown) {
    this.configure.set(key, value);
    return this;
  }

  setRequest(requestOptions: SetRequestOptions) {
    return this.setConfig(
      'queue',
      isArray(requestOptions) ? requestOptions : [requestOptions]
    );
  }

  setPageOperateBefore(
    pageOperateBefore: Pick<CheerioCrawlerOptions, 'pageOperateBefore'>
  ) {
    return this.setConfig('pageOperateBefore', pageOperateBefore);
  }

  setPageOperateResponse(
    pageOperateResponse: Pick<CheerioCrawlerOptions, 'pageOperateResponse'>
  ) {
    return this.setConfig('pageOperateResponse', pageOperateResponse);
  }

  setPageOperateComplete(
    pageOperateComplete: Pick<CheerioCrawlerOptions, 'pageOperateComplete'>
  ) {
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
