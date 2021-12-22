import {BasicStorage} from './basic_storage';
import {isArray} from '../helper';
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
  private isReady: Boolean = false;
  private commandQueue: {(): void}[] = [];

  constructor() {
    this.storage = createClient();
    this.storage.on('ready', () => {
      this.isReady = true;
    });
  }

  push(key: string, value: unknown, priority = 1): Promise<number> {
    if (!this.isReady) {
      return new Promise((resolve) => {
        this.commandQueue.push(() => {
          this.storage.zAdd(key, {
            score: priority,
            value: JSON.stringify(value),
          }).then(result => {
            resolve(result);
          })
        })
      })
    } else {
      return this.storage.zAdd(key, {
        score: priority,
        value: JSON.stringify(value),
      });
    }
  
  }

  pop(key: string): Promise<unknown> {
    if(!this.isReady) {
      return new Promise((resolve) => {
        this.commandQueue.push(() => {
          this.storage.eval(DEQUEUE_SCRIPT, {
            keys: [key],
            arguments: ['1']
          }).then(result =>{
            resolve(result);
          })
        });
      })
    }else{
      
      return this.storage.eval(DEQUEUE_SCRIPT, {
        keys: [key],
        arguments: ['1']
      })
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
    if(!this.isReady) {
      return new Promise((resolve) => {
        this.commandQueue.push(() => {
          this.storage.EXISTS(key).then(result => {
            resolve(result)
          })
        });
      });
    } else {
      return this.storage.EXISTS(key);
    }
  }

  size(key: string): Promise<number> {
    if(!this.isReady) {
      return new Promise((resolve) => {
        this.commandQueue.push(() => {
          this.storage.zCard(key).then(result => {
            resolve(result)
          })
        });
      });
    } else {
      return this.storage.zCard(key);
    }    
  }
}
