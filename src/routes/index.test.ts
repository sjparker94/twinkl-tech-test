import { testClient } from 'hono/testing';
import { describe, expect, it } from 'vitest';

import { apiEndpointStatuses } from '~/constants/api';
import { HTTP_STATUS_VALUES } from '~/constants/http';
import { createTestApp } from '~/lib/create-app';

import { indexRouter } from './index.route';

const client = testClient(createTestApp(indexRouter));

describe('indexRouter', () => {
    it('should return 200 OK', async () => {
        const response = await client.index.$get();

        expect(response.status).toBe(HTTP_STATUS_VALUES.OK.code);
        const json = await response.json();
        expect(json).toEqual({
            status: apiEndpointStatuses.success,
            data: {
                message: 'Twinkle tech test API',
            },
        });
    });
    it('should return 404 for any other route', async () => {
        // @ts-expect-error testing not found route
        const response = await client.index['not-found'].$get();

        expect(response.status).toBe(HTTP_STATUS_VALUES.NOT_FOUND.code);

        const json = await response.json();
        expect(json).toEqual({
            status: apiEndpointStatuses.error,
            error: {
                message: `${HTTP_STATUS_VALUES.NOT_FOUND.message} - /index/not-found`,
                statusCode: HTTP_STATUS_VALUES.NOT_FOUND.code,
            },
        });
    });
});
