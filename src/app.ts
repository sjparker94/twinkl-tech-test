import { createApp } from '~/lib/create-app';
import { configureOpenAPI } from '~/lib/open-api';

import { indexRouter } from './routes/index.route';

const app = createApp();

configureOpenAPI(app);

const routes = [
    indexRouter,
    // add user routes here
] as const;

for (const route of routes) {
    app.route('/', route);
}

export type AppType = (typeof routes)[number];

export { app };
