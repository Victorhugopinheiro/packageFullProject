

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(`${message} (${status})`);
    this.status = status;
  }
}



