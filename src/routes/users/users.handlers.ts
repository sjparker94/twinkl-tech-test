import { LibsqlError } from '@libsql/client';
import bcrypt from 'bcrypt';
import omit from 'just-omit';

import type { AppRouteHandler } from '~/lib/types';

import { apiEndpointStatuses } from '~/constants/api';
import { HTTP_STATUS_VALUES } from '~/constants/http';
import { SALT_ROUNDS } from '~/constants/users';
import { db } from '~/db';
import { user } from '~/db/schema';
import { tryCatch } from '~/utils/try-catch';

import type { CreateRoute, GetOneRoute } from './users.routes';

export const create: AppRouteHandler<CreateRoute> = async (c) => {
    const userToInsert = c.req.valid('json');

    const { data: passwordValue, error: passwordError } = await tryCatch(() =>
        bcrypt.hash(userToInsert.password, SALT_ROUNDS),
    );

    if (passwordError) {
        c.var.logger.error(
            { error: passwordError },
            'hash_user_password_error',
        );
        return c.json(
            {
                status: apiEndpointStatuses.error,
                error: {
                    message: HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.message,
                    statusCode: HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.code,
                },
            },
            HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.code,
        );
    }

    const { data, error } = await tryCatch(() =>
        db
            .insert(user)
            .values({ ...userToInsert, password: passwordValue })
            .returning({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                type: user.type,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }),
    );

    // User already exists case
    if (
        error instanceof LibsqlError &&
        error.code === 'SQLITE_CONSTRAINT_UNIQUE'
    ) {
        c.var.logger.warn(
            // dont log the password
            { userToInsert: omit(userToInsert, ['password']) },
            'duplicate_user_create_error',
        );
        return c.json(
            {
                status: apiEndpointStatuses.error,
                error: {
                    message: `${HTTP_STATUS_VALUES.CONFLICT.message}. The user could not be created. User with these details already exists`,
                    statusCode: HTTP_STATUS_VALUES.CONFLICT.code,
                },
            },
            HTTP_STATUS_VALUES.CONFLICT.code,
        );
    }

    if (error) {
        c.var.logger.error({ error }, 'create_user_db_error');
        return c.json(
            {
                status: apiEndpointStatuses.error,
                error: {
                    message: `${HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.message}`,
                    statusCode: HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.code,
                },
            },
            HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.code,
        );
    }

    const [inserted] = data;
    return c.json(
        {
            status: apiEndpointStatuses.success,
            data: inserted,
        },
        HTTP_STATUS_VALUES.CREATED.code,
    );
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
    const { id } = c.req.valid('param');

    const { data: dbUser, error } = await tryCatch(() =>
        db.query.user.findFirst({
            where(fields, operators) {
                return operators.eq(fields.id, id);
            },
        }),
    );

    if (error) {
        c.var.logger.error({ error }, 'get_user_db_error');
        return c.json(
            {
                status: apiEndpointStatuses.error,
                error: {
                    message: HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.message,
                    statusCode: HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.code,
                },
            },
            HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.code,
        );
    }

    if (!dbUser) {
        c.var.logger.info({ idToFind: id }, 'user_not_found_error');
        return c.json(
            {
                status: apiEndpointStatuses.error,
                error: {
                    message: HTTP_STATUS_VALUES.NOT_FOUND.message,
                    statusCode: HTTP_STATUS_VALUES.NOT_FOUND.code,
                },
            },
            HTTP_STATUS_VALUES.NOT_FOUND.code,
        );
    }

    c.var.logger.debug({ user: dbUser }, 'user_found');
    c.var.logger.info('get_one_user_success');
    return c.json(
        {
            status: apiEndpointStatuses.success,
            data: dbUser,
        },
        HTTP_STATUS_VALUES.OK.code,
    );
};
