export interface PlatformResponse {
  code: number;
}

export function Response(code: number): PlatformResponse {
  return {
    code,
  };
}
