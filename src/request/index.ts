import {request, RequestOptions, ClientRequest} from 'http';
import {request as requests} from 'https';
import {EventEmitter} from 'events';
import {URL} from 'url';
import { isString, isUrl } from '../helper';

export type RequestOptionsPlus = string | RequestOptions | URL;
export type RequestOptionsPlusPlus = string | RequestOptions | URL | string[] | RequestOptions[] | URL[];


export class Request extends EventEmitter {
  private clientRequest: ClientRequest;

  constructor(option: RequestOptionsPlus) {
    super();
    this.clientRequest = this.getRequest(option)(option, res => {
      this.emit('response', res);

      res.on('data', chunk => {
        this.emit('data', chunk);
      });

      res.on('end', () => {
        this.emit('end');
      });
    });
  }

  private getProtocol(option: RequestOptionsPlus): string {
    if(isString(option)) {
      return new URL(option).protocol;
    }else if(isUrl(option)){
      return option.protocol;
    }else{
      return option.protocol!;
    }
  }

  private getRequest(option: RequestOptionsPlus) {
    const protocol = this.getProtocol(option);
    if (protocol === 'https:') {
      return requests;
    } else if (protocol === 'http:') {
      return request;
    } else {
      throw new RangeError(`not in the range type ${protocol}`);
    }
  }

  write(chunk: string | Buffer) {
    this.clientRequest.write(chunk, err => {
      this.emit('error', err);
    });
    return this;
  }

  end() {
    this.clientRequest.end();
    return this;
  }
}

export default function requestFactory(option: RequestOptionsPlus):Request {
  return new Request(option);
}
