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
};

const mergeDefault = mergeRight({
  queue: [],
  pageOperateBefore: () => {},
  pageOperateResponse: () => {},
  pageOperateData: () => {},
} as CheerioCrawlerOption);

export class CheerioCrawler extends AbstractCrawler {
  private option: CheerioCrawlerOption;

  constructor(option: CheerioCrawlerOption) {
    super();
    this.option = mergeDefault(option);
  }

  run() {
    const option = this.option;
    for (const [index, value] of option.queue.entries()) {
      console.log(`run index:${index}`);
      const requestInstantiate = request(value);
      let response: IncomingMessage, body: Buffer;
      option.pageOperateBefore(value, requestInstantiate);
      requestInstantiate
        .on('response', res => {
          response = res;
          option.pageOperateResponse(value, res, requestInstantiate);
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
            value,
            response,
            requestInstantiate
          );
        })
        .end();
    }
  }
}
