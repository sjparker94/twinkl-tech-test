import { createRoute, z } from '@hono/zod-openapi';

import { apiEndpointStatuses } from '~/constants/api';
import { HTTP_STATUS_VALUES } from '~/constants/http';
import { insertUserSchema, selectUserSchema } from '~/db/schema';
import {
    createErrorMessageJsonObjectSchema,
    createErrorSchema,
    jsonContent,
    jsonContentRequired,
} from '~/utils/openapi';

const tags = ['Users'];

export const create = createRoute({
    path: '/users',
    method: 'post',
    request: {
        body: jsonContentRequired(insertUserSchema, 'The user to create'),
    },
    tags,
    responses: {
        [HTTP_STATUS_VALUES.CREATED.code]: jsonContent(
            z.object({
                status: z.literal(apiEndpointStatuses.success).openapi({
                    example: apiEndpointStatuses.success,
                }),
                data: selectUserSchema,
            }),
            'The created task',
        ),
        [HTTP_STATUS_VALUES.BAD_REQUEST.code]: jsonContent(
            createErrorSchema(insertUserSchema),
            'The validation error(s)',
        ),
        [HTTP_STATUS_VALUES.CONFLICT.code]: jsonContent(
            createErrorMessageJsonObjectSchema(
                `${HTTP_STATUS_VALUES.CONFLICT.message}. The user could not be created. User with these details already exists`,
                HTTP_STATUS_VALUES.CONFLICT.code,
            ),
            'Already exists error',
        ),
        [HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.code]: jsonContent(
            createErrorMessageJsonObjectSchema(
                HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.message,
                HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.code,
            ),
            'Unexpected error',
        ),
    },
});

const idParamsSchema = z.object({
    id: z
        .string()
        .cuid2()
        .openapi({
            param: {
                name: 'id',
                in: 'path',
                required: true,
            },
            required: ['id'],
            example: 'tz4a98xxat96iws9zmbrgj3a',
        }),
});
export const getOne = createRoute({
    path: '/users/{id}',
    method: 'get',
    request: {
        params: idParamsSchema,
    },
    tags,
    responses: {
        [HTTP_STATUS_VALUES.OK.code]: jsonContent(
            z.object({
                status: z.literal(apiEndpointStatuses.success).openapi({
                    example: apiEndpointStatuses.success,
                }),
                data: selectUserSchema,
            }),
            'The requested user',
        ),
        [HTTP_STATUS_VALUES.NOT_FOUND.code]: jsonContent(
            createErrorMessageJsonObjectSchema(
                HTTP_STATUS_VALUES.NOT_FOUND.message,
                HTTP_STATUS_VALUES.NOT_FOUND.code,
            ),
            'User not found',
        ),
        [HTTP_STATUS_VALUES.BAD_REQUEST.code]: jsonContent(
            createErrorSchema(idParamsSchema),
            'Invalid id error',
        ),
        [HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.code]: jsonContent(
            createErrorMessageJsonObjectSchema(
                HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.message,
                HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.code,
            ),
            'Unexpected error',
        ),
    },
});

export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
