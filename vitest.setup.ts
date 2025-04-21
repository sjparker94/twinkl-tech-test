import { env } from '~/env';

if (env.NODE_ENV !== 'test') {
    throw new Error(`NODE_ENV must be set to 'test' when running the tests`);
}
