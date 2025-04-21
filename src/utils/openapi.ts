import { z } from '@hono/zod-openapi';

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

export function createMessageObjectSchema(
    exampleMessage: string = 'Hello World',
) {
    return z
        .object({
            message: z.string(),
        })
        .openapi({
            example: {
                message: exampleMessage,
            },
        });
}

export function createErrorMessageJsonObjectSchema(
    exampleMessage: string = 'Hello World',
    exampleStatusCode: number = 500,
) {
    return z
        .object({
            message: z.string(),
            statusCode: z.number(),
        })
        .openapi({
            example: {
                message: exampleMessage,
                statusCode: exampleStatusCode,
            },
        });
}

export function createErrorSchema<T extends ZodSchema>(schema: T) {
    const { error } = schema.safeParse(
        schema._def.typeName === z.ZodFirstPartyTypeKind.ZodArray ? [] : {},
    );
    return z.object({
        success: z.boolean().openapi({
            example: false,
        }),
        error: z
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
    });
}
