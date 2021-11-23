import {
  CheerioCrawler,
  PageOperateBeforeFunction,
  PageOperateResponseFunction,
  PageOperateDataFunction,
} from './crawler/cheerio_crawler';
import {PuppeteerCarwler} from './crawler/puppeteer_crawler';
import {RequestOptions} from 'http';
import {URL} from 'url';
import {is} from 'ramda';
export enum CrawlerMode {
  CHEERIO = 0,
  PUPPETEER = 1,
}

type SetRequestOptionsPupa =
  | string
  | string[]
  | URL
  | URL[]
  | RequestOptions
  | RequestOptions[];

export class CheerioBuild {
  private configure = new Map();

  private setConfig(key: unknown, value: unknown) {
    this.configure.set(key, value);
    return this;
  }

  build() {
    return new CheerioCrawler(Object.fromEntries(this.configure));
  }

  setRequest(requestOptions: SetRequestOptionsPupa) {
    return this.setConfig(
      'queue',
      is(Array, requestOptions) ? requestOptions : [requestOptions]
    );
  }

  setPageOperateBefore(pageOperateBefore: PageOperateBeforeFunction) {
    return this.setConfig('pageOperateBefore', pageOperateBefore);
  }

  setPageOperateResponse(pageOperateResponse: PageOperateResponseFunction) {
    return this.setConfig('pageOperateResponse', pageOperateResponse);
  }

  setPageOperateData(pageOperateData: PageOperateDataFunction) {
    return this.setConfig('pageOperateData', pageOperateData);
  }
}

export class PuppeteerBuild {
  private configure = new Map();

  private setConfig(key: unknown, value: unknown) {
    this.configure.set(key, value);
    return this;
  }

  build() {
    return new PuppeteerCarwler();
  }

  setRequest(requestOptions: SetRequestOptionsPupa) {
    return this.setConfig(
      'queue',
      is(Array, requestOptions) ? requestOptions : [requestOptions]
    );
  }
}

function setMode(mode: CrawlerMode): CheerioBuild | PuppeteerBuild | null {
  switch (mode) {
    case CrawlerMode.CHEERIO:
      return new CheerioBuild();
    case CrawlerMode.PUPPETEER:
      return new PuppeteerBuild();
    default:
  }
  return null;
}

export function createPupa() {
  return {
    setMode,
  };
}
