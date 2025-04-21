import { z } from '@hono/zod-openapi';
import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';
import {
    integer,
    sqliteTable,
    text,
    uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import type { ObjectValues } from '~/types/utils';

export const USER_TYPES = {
    student: 'student',
    teacher: 'teacher',
    parent: 'parent',
    private_tutor: 'private_tutor',
} as const;

export type UserType = ObjectValues<typeof USER_TYPES>;

export const user = sqliteTable(
    'user',
    {
        id: text('id', { mode: 'text' })
            .$defaultFn(() => createId())
            .primaryKey(),
        firstName: text('first_name', { mode: 'text' }).notNull(),
        lastName: text('last_name', { mode: 'text' }).notNull(),
        email: text('email', { mode: 'text' }).notNull(),
        password: text('password', { mode: 'text' }).notNull(),
        type: text('type', {
            mode: 'text',
        })
            .$type<UserType>()
            .notNull(),
        createdAt: integer('created_at', { mode: 'timestamp' })
            .$defaultFn(() => new Date())
            .notNull(),
        updatedAt: integer('updated_at', { mode: 'timestamp' })
            .$defaultFn(() => new Date())
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => {
        return [uniqueIndex('emailUniqueIndex').on(sql`lower(${table.email})`)];
    },
);

export const selectUserSchema = createSelectSchema(user)
    .omit({
        password: true,
    })
    .openapi('user', {
        example: {
            id: 'tz4a98xxat96iws9zmbrgj3a',
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@example.com',
            type: 'student',
            createdAt: new Date('2023-10-01T00:00:00.000Z'),
            updatedAt: new Date('2023-10-01T00:00:00.000Z'),
        },
    });

export const insertUserSchema = createInsertSchema(user, {
    firstName: (schema) => {
        return schema
            .min(1, 'First name is a required field')
            .max(500, 'First name can not be longer than 500 characters')
            .trim()
            .openapi({ example: 'John' });
    },
    lastName: (schema) => {
        return schema
            .min(1, 'Last name is a required field')
            .max(500, 'Last name can not be longer than 500 characters')
            .trim()
            .openapi({ example: 'Doe' });
    },
    email: (schema) => {
        return schema
            .email('Please provide a valid email address')
            .trim()
            .toLowerCase()
            .openapi({ example: 'johndoe@example.com' });
    },
    type: z.nativeEnum(USER_TYPES).openapi({ example: USER_TYPES.student }),
    // Password schema but the password will be hashed before being stored
    // This is just for validation on the API endpoint
    password: (schema) => {
        return (
            schema
                .min(8, 'The password must be at least 8 characters long')
                .max(64, 'The password must be at most 64 characters long')
                // At least one digit, one lowercase letter, and one uppercase letter
                .regex(
                    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).+$/,
                    'The password must contain at least one digit, one lowercase letter, and one uppercase letter',
                )
                .openapi({
                    example: 'P@ssword123',
                })
        );
    },
})
    // Items not required when creating as they wil be generated in the DB
    .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
    });
