import { createRouter } from '~/lib/create-app';
import * as handlers from '~/routes/users/users.handlers';
import * as routes from '~/routes/users/users.routes';

export const usersRouter = createRouter()
    .openapi(routes.create, handlers.create)
    .openapi(routes.getOne, handlers.getOne);
