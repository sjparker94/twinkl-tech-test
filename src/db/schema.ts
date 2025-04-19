import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';
import {
    integer,
    sqliteTable,
    text,
    uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

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
        }).$type<UserType>(),
        createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
            () => new Date(),
        ),
        updatedAt: integer('updated_at', { mode: 'timestamp' })
            .$defaultFn(() => new Date())
            .$onUpdate(() => new Date()),
    },
    (table) => {
        return [uniqueIndex('emailUniqueIndex').on(sql`lower(${table.email})`)];
    },
);

export const selectUserSchema = createSelectSchema(user).omit({
    password: true,
});

export const insertUserSchema = createInsertSchema(user, {
    firstName: (schema) => {
        return schema.min(1).max(500);
    },
    lastName: (schema) => {
        return schema.min(1).max(500);
    },
    email: (schema) => {
        return schema.email();
    },
    type: z.nativeEnum(USER_TYPES),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
