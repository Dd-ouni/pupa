export function isArray(value: any):value is [] {
  return Boolean(Object.prototype.toString.call(value) === '[object Array]');
}