export interface BasicStorage{
  push: (key: string, value: object, priority: number) => Promise<number>;
  pop: (key: string) => Promise<unknown>;
  set: (key: string, value: object) => Promise<string | null>;
  get: (key: string) => Promise<string | null>;
}