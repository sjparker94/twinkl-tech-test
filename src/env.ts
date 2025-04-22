import { z } from 'zod';

const envSchema = z.object({
    APP_NAME: z.string(),
    NODE_ENV: z.enum(['development', 'test', 'production']),
    LOG_LEVEL: z.enum(['silent', 'debug', 'info', 'warn', 'error']),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;

// eslint-disable-next-line node/no-process-env
const { data, error } = envSchema.safeParse(process.env);

if (error) {
    console.error(
        '❌ Invalid environment variables:\n',
        JSON.stringify(error.flatten().fieldErrors, null, 2),
    );
    throw new Error(`Invalid environment variables`);
}

export const env = { ...data };
