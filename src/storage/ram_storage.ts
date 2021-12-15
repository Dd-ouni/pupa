import { BasicStorage } from "./basic_storage";
import { isArray } from "../helper";

type QueueType = { [key: number]: string[] };
type StorageValType = QueueType | unknown;

export class RemStorage implements BasicStorage {
  private storage = new Map<string, StorageValType>();

  push(key: string, value: object, priority = 1): Promise<number> {
    const queue:QueueType = (this.storage.get(key) || {}) as QueueType;
    let queueElement: string[] = queue[priority];
    if(isArray(queueElement)) {
      queueElement.push(JSON.stringify(value))
    }else{
      queueElement = [];
    }
    this.storage.set(key, queue);
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
    return new Promise((resolve) => {
      resolve(result!);
    });
  }

  set(key: string, value: object): Promise<string | null> {
    this.storage.set(key, value);
    return new Promise(() => {});
  }

  get(key: string): Promise<string | null> {
    return new Promise((resolve) => {
      resolve(this.storage.get(key) as string);
    });
  }
}