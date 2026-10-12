export function serverResponse<T>(data: T, message: string, status = 200) {
  return { data, status, message };
}
