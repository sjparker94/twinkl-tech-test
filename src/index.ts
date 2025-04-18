// import { env } from '~/env.js';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import { env } from '~/env';

const app = new Hono();

app.get('/', (c) => {
    return c.text('Hello World!');
});

serve(
    {
        fetch: app.fetch,
        port: env.PORT,
    },
    (info) => {
        // eslint-disable-next-line no-console
        console.log(`Server is running on http://localhost:${info.port}`);
    },
);
