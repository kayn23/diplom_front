import { FetchError, FetchOptions, MappedResponseType, ofetch } from 'ofetch';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { BASE_URL } from 'shared/const/api';
import { getUserToken } from '../model/selectors/getUserToken';
import { useAppDispatch } from 'shared/lib/hooks/useAppDispatch';
import { userActions } from '../model/slice/userSlice';

type FetchRequest = RequestInfo;
interface ResponseMap {
  blob: Blob;
  text: string;
  arrayBuffer: ArrayBuffer;
  stream: ReadableStream<Uint8Array>;
}
type ResponseType = keyof ResponseMap | 'json';
type ofetch<T = never, R extends ResponseType = 'json'> = (
  request: FetchRequest,
  options?: FetchOptions<R>
) => Promise<MappedResponseType<R, T>>;

export const useFetch = <E = string>() => {
  const [isLoading, setIsLoading] = useState(false);
  const token = useSelector(getUserToken);
  const dispatch = useAppDispatch();
  const [error, setError] = useState<E>();

  const onClearError = useCallback(() => {
    setError(undefined);
  }, []);

  const request = useCallback(
    async <T = never, R extends ResponseType = 'json'>(request: string, options?: FetchOptions<R>) => {
      if (!token) throw new Error('User authentication data not found');

      onClearError();
      setIsLoading(true);
      return ofetch<T, R>(`${BASE_URL}${request}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        ...options,
      })
        .then((res) => res)
        .catch((err) => {
          if (err instanceof FetchError) {
            switch (err.statusCode) {
              case 401:
                dispatch(userActions.logout());
                setError(err.data.errors);
                break;
              case 403:
                setError('forbidden' as E);
                break;
              case 422:
                setError(err.data.errors);
                break;
              default:
                setError(err.data.errors);
            }
          } else {
            setError(err);
          }
          throw err;
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [token, onClearError, dispatch]
  );

  return {
    request,
    isLoading,
    error,
    onClearError,
  };
};
