// 400: bad request
export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// 401: unauthorized
export class UserNotAuthenticatedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// 403: forbidden
export class UserForbiddenError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// 404: not found
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}