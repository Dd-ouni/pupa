import { BasicStorage } from "./basic_storage";
import { isArray } from "../helper";

type QueueType = { [key: number]: unknown[] };
type StorageValType = QueueType | unknown;

export class RemStorage implements BasicStorage {
  private storage = new Map<string, StorageValType>();
  private queueSize = 0;

  push(key: string, value: unknown, priority = 1): Promise<number> {
    const queue:QueueType = (this.storage.get(key) || {}) as QueueType;
    if(!isArray(queue[priority])) {
      queue[priority] = [];
    }
    queue[priority].push(value);
    this.storage.set(key, queue);
    this.queueSize += 1;
    return new Promise(() => {})
  }

  pop(key: string): Promise<unknown> {
    const queue:QueueType = (this.storage.get(key) || {}) as QueueType;
    let result:string;
    for(let item in queue){
      result = queue[item].shift() as string;
      if(!queue[item].length){
        delete queue[item];
      }
      break;
    }
    this.storage.set(key, queue);
    this.queueSize -= 1;
    return new Promise((resolve) => {
      resolve(result);
    });
  }

  set(key: string, value: unknown): Promise<string | null> {
    this.storage.set(key, value);
    return new Promise(() => {});
  }

  get(key: string): Promise<string | null> {
    return new Promise((resolve) => {
      resolve(this.storage.get(key) as string);
    });
  }

  has(key: string): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(this.storage.has(key));
    });
  }

  size(key: string): Promise<number> {
    return new Promise((resolve) => {
      resolve(this.queueSize);
    })  
  }

  quit(): Promise<void>{
    return new Promise((resolve) => {})
  }
}