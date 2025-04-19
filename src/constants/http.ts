// Add more as and when needed
export const HTTP_STATUS_VALUES = {
    OK: {
        code: 200,
        message: 'OK',
    },
    CREATED: {
        code: 201,
        message: 'Created',
    },
    NOT_FOUND: {
        code: 404,
        message: 'Not Found',
    },
    BAD_REQUEST: {
        code: 400,
        message: 'Bad Request',
    },
    UNAUTHORIZED: {
        code: 401,
        message: 'Unauthorized',
    },
    FORBIDDEN: {
        code: 403,
        message: 'Forbidden',
    },
    INTERNAL_SERVER_ERROR: {
        code: 500,
        message: 'Internal Server Error',
    },
} as const;

export type StatusCode =
    (typeof HTTP_STATUS_VALUES)[keyof typeof HTTP_STATUS_VALUES]['code'];
