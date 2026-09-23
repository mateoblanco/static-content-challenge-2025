export class HttpError extends Error {
    constructor(
      public readonly status: number,
      message: string,
    ) {
      super(message);
      this.name = 'HttpError';
    }
  }
  
  export class NotFoundError extends HttpError {
    constructor(message = 'Not found') {
      super(404, message);
      this.name = 'NotFoundError';
    }
  }