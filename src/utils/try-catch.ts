/* eslint-disable ts/no-unnecessary-type-constraint */
export type AsyncTuple<
    ErrorType extends any = Error,
    DataType extends any = unknown,
> =
    | {
          error: ErrorType;
          data: null;
      }
    | { error: null; data: DataType };

/**
 * Gracefully handles a given Promise factory.
 * @example
 * const { error, data } = await tryCatch(() => asyncAction())
 */
export async function tryCatch<
    ErrorType extends any = Error,
    DataType extends any = unknown,
>(promise: () => Promise<DataType>): Promise<AsyncTuple<ErrorType, DataType>> {
    try {
        const data = await promise().catch((error) => {
            throw error;
        });
        return { error: null, data };
    } catch (error) {
        return { error: error as ErrorType, data: null };
    }
}
