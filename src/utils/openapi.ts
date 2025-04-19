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
