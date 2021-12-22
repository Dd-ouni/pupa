import {BasicCrawler} from './basic_crawler';
import {URL} from 'url';
import {RequestOptions, IncomingMessage} from 'http';
import request, {Request, RequestOptionsUnion} from '../request';
import {mergeRight, mergeDeepRight, concat} from 'ramda';
import cheerio, {CheerioAPI} from 'cheerio';
import {
  isArray,
  isFunction,
  isString,
  isUrl,
  urlToHttpOptions,
} from '../helper';
import UserAgent from 'user-agents';
import {PriorityQueue} from '../queue/priority_queue';

export interface PageOperateParameter {
  requestOptions: RequestOptionsUnion;
  request: Request;
  response: IncomingMessage;
  $: CheerioAPI;
  chunk: Buffer;
}

export interface CheerioCrawlerOptions {
  userAgent: string | {(): string};
  headers: {[key: string]: string} | null;
  queue: PriorityQueue;
  pageOperateBefore: (
    options: Pick<PageOperateParameter, 'requestOptions' | 'request'>
  ) => void;
  pageOperateResponse: (
    options: Omit<PageOperateParameter, '$' | 'chunk'>
  ) => void;
  pageOperateComplete: (options: PageOperateParameter) => void;
  activeQueue: number;
  queueEndConventions: ((value: unknown) => void) | null;
  firstDelay: number;
  firstTime: number | null;
}

const mergeDefault = mergeDeepRight({
  userAgent: () => {
    return new UserAgent().toString();
  },
  headers: null,
  queue: null,
  pageOperateBefore: () => {},
  pageOperateResponse: () => {},
  pageOperateComplete: () => {},
  activeQueue: 0,
  queueEndConventions: null,
  firstDelay: 5000,
  firstTime: null,
});

export class CheerioCrawler extends BasicCrawler {
  private option: CheerioCrawlerOptions;

  constructor(option: CheerioCrawlerOptions) {
    super();
    this.option = mergeDefault(option) as CheerioCrawlerOptions;
  }

  private async finished() {
    const option = this.option;
    option.activeQueue -= 1;
    if (
      option.activeQueue === 0 &&
      !(await option.queue.size()) &&
      option.queueEndConventions
    ) {
      option.queueEndConventions(true);
    }
  }

  private hasQueue() {
    return this.option.queue.size();
  }

  private getQueueItem() {
    return this.option.queue.pop();
  }

  private hasHeaders() {
    return Boolean(this.option.headers !== null);
  }

  private getRequest(queueItem: RequestOptionsUnion): Request {
    if (this.hasHeaders()) {
      if (isString(queueItem)) {
        queueItem = mergeRight(urlToHttpOptions(new URL(queueItem)), {
          headers: JSON.parse(JSON.stringify(this.option.headers)),
        });
      } else if (isUrl(queueItem)) {
        queueItem = mergeRight(urlToHttpOptions(queueItem), {
          headers: JSON.parse(JSON.stringify(this.option.headers)),
        });
      } else {
        queueItem = mergeRight(queueItem, {
          headers: JSON.parse(JSON.stringify(this.option.headers)),
        });
      }
    }

    if (!(queueItem as RequestOptions).headers!['user-agent']) {
      const userAgent = this.option.userAgent;
      if (isFunction(userAgent)) {
        (queueItem as RequestOptions).headers!['user-agent'] = userAgent();
      } else if (isString(userAgent)) {
        (queueItem as RequestOptions).headers!['user-agent'] = userAgent;
      } else {
        throw new Error('userAgent out of range');
      }
    }

    const requestInstance = request(queueItem);
    this.option.activeQueue += 1;
    return requestInstance;
  }

  private firstDelayRecord(): void {
    if(!this.option.firstTime) {
      this.option.firstTime = new Date().getTime();
    }
  }

  private isFirstDelayTimeOut(): boolean {
    if(((new Date().getTime()) - this.option.firstTime!) >= this.option.firstDelay){
      return true;
    }else {
      return false;
    }
  }

  async run() {
    // record the first runtime
    this.firstDelayRecord();

    if (await this.hasQueue()) {
      /** queueItem!
      non empty judgment the length has been verified in front and the compiler has not been identified
      */
      const queueItem = (await this.getQueueItem()) as RequestOptionsUnion;
      console.log(`queueItem ${queueItem}`);
      const option = this.option;
      const requestInstance = this.getRequest(queueItem);
      let response: IncomingMessage, body: Buffer;

      option.pageOperateBefore({
        requestOptions: queueItem!,
        request: requestInstance,
      });

      requestInstance
        .on('response', res => {
          response = res;
          option.pageOperateResponse({
            requestOptions: queueItem!,
            request: requestInstance,
            response: response,
          });
        })
        .on('data', chunk => {
          body = Buffer.concat(
            body ? [body, chunk] : [chunk],
            body
              ? body.length + (chunk as Buffer).length
              : (chunk as Buffer).length
          );
        })
        .on('end', () => {
          option.pageOperateComplete({
            requestOptions: queueItem!,
            request: requestInstance,
            response: response,
            $: cheerio.load(body.toString()),
            chunk: body,
          });
          this.finished();
        })
        .end();
      process.nextTick(() => {
        this.run();
      });
    } else {
      if(!this.isFirstDelayTimeOut()) {
        setTimeout(() => {
          this.run();
        }, 100);
      }
    }

    return this;
  }

  /**
   * returns an agreement that when the queue is empty and does not have an active
   * @returns Promise
   */
  end() {
    return new Promise(resolve => {
      this.option.queueEndConventions = resolve;
    });
  }
}
