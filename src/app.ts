import { createApp } from '~/lib/create-app';
import { configureOpenAPI } from '~/lib/open-api';

const app = createApp();

configureOpenAPI(app);

const routes = [
    // add user routes here
] as const;

for (const route of routes) {
    app.route('/', route);
}

export type AppType = (typeof routes)[number];

export { app };
