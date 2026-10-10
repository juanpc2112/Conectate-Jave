export class ServerResponse<T> {
  constructor(
    public readonly data: T | null,
    public readonly status: number,
    public readonly message: string,
  ) {}
}
