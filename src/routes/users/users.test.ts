import { createId } from '@paralleldrive/cuid2';
import bcrypt from 'bcrypt';
import { testClient } from 'hono/testing';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    expectTypeOf,
    it,
    vi,
} from 'vitest';

import { apiEndpointStatuses } from '~/constants/api';
import { HTTP_STATUS_VALUES } from '~/constants/http';
import { db } from '~/db';
import { USER_TYPES } from '~/db/schema';
import { createTestApp } from '~/lib/create-app';

import { usersRouter } from './users.index';

const client = testClient(createTestApp(usersRouter));

describe('usersRouter', () => {
    beforeAll(async () => {
        // spin up the test database
        // this will create a test.db file in the root of the project if it doesn't exist
        execSync('npx drizzle-kit push');
    });

    // remove the database after the run
    afterAll(async () => {
        fs.rmSync('test.db', { force: true });
    });

    let testUserId: string;
    it('endpoint: POST /users creates a user', async () => {
        const response = await client.users.$post({
            json: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'johndoe@example.com',
                password: 'Password123',
                type: USER_TYPES.student,
            },
        });
        expect(response.status).toBe(HTTP_STATUS_VALUES.CREATED.code);
        if (response.status === HTTP_STATUS_VALUES.CREATED.code) {
            const json = await response.json();
            expect(json.status).equal(apiEndpointStatuses.success);
            expectTypeOf(json.data.id).toBeString();
            expect(json.data.firstName).toBe('John');
            expect(json.data.lastName).toBe('Doe');
            expect(json.data.email).toBe('johndoe@example.com');
            expect(json.data.type).toBe(USER_TYPES.student);
            expect(json.data).toHaveProperty('createdAt');
            expect(json.data).toHaveProperty('updatedAt');
            testUserId = json.data.id;
        }
    });

    // tests if the email is lowercased, password is hashed and the user is created
    it('endpoint: POST /users creates a task and formats the data in the database', async () => {
        // create a user with uppercase email and untrimmed strings
        const response = await client.users.$post({
            json: {
                firstName: '  Another  ',
                lastName: '  Test  ',
                email: '  TESTingEMAIL@example.com ',
                password: 'Password123',
                type: USER_TYPES.teacher,
            },
        });
        expect(response.status).toBe(HTTP_STATUS_VALUES.CREATED.code);
        if (response.status === HTTP_STATUS_VALUES.CREATED.code) {
            const json = await response.json();
            expect(json.status).equal(apiEndpointStatuses.success);
            expect(json.data.firstName).toBe('Another');
            expect(json.data.lastName).toBe('Test');
            expect(json.data.email).toBe('testingemail@example.com');
        }
    });

    // 400 with the correct validation message
    it('endpoint: POST /users validates the body of the message', async () => {
        // create a user with invalid body
        const response = await client.users.$post({
            json: {
                // firstName: '',
                lastName:
                    'non veniam Lorem dolor ex do laboris ut ut id enim commodo eu incididunt ex aute qui dolore minim exercitation consectetur voluptate dolor sit qui sunt laborum exercitation reprehenderit culpa labore culpa labore voluptate aliqua cupidatat ad enim consectetur non nulla ullamco enim in deserunt aliquip magna et qui dolor irure sint dolore deserunt sit pariatur nisi exercitation commodo duis aliquip in eu anim reprehenderit pariatur esse deserunt aute voluptate enim duis ullamco quis excepteur id irure aliqua aute amet cupidatat esse ex exercitation quis proident eu laborum occaecat sunt do amet enim sint aliquip minim fugiat dolore exercitation nulla',
                email: 'not an email address',
                password: 'Password123',
                // @ts-expect-error invalid body
                type: 'something else',
            },
        });
        expect(response.status).toBe(400);
        if (response.status === 400) {
            const json = await response.json();
            expect(json.status).equal(apiEndpointStatuses.error);
            expect(json.error.statusCode).equal(
                HTTP_STATUS_VALUES.BAD_REQUEST.code,
            );

            expect(json.error.validationError.issues.length).toBe(4);

            for (const issue of json.error.validationError.issues) {
                expect(issue).toHaveProperty('path');
                expect(issue).toHaveProperty('message');
            }

            expect(json.error.validationError.issues[0].path).toEqual([
                'firstName',
            ]);
            expect(json.error.validationError.issues[0].code).toEqual(
                'invalid_type',
            );
            expect(json.error.validationError.issues[1].path).toEqual([
                'lastName',
            ]);
            expect(json.error.validationError.issues[1].code).toEqual(
                'too_big',
            );
            expect(json.error.validationError.issues[2].path).toEqual([
                'email',
            ]);
            expect(json.error.validationError.issues[2].code).toEqual(
                'invalid_string',
            );
            expect(json.error.validationError.issues[3].path).toEqual(['type']);
            expect(json.error.validationError.issues[3].code).toEqual(
                'invalid_enum_value',
            );
        }
    });

    it('endpoint: POST /users validates the password property of the body of the message correctly', async () => {
        // create a user with invalid body

        // too short
        const response1 = await client.users.$post({
            json: {
                firstName: 'Some',
                lastName: 'Tester',
                email: 'tester@example.com ',
                password: '123',
                type: USER_TYPES.student,
            },
        });

        // too long
        const response2 = await client.users.$post({
            json: {
                firstName: 'Some',
                lastName: 'Tester',
                email: 'tester@example.com ',
                password:
                    'Loremipsumdolorsitamet,consecteturadipiscingelit,seddoeiusmod23dd', // 65 characters
                type: USER_TYPES.student,
            },
        });

        // too weak
        const response3 = await client.users.$post({
            json: {
                firstName: 'Some',
                lastName: 'Tester',
                email: 'tester@example.com ',
                password: 'PasswordwithoutNumber',
                type: USER_TYPES.student,
            },
        });

        expect(response1.status).toBe(400);
        expect(response2.status).toBe(400);
        expect(response3.status).toBe(400);

        if (response1.status === 400) {
            const json = await response1.json();
            expect(json.error.validationError.issues[0].message).toBe(
                'The password must be at least 8 characters long',
            );
        }
        if (response2.status === 400) {
            const json = await response2.json();
            expect(json.error.validationError.issues[0].message).toBe(
                'The password must be at most 64 characters long',
            );
        }
        if (response3.status === 400) {
            const json = await response3.json();
            expect(json.error.validationError.issues[0].message).toBe(
                'The password must contain at least one digit, one lowercase letter, and one uppercase letter',
            );
        }
    });

    // 409 with the correct response message
    it('endpoint: POST /users prevents duplicate users being created based on email address', async () => {
        // duplicate from a previous test - must be after the first test
        const response = await client.users.$post({
            json: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'johndoe@example.com',
                password: 'Password123',
                type: USER_TYPES.student,
            },
        });
        expect(response.status).toBe(HTTP_STATUS_VALUES.CONFLICT.code);
        if (response.status === HTTP_STATUS_VALUES.CONFLICT.code) {
            const json = await response.json();
            expect(json.status).equal(apiEndpointStatuses.error);
            expect(json.error.statusCode).equal(
                HTTP_STATUS_VALUES.CONFLICT.code,
            );
            expect(json.error.message).equal(
                `${HTTP_STATUS_VALUES.CONFLICT.message}. The user could not be created. User with these details already exists`,
            );
        }
    });

    // 500 with correct response message
    it('endpoint: POST /users responds with an internal server error if password hashing fails', async () => {
        const passwordHashSpy = vi.spyOn(bcrypt, 'hash');

        // mock bcrypt to throw an error
        passwordHashSpy.mockRejectedValueOnce(() => {
            throw new Error('bcrypt error');
        });

        const response = await client.users.$post({
            json: {
                firstName: 'New',
                lastName: 'User',
                email: 'unique_user_1@example.com',
                password: 'Password123',
                type: USER_TYPES.student,
            },
        });

        expect(response.status).toBe(
            HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.code,
        );
        if (response.status === HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.code) {
            const json = await response.json();
            expect(json.status).equal(apiEndpointStatuses.error);
            expect(json.error.statusCode).equal(
                HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.code,
            );
            expect(json.error.message).equal(
                HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.message,
            );
        }
    });

    // 500 with correct response message
    it('endpoint: POST /users responds with an internal server error if database fails to insert', async () => {
        const dbSpy = vi.spyOn(db, 'insert');

        // mock db insert to throw an error
        dbSpy.mockRejectedValueOnce(() => {
            throw new Error('db error');
        });

        const response = await client.users.$post({
            json: {
                firstName: 'New',
                lastName: 'User',
                email: 'unique_user_1@example.com',
                password: 'Password123',
                type: USER_TYPES.student,
            },
        });

        expect(response.status).toBe(
            HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.code,
        );
        if (response.status === HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.code) {
            const json = await response.json();
            expect(json.status).equal(apiEndpointStatuses.error);
            expect(json.error.statusCode).equal(
                HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.code,
            );
            expect(json.error.message).equal(
                HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.message,
            );
        }
    });

    // must come after the create tests
    it('endpoint: GET /users/{id} returns a user when a valid id is passed', async () => {
        const response = await client.users[':id'].$get({
            param: {
                // id from a pervious successful create test
                id: testUserId,
            },
        });

        expect(response.status).toBe(HTTP_STATUS_VALUES.OK.code);
        if (response.status === HTTP_STATUS_VALUES.OK.code) {
            const json = await response.json();
            expect(json.status).equal(apiEndpointStatuses.success);
            expectTypeOf(json.data.id).toBeString();
            expect(json.data.firstName).toBe('John');
            expect(json.data.lastName).toBe('Doe');
            expect(json.data.email).toBe('johndoe@example.com');
            expect(json.data.type).toBe(USER_TYPES.student);
            expect(json.data).toHaveProperty('createdAt');
            expect(json.data).toHaveProperty('updatedAt');
        }
    });

    it('endpoint: GET /users/{id} returns an internal server error if database query fails', async () => {
        const dbSpy = vi.spyOn(db.query.user, 'findFirst');

        // mock db insert to throw an error
        dbSpy.mockRejectedValueOnce(() => {
            throw new Error('db error');
        });

        const response = await client.users[':id'].$get({
            param: {
                // id from a pervious successful create test
                id: testUserId,
            },
        });

        expect(response.status).toBe(
            HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.code,
        );
        if (response.status === HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.code) {
            const json = await response.json();
            expect(json.status).equal(apiEndpointStatuses.error);
            expect(json.error.statusCode).equal(
                HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.code,
            );
            expect(json.error.message).equal(
                HTTP_STATUS_VALUES.INTERNAL_SERVER_ERROR.message,
            );
        }
    });

    it('endpoint: GET /users/{id} returns a not found error if the id passed in does not exist in the database', async () => {
        const response = await client.users[':id'].$get({
            param: {
                id: createId(), // random id
            },
        });

        expect(response.status).toBe(HTTP_STATUS_VALUES.NOT_FOUND.code);
        if (response.status === HTTP_STATUS_VALUES.NOT_FOUND.code) {
            const json = await response.json();
            expect(json.status).equal(apiEndpointStatuses.error);
            expect(json.error.statusCode).equal(
                HTTP_STATUS_VALUES.NOT_FOUND.code,
            );
            expect(json.error.message).equal(
                HTTP_STATUS_VALUES.NOT_FOUND.message,
            );
        }
    });

    it('endpoint: GET /users/{id} returns a bad request error if the id passed in is invalid', async () => {
        const response = await client.users[':id'].$get({
            param: {
                id: 'not-a-valid-id',
            },
        });

        expect(response.status).toBe(HTTP_STATUS_VALUES.BAD_REQUEST.code);
        if (response.status === HTTP_STATUS_VALUES.BAD_REQUEST.code) {
            const json = await response.json();
            expect(json.status).equal(apiEndpointStatuses.error);
            expect(json.error.statusCode).equal(
                HTTP_STATUS_VALUES.BAD_REQUEST.code,
            );
            expect(json.error.validationError.issues[0].message).toBe(
                'Invalid id provided',
            );
        }
    });
});
