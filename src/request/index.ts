import {request, RequestOptions, ClientRequest} from 'http';
import {request as requests} from 'https';
import {EventEmitter} from 'events';
import {URL} from 'url';
import {is} from 'ramda';

export type RequestOptionsPupa = string | RequestOptions | URL;

export class Request extends EventEmitter {
  private clientRequest: ClientRequest;

  constructor(option: RequestOptionsPupa) {
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

  private getProtocol(option: RequestOptionsPupa) {
    if (option instanceof request) {
      console.log('option instanceof req');
    } else if (option instanceof URL) {
      return option.protocol;
    } else if (is(String, option)) {
      return new URL(option as string).protocol;
    }
    return '';
  }

  private getRequest(option: RequestOptionsPupa) {
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

export default function requestPupa(option: RequestOptionsPupa) {
  const requestInstantiate = new Request(option);
  return requestInstantiate;
}
