import {BasicCrawler} from './basic_crawler';
import {URL} from 'url';
import {RequestOptions, IncomingMessage} from 'http';
import request, {Request} from '../request';
import {mergeRight} from 'ramda';
import cheerio, {CheerioAPI} from 'cheerio';
import {isArray} from '../helper';

export interface PageOperateParameter {
  requestOptions: string | URL | RequestOptions;
  request: Request;
  response: IncomingMessage;
  $: CheerioAPI;
  chunk: Buffer;
}

export interface CheerioCrawlerOptions {
  queue: string[] | URL[] | RequestOptions[];
  pageOperateBefore: (
    options: Pick<PageOperateParameter, 'requestOptions' | 'request'>
  ) => void;
  pageOperateResponse: (
    options: Omit<PageOperateParameter, '$' | 'chunk'>
  ) => void;
  pageOperateComplete: (options: PageOperateParameter) => void;
  activeQueue: number;
  queueEndConventions: ((value: unknown) => void) | null;
}

const mergeDefault = mergeRight({
  queue: [],
  pageOperateBefore: () => {},
  pageOperateResponse: () => {},
  pageOperateComplete: () => {},
  activeQueue: 0,
  queueEndConventions: null,
} as CheerioCrawlerOptions);

export class CheerioCrawler extends BasicCrawler {
  private option: CheerioCrawlerOptions;

  constructor(option: CheerioCrawlerOptions) {
    super();
    this.option = mergeDefault(option);
  }

  private finished(): void {
    const option = this.option;
    if (
      option.activeQueue === 0 &&
      !option.queue.length &&
      option.queueEndConventions
    ) {
      option.queueEndConventions(true);
    }
  }

  run(){
    const option = this.option;

    if (isArray(option.queue) && option.queue.length) {
      const queueItem = option.queue.shift();
      // queueItem!
      /*
      non empty judgment the length has been verified in front and the compiler has not been identified
      */
      const requestInstantiate = request(queueItem!);
      option.activeQueue += 1;
      let response: IncomingMessage, body: Buffer;

      option.pageOperateBefore({
        requestOptions: queueItem!,
        request: requestInstantiate,
      });
      requestInstantiate
        .on('response', res => {
          response = res;
          option.pageOperateResponse({
            requestOptions: queueItem!,
            request: requestInstantiate,
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
            request: requestInstantiate,
            response: response,
            $: cheerio.load(body.toString()),
            chunk: body,
          });

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
