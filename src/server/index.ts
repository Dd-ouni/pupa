import {createServer, IncomingMessage, ServerResponse} from 'http';
import {URL} from 'url';
import {getType} from 'mime';
import {isFunction} from '../helper';

type Auth = {
  username: string;
  password: string;
};

// refer to https://github.com/yujiosaka/headless-chrome-crawler/blob/master/test/server/index.js

export class Server {
  private server;
  private auths;
  private delays;
  private routes;
  private contents;

  static run(port: number): Promise<Server> {
    const server = new Server(port);
    return new Promise(reslove => {
      return server.server.once('listening', () => {
        reslove(server);
      });
    });
  }

  constructor(port: number) {
    this.server = createServer(this.onRequest.bind(this));
    this.server.listen(port);
    this.auths = new Map();
    this.delays = new Map();
    this.routes = new Map();
    this.contents = new Map();
  }


  setContent(path: string, content: string | { (request: IncomingMessage): string }) {
    this.contents.set(path, content);
  }

  setRedirect(from: string, to: string) {
    this.routes.set(
      from,
      (request: IncomingMessage, response: ServerResponse) => {
        response.writeHead(302, {location: to});
        response.end();
      }
    );
  }

  setAuth(path: string, username: string, password: string) {
    this.auths.set(path, {username, password});
  }

  setResponseDelay(path: string, delay: number) {
    this.delays.set(path, delay);
  }

  reset() {
    this.auths = new Map();
    this.delays = new Map();
    this.routes = new Map();
    this.contents = new Map();
  }

  stop() {
    return new Promise(resolve => {
      return this.server.close(resolve);
    });
  }

  private getRequestUrl(request: IncomingMessage): URL {
    const baseUrl = `http://${request.headers.host}/`;
    return new URL(request.url as string, baseUrl);
  }

  private onRequest(request: IncomingMessage, response: ServerResponse) {

    this.handleError(request, response);
    const {pathname} = this.getRequestUrl(request);

    const contentType = getType(pathname);
    if (contentType) {
      response.setHeader('Content-Type', contentType);
    }
    const auth = this.auths.get(pathname);
    if (!this.authenticate(auth, request)) {
      response.writeHead(401, {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      });
      response.end('HTTP Error 401 Unauthorized: Access is denied');
      return;
    }

    const delay = this.delays.get(pathname) || 0;

    setTimeout(() => {
      const route = this.routes.get(pathname);
      if (route) {
        return route(request, response);
      }

      const content = this.contents.get(pathname);
      if (content) {
        if(isFunction(content)){
          response.end(content(request));
        }else{
          response.end(content);
        }
        return;
      }

      response.end(pathname);
    }, delay);
  }

  private authenticate(auth: Auth, request: IncomingMessage) {
    if (!auth) {
      return true;
    }
    const credentials = this.getCredentials(request.headers.authorization);
    if (credentials === `${auth.username}:${auth.password}`) {
      return true;
    }
    return false;
  }

  private getCredentials(authorization = '') {
    const credentials = authorization.split(' ')[1] || '';
    return Buffer.from(credentials, 'base64').toString();
  }

  private handleError(request: IncomingMessage, response: ServerResponse) {
    request.on('error', (err: Error & {code: string}) => {
      if (err.code === 'ECONNRESET') {
        response.end();
        return;
      }
      throw err;
    });
  }
}
