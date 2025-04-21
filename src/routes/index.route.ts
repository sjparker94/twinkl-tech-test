import { createRoute } from '@hono/zod-openapi';

import { apiEndpointStatuses } from '~/constants/api';
import { HTTP_STATUS_VALUES } from '~/constants/http';
import { createRouter } from '~/lib/create-app';
import { createSuccessMessageObjectSchema, jsonContent } from '~/utils/openapi';

export const indexRouter = createRouter().openapi(
    createRoute({
        tags: ['Index'],
        method: 'get',
        path: '/',
        responses: {
            [HTTP_STATUS_VALUES.OK.code]: jsonContent(
                createSuccessMessageObjectSchema('Twinkle tech test API'),
                'Twinkl tech test API index',
            ),
        },
    }),
    (c) => {
        return c.json(
            {
                status: apiEndpointStatuses.success,
                data: {
                    message: 'Twinkle tech test API',
                },
            },
            HTTP_STATUS_VALUES.OK.code,
        );
    },
);
