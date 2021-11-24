import {AbstractCrawler} from './abstract_crawler';
import {URL} from 'url';
import {RequestOptions, IncomingMessage} from 'http';
import request, {Request} from '../request';
import {mergeRight} from 'ramda';
import cheerio, {CheerioAPI} from 'cheerio';

export interface PageOperateBeforeFunction {
  (requestOptions: string | URL | RequestOptions, request: Request): void;
}

export interface PageOperateResponseFunction {
  (
    requestOptions: string | URL | RequestOptions,
    response: IncomingMessage,
    request: Request
  ): void;
}

export interface PageOperateDataFunction {
  (
    $: CheerioAPI,
    chunk: Buffer,
    requestOptions: string | URL | RequestOptions,
    response: IncomingMessage,
    request: Request
  ): void;
}

type CheerioCrawlerOption = {
  queue: string[] | URL[] | RequestOptions[];
  pageOperateBefore: PageOperateBeforeFunction;
  pageOperateResponse: PageOperateResponseFunction;
  pageOperateData: PageOperateDataFunction;
  activeQueue: number;
  queueEndConventions: ((value: unknown) => void) | null;
};

const mergeDefault = mergeRight({
  queue: [],
  pageOperateBefore: () => {},
  pageOperateResponse: () => {},
  pageOperateData: () => {},
  activeQueue: 0,
  queueEndConventions: null,
} as CheerioCrawlerOption);

export class CheerioCrawler extends AbstractCrawler {
  private option: CheerioCrawlerOption;

  constructor(option: CheerioCrawlerOption) {
    super();
    this.option = mergeDefault(option);
  }

  private finished() {
    const option = this.option;
    if (
      option.activeQueue === 0 &&
      !option.queue.length &&
      option.queueEndConventions
    ) {
      option.queueEndConventions(true);
    }
  }

  run() {
    const option = this.option;

    if (option.queue.length) {
      const queueItem = option.queue.shift();
      // queueItem!
      /*
      non empty judgment the length has been verified in front and the compiler has not been identified
      */
      const requestInstantiate = request(queueItem!);
      option.activeQueue += 1;
      let response: IncomingMessage, body: Buffer;
      option.pageOperateBefore(queueItem!, requestInstantiate);
      requestInstantiate
        .on('response', res => {
          response = res;
          option.pageOperateResponse(queueItem!, res, requestInstantiate);
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
          option.pageOperateData(
            cheerio.load(body.toString()),
            body,
            queueItem!,
            response,
            requestInstantiate
          );

          option.activeQueue -= 1;
          this.finished();
        })
        .end();
      process.nextTick(() => {
        this.run();
      });
    }

    return this;
  }

  end() {
    return new Promise(resolve => {
      this.option.queueEndConventions = resolve;
    });
  }
}
