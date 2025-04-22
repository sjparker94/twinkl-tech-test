import { createApp } from '~/lib/create-app';
import { configureOpenAPI } from '~/lib/open-api';

import { indexRouter } from './routes/index.route';
import { usersRouter } from './routes/users/users.index';

const app = createApp();

configureOpenAPI(app);

const routes = [indexRouter, usersRouter] as const;

for (const route of routes) {
    app.route('/api', route);
}

export type AppType = (typeof routes)[number];

export { app };
