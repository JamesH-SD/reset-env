export interface IRepository<T> {
  getById(id: string): Promise<T>;
  getAll(): Promise<T[]>;
  create(item: T): Promise<T>;
  update(item: T): Promise<T>;
  delete(id: string): Promise<T>;
}
