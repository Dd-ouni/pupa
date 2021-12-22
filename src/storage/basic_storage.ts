export interface BasicStorage{
  push: (key: string, value: unknown, priority: number) => Promise<number>;
  pop: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<string | null>;
  get: (key: string) => Promise<string | null>;
  has: (key: string) => Promise<boolean>;
  size: (key: string) => Promise<number>;
}