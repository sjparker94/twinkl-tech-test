import type { ObjectValues } from '~/types/utils';

export const apiEndpointStatuses = {
    success: 'success',
    error: 'error',
} as const;

export type ApiEndpointStatus = ObjectValues<typeof apiEndpointStatuses>;
