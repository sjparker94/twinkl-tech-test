import antfu from '@antfu/eslint-config';

export default antfu(
    {
        type: 'app',
        typescript: true,
        formatters: true,
        stylistic: {
            indent: 4,
            semi: true,
            quotes: 'single',
        },
        // Database migrations are not part of the codebase to be linted
        ignores: ['**/migrations/*', 'node_modules', 'dist'],
    },
    {
        rules: {
            'no-console': ['warn'],
            'antfu/no-top-level-await': ['off'],
            // This prevents using `process.env` directly in the code
            // There is a zod validated variable for env variables
            'node/prefer-global/process': ['off'],
            'node/no-process-env': ['error'],

            'perfectionist/sort-imports': [
                'error',
                {
                    tsconfigRootDir: '.',
                },
            ],
            'unicorn/filename-case': [
                'error',
                {
                    case: 'kebabCase',
                    ignore: ['README.md'],
                },
            ],
            'style/operator-linebreak': 'off',
        },
    },
);
