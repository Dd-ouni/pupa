import {URL} from 'url';
import {RequestOptions} from 'http';

/**
 * array type guard
 * @param value enter any variable
 * @returns boolean
 */
export function isArray<T>(value: any): value is Array<T> {
  return Boolean(Object.prototype.toString.call(value) === '[object Array]');
}

/**
 * string type guard
 * @param value enter any variable
 * @returns boolean
 */
export function isString(value: any): value is string {
  return Boolean(typeof value === 'string');
}

const searchParams = Symbol('query');
/**
 * URL type guard, quoted from https://github.com/nodejs/node/blob/master/lib/_http_client.js
 * @param value enter any variable
 * @returns boolean
 */
export function isUrl(value: any): value is URL {
  try {
    return Boolean(
      value[searchParams] &&
        value[searchParams][searchParams] &&
        value instanceof URL
    );
  } catch (error) {
    return false;
  }
}

/**
 * Function type guard
 * @param value enter any variable
 * @returns boolean
 */
export function isFunction(value: any): value is Function {
  return Boolean(typeof value === 'function')
}

/**
 * quoted from https://github.com/nodejs/node/blob/master/lib/internal/url.js
 * @param url 
 * @returns RequestOptions
 */
export function urlToHttpOptions(url: URL): RequestOptions {
  const options: RequestOptions & {
    hash: string;
    search: string;
    pathname: string;
    href: string;
  } = {
    protocol: url.protocol,
    hostname:
      typeof url.hostname === 'string' && url.hostname.startsWith('[')
        ? url.hostname.slice(1, -1)
        : url.hostname,
    // hostname: typeof url.hostname === 'string' &&
    //           StringPrototypeStartsWith(url.hostname, '[') ?
    //   StringPrototypeSlice(url.hostname, 1, -1) :
    //   url.hostname,
    hash: url.hash,
    search: url.search,
    pathname: url.pathname,
    path: `${url.pathname || ''}${url.search || ''}`,
    href: url.href,
  };
  if (url.port !== '') {
    options.port = Number(url.port);
  }
  if (url.username || url.password) {
    options.auth = `${decodeURIComponent(url.username)}:${decodeURIComponent(
      url.password
    )}`;
  }
  return options;
}
