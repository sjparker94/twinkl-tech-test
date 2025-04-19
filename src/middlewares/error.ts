import type { ErrorHandler, NotFoundHandler } from 'hono';

import type { StatusCode } from '~/constants/http';

import { HTTP_STATUS_VALUES } from '~/constants/http';
import { env } from '~/env';

export const onError: ErrorHandler = (err, c) => {
    const currentStatus
        = 'status' in err ? err.status : c.newResponse(null).status;
    const statusCode
        = currentStatus !== 200
            ? (currentStatus as StatusCode)
            : HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.code;

    return c.json(
        {
            message: err.message,
            stack: env.NODE_ENV === 'production' ? undefined : err.stack,
        },
        statusCode,
    );
};

export const notFound: NotFoundHandler = (c) => {
    return c.json(
        {
            message: `${HTTP_STATUS_VALUES.NOT_FOUND.message} - ${c.req.path}`,
            statusCode: HTTP_STATUS_VALUES.NOT_FOUND.code,
        },
        HTTP_STATUS_VALUES.NOT_FOUND.code,
    );
};
