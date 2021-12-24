import {BasicStorage} from './basic_storage';
import {isString} from '../helper';
import {createClient} from 'redis';
const DEQUEUE_SCRIPT = `
  local queue = redis.call('ZREVRANGE', KEYS[1], 0, 0)[1]\n
  if (queue) then\n
    redis.call('ZREM', KEYS[1], queue)\n
  end\n
  return queue\n
`;
export class RedisStorage implements BasicStorage {
  private storage: ReturnType<typeof createClient>;
  private isReady: boolean = false;
  private commandQueue: {(): void}[] = [];
  private isEnd: boolean = false;

  constructor(private expired: number | null = null) {
    this.storage = createClient();
    this.storage.on('ready', () => {
      this.isReady = true;
      this.runCommandQueue();
    });
    this.storage.on('error', result => {
      console.log(`error: ${JSON.stringify(result, null, 2)}`);
    });
    this.storage.on('end', () => {
      this.isEnd = true;
    });
    this.storage.connect();
  }

  private runCommandQueue() {
    while (1) {
      if (!this.commandQueue.length) {
        break;
      }
      this.commandQueue.shift()!();
    }
  }

  push(key: string, value: unknown, priority = 1): Promise<number> {
    if (!this.isReady) {
      return new Promise(resolve => {
        this.commandQueue.push(() => {
          this.storage
            .zAdd(key, {
              score: priority,
              value: JSON.stringify(value),
            })
            .then(result => {
              resolve(result);
            });
        });
      });
    } else {
      return this.storage.zAdd(key, {
        score: priority,
        value: JSON.stringify(value),
      });
    }
  }

  pop(key: string): Promise<unknown> {
    if (!this.isReady) {
      return new Promise(resolve => {
        this.commandQueue.push(() => {
          this.storage
            .eval(DEQUEUE_SCRIPT, {
              keys: [key],
              arguments: ['1'],
            })
            .then(result => {
              if (isString(result)) {
                resolve(JSON.parse(result));
              } else {
                resolve(false);
              }
            });
        });
      });
    } else {
      return new Promise(resolve => {
        this.storage
          .eval(DEQUEUE_SCRIPT, {
            keys: [key],
            arguments: ['1'],
          })
          .then(result => {
            if (isString(result)) {
              resolve(JSON.parse(result));
            } else {
              resolve(false);
            }
          });
      });
    }
  }

  set(key: string, value: unknown): Promise<string | null> {
    if (!this.isReady) {
      return new Promise(resolve => {
        this.commandQueue.push(() => {
          this.set(key, value).then(result => {
            resolve(result);
          });
        });
      });
    } else {
      return this.storage.set(key, JSON.stringify(value));
    }
  }

  get(key: string): Promise<string | null> {
    if (!this.isReady) {
      return new Promise(resolve => {
        this.commandQueue.push(() => {
          this.storage.get(key).then(result => {
            resolve(result);
          });
        });
      });
    } else {
      return this.storage.get(key);
    }
  }

  has(key: string): Promise<boolean> {
    if (!this.isReady) {
      return new Promise(resolve => {
        this.commandQueue.push(() => {
          this.storage.get(key).then(result => {
            if (this.expired !== null) {
              if (result !== null) {
                const timestamp = JSON.parse(result);
                if (new Date().getTime() - timestamp > this.expired) {
                  resolve(false);
                } else {
                  resolve(true);
                }
              }else {
                resolve(false);
              }
            } else {
              if (result !== null) {
                resolve(true);
              } else {
                resolve(false);
              }
            }
          });
        });
      });
    } else {
      return new Promise(resolve => {
        this.storage.get(key).then(result => {
          if (this.expired !== null) {
            if (result !== null) {
              const timestamp = JSON.parse(result);
              if (new Date().getTime() - timestamp > this.expired) {
                resolve(false);
              } else {
                resolve(true);
              }
            }
          } else {
            if (result !== null) {
              resolve(true);
            } else {
              resolve(false);
            }
          }
        });
      });
    }
    // if (!this.isReady) {
    //   return new Promise(resolve => {
    //     this.commandQueue.push(() => {
    //       this.storage.EXISTS(key).then(result => {
    //         resolve(result);
    //       });
    //     });
    //   });
    // } else {
    //   return this.storage.EXISTS(key);
    // }
  }

  size(key: string): Promise<number> {
    if (this.isEnd) {
      return new Promise(resolve => {
        resolve(0);
      });
    }
    if (!this.isReady) {
      return new Promise(resolve => {
        this.commandQueue.push(() => {
          this.storage.zCard(key).then(result => {
            resolve(result);
          });
        });
      });
    } else {
      return this.storage.zCard(key);
    }
  }

  quit(): Promise<void> {
    return this.storage.quit();
  }
}
