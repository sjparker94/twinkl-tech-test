import { createRoute } from '@hono/zod-openapi';

import { HTTP_STATUS_VALUES } from '~/constants/http';
import { createRouter } from '~/lib/create-app';
import { createMessageObjectSchema, jsonContent } from '~/utils/openapi';

export const indexRouter = createRouter().openapi(
    createRoute({
        tags: ['Index'],
        method: 'get',
        path: '/',
        responses: {
            [HTTP_STATUS_VALUES.OK.code]: jsonContent(
                createMessageObjectSchema('Twinkle tech test API'),
                'Twinkl tech test API index',
            ),
        },
    }),
    (c) => {
        return c.json(
            {
                message: 'Twinkle tech test API',
            },
            HTTP_STATUS_VALUES.OK.code,
        );
    },
);
