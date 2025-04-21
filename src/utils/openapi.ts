import { z } from '@hono/zod-openapi';

import { apiEndpointStatuses } from '~/constants/api';

export type ZodSchema =
    // @ts-expect-error zod union expects a generic
    z.ZodUnion | z.AnyZodObject | z.ZodArray<z.AnyZodObject>;

export function jsonContent<T extends ZodSchema>(
    schema: T,
    description: string,
) {
    return {
        content: {
            'application/json': {
                schema,
            },
        },
        description,
    };
}

export function jsonContentRequired<T extends ZodSchema>(
    schema: T,
    description: string,
) {
    return {
        ...jsonContent(schema, description),
        required: true,
    };
}

export function createSuccessMessageObjectSchema(
    exampleMessage: string = 'Hello World',
) {
    return z
        .object({
            status: z.literal(apiEndpointStatuses.success),
            data: z.object({
                message: z.string(),
            }),
        })
        .openapi({
            example: {
                status: apiEndpointStatuses.success,
                data: {
                    message: exampleMessage,
                },
            },
        });
}

export function createErrorMessageJsonObjectSchema(
    exampleMessage: string = 'Hello World',
    exampleStatusCode: number = 500,
) {
    return z
        .object({
            status: z.literal(apiEndpointStatuses.error),
            error: z.object({
                message: z.string(),
                statusCode: z.number(),
            }),
        })
        .openapi({
            example: {
                status: apiEndpointStatuses.error,
                error: {
                    message: exampleMessage,
                    statusCode: exampleStatusCode,
                },
            },
        });
}

export function createErrorSchema<T extends ZodSchema>(schema: T) {
    const { error } = schema.safeParse(
        schema._def.typeName === z.ZodFirstPartyTypeKind.ZodArray ? [] : {},
    );
    return z.object({
        status: z.literal(apiEndpointStatuses.error).openapi({
            example: apiEndpointStatuses.error,
        }),
        error: z.object({
            validationError: z
                .object({
                    issues: z.array(
                        z.object({
                            code: z.string(),
                            path: z.array(z.union([z.string(), z.number()])),
                            message: z.string().optional(),
                        }),
                    ),
                    name: z.string(),
                })
                .openapi({
                    example: error,
                }),
            statusCode: z.number().openapi({
                example: 400,
            }),
        }),
    });
}
