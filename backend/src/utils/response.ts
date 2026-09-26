export type ApiSuccessResponse<T> = {
  success: true;
  message?: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  error: {
    code: string;
  };
};

export const sendSuccess = <T>(data: T, message?: string): ApiSuccessResponse<T> => ({
  success: true,
  ...(message ? { message } : {}),
  data,
});

export const sendError = (message: string, code: string): ApiErrorResponse => ({
  success: false,
  message,
  error: { code },
});
