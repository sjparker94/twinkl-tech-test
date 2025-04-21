import type { Schema } from 'hono';

import { OpenAPIHono } from '@hono/zod-openapi';
import { requestId } from 'hono/request-id';

import type { AppBindings, AppOpenAPI } from '~/lib/types';

import { apiEndpointStatuses } from '~/constants/api';
import { HTTP_STATUS_VALUES } from '~/constants/http';
import { notFound, onError } from '~/middlewares/error';
import { pinoLogger } from '~/middlewares/logger';

export function createRouter() {
    return new OpenAPIHono<AppBindings>({
        strict: false,
        defaultHook: (result, c) => {
            if (!result.success) {
                c.var.logger.error(
                    { error: result.error, endpoint: c.req.path },
                    'api_endpoint_validation_error',
                );
                return c.json(
                    {
                        status: apiEndpointStatuses.error,
                        error: {
                            validationError: result.error,
                            statusCode: HTTP_STATUS_VALUES.BAD_REQUEST.code,
                        },
                    },
                    HTTP_STATUS_VALUES.BAD_REQUEST.code,
                );
            }
        },
    });
}

export function createApp() {
    const app = createRouter();
    app.use(requestId()).use(pinoLogger());

    // default not found route handler
    app.notFound(notFound);

    // error handler
    app.onError(onError);

    return app;
}

export function createTestApp<S extends Schema>(router: AppOpenAPI<S>) {
    return createApp().route('/', router);
}
