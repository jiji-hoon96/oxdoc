/**
 * 사용자 정보를 나타내는 인터페이스
 */
export interface User {
  /** 사용자 고유 ID */
  id: string;
  /** 사용자 이름 */
  name: string;
  /** 이메일 주소 (선택) */
  email?: string;
}

/**
 * API 응답 래퍼 타입
 * @typeParam T - 응답 데이터 타입
 */
export type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

/** HTTP 메서드 열거형 */
export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}
