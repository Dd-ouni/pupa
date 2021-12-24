import {BasicStorage} from '../storage/basic_storage';
import {RequestOptionsUnion, RequestArrayOptionsUnion} from '../request';
import {isArray, isPriorityQueueElement, isString, isUrl} from '../helper';

export interface PriorityQueueElement {
  priority: number;
  value: RequestOptionsUnion;
}

export class PriorityQueue {
  constructor(
    private storage: BasicStorage,
    private queueKey: string = 'pupa'
  ) {}

  private async conditionalPush(
    value: RequestOptionsUnion | PriorityQueueElement,
    priority = 1
  ) {
    if (isPriorityQueueElement(value)) {
      this.conditionalPush(value.value, value.priority);
    } else if (isString(value)) {
      if (!await this.storage.has(value)) {
        this.storage.set(value, new Date().getTime());
        this.storage.push(this.queueKey, value, priority);
      }
    } else if (isUrl(value)) {
      debugger;
      this.storage.push(this.queueKey, value, priority);
    } else {
      // RequestOptions type
      debugger;
      this.storage.push(this.queueKey, value, priority);
    }
  }

  async push(
    value:
      | RequestOptionsUnion
      | RequestArrayOptionsUnion
      | PriorityQueueElement
      | PriorityQueueElement[],
    priority = 1
  ) {
    if (isArray(value)) {
      for (let item of value) {
        await this.conditionalPush(item, priority);
      }
    } else {
      await this.conditionalPush(value, priority);
    }
  }

  pop() {
    return this.storage.pop(this.queueKey);
  }

  has(key: string): Promise<boolean> {
    return this.storage.has(key);
  }

  size() {
    return this.storage.size(this.queueKey);
  }

  quit() {
    return this.storage.quit();
  }
}
