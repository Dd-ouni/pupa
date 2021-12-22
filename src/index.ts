import {CheerioCrawler, CheerioCrawlerOptions} from './crawler/cheerio_crawler';
import {PuppeteerCarwler} from './crawler/puppeteer_crawler';
import {RequestOptionsUnion, RequestArrayOptionsUnion} from './request';
import {URL} from 'url';
import {isArray} from './helper';
import {PriorityQueue} from './queue/priority_queue';
import {RedisStorage} from './storage/redis_storage';
import {RemStorage} from './storage/ram_storage';

type getPriorityQueueOneType<T> = T extends (n: infer P) => void ? P : never;

export enum CrawlerMode {
  CHEERIO = 0,
  PUPPETEER = 1,
}

export class BasicBuild {
  protected configure = new Map();
  protected isDistributed = false;
  protected setConfig(key: unknown, value: unknown) {
    this.configure.set(key, value);
    return this;
  }

  /**
   * @param requestOptions
   * @returns this
   */
  setRequest(
    requestOptions: getPriorityQueueOneType<
      typeof PriorityQueue.prototype.push
    >,
    priority: number = 1
  ) {
    if (!this.configure.has('queue')) {
      this.setConfig('queue', new PriorityQueue(new RemStorage()));
    }
    const priorityQueue: PriorityQueue = this.configure.get('queue');
    priorityQueue.push(requestOptions);

    return this;
  }

  setDistributedStorage() {
    if (!this.isDistributed) {
      if (this.configure.has('queue')) {
        this.configure.get('queue');
      } else {
        this.setConfig('queue', new PriorityQueue(new RedisStorage()));
      }
    }
    return this;
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
