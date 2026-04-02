import { useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';

export interface OptimisticUpdateOptions<TData, TVariables, TContext> {
  queryKey: QueryKey;
  mutationFn: (variables: TVariables) => Promise<TData>;
  onMutate?: (variables: TVariables) => TContext | undefined;
  onError?: (error: Error, variables: TVariables, context: TContext | undefined) => void;
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables, context: TContext | undefined) => void;
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void;
}

export interface UndoOptions {
  timeout?: number;
  message?: string;
}

export function useOptimisticMutation<TData = unknown, TVariables = unknown, TContext = unknown>({
  queryKey,
  mutationFn,
  onMutate,
  onError,
  onSettled,
  onSuccess,
}: OptimisticUpdateOptions<TData, TVariables, TContext>) {
  const queryClient = useQueryClient();
  const contextRef = useRef<TContext | undefined>();

  const mutation = useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      contextRef.current = onMutate?.(variables);

      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context && 'previousData' in context) {
        queryClient.setQueryData(queryKey, (context as { previousData: unknown }).previousData);
      }
      onError?.(error, variables, contextRef.current);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey });
      onSettled?.(data, error, variables, contextRef.current);
    },
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, contextRef.current);
    },
  });

  return mutation;
}

export function useBulkOptimisticUpdate<TData = unknown>(queryKey: QueryKey) {
  const queryClient = useQueryClient();

  const updateMultiple = useCallback(
    async (ids: string[], updateFn: (item: TData) => TData) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<TData[]>(queryKey);

      if (previousData) {
        queryClient.setQueryData<TData[]>(
          queryKey,
          previousData.map((item) => {
            const itemWithId = item as { id: string };
            if (ids.includes(itemWithId.id)) {
              return updateFn(item);
            }
            return item;
          })
        );
      }

      return previousData;
    },
    [queryClient, queryKey]
  );

  const revertUpdate = useCallback(
    (previousData: TData[] | undefined) => {
      if (previousData) {
        queryClient.setQueryData(queryKey, previousData);
      }
    },
    [queryClient, queryKey]
  );

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return { updateMultiple, revertUpdate, invalidate };
}

export function useUndoableMutation<TData = unknown, TVariables = void>({
  queryKey,
  mutationFn,
  undoTimeout = 5000,
}: {
  queryKey: QueryKey;
  mutationFn: (variables: TVariables) => Promise<TData>;
  undoTimeout?: number;
}) {
  const queryClient = useQueryClient();
  const undoStackRef = useRef<Array<{
    previousData: unknown;
    timeout: ReturnType<typeof setTimeout>;
    variables: TVariables;
  }>>([]);

  const mutation = useMutation({
    mutationFn: async (variables: TVariables) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      const result = await mutationFn(variables);
      await queryClient.invalidateQueries({ queryKey });
      return { result, previousData };
    },
  });

  const performWithUndo = useCallback(
    async (variables: TVariables, onSuccess?: () => void) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      const timeout = setTimeout(async () => {
        undoStackRef.current = undoStackRef.current.filter(
          (item) => item.timeout !== timeout
        );
        await queryClient.invalidateQueries({ queryKey });
      }, undoTimeout);

      undoStackRef.current.unshift({ previousData, timeout, variables });

      try {
        await mutation.mutateAsync(variables);
        onSuccess?.();
      } catch {
        if (previousData) {
          queryClient.setQueryData(queryKey, previousData);
        }
        clearTimeout(timeout);
        undoStackRef.current = undoStackRef.current.filter(
          (item) => item.timeout !== timeout
        );
      }
    },
    [queryClient, queryKey, mutation, undoTimeout]
  );

  const undo = useCallback((index = 0) => {
    if (undoStackRef.current.length > index) {
      const item = undoStackRef.current[index];
      clearTimeout(item.timeout);
      queryClient.setQueryData(queryKey, item.previousData);
      undoStackRef.current.splice(index, 1);
      return true;
    }
    return false;
  }, [queryClient, queryKey]);

  const getUndoStack = useCallback(() => {
    return undoStackRef.current.map((item) => ({
      variables: item.variables,
      remainingTime: undoTimeout,
    }));
  }, [undoTimeout]);

  return {
    ...mutation,
    performWithUndo,
    undo,
    getUndoStack,
    hasUndo: undoStackRef.current.length > 0,
  };
}
