import type { Schema } from 'hono';

import { OpenAPIHono } from '@hono/zod-openapi';
import { requestId } from 'hono/request-id';

import type { AppBindings, AppOpenAPI } from '~/lib/types';

import { notFound, onError } from '~/middlewares/error';
import { pinoLogger } from '~/middlewares/logger';

export function createRouter() {
    return new OpenAPIHono<AppBindings>({
        strict: false,
        // defaultHook,
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
