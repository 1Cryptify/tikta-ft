import { apiPost, apiGet, endpoints, ApiResponse } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ConfirmLoginRequest {
  email: string;
  code: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  company_id?: string;
  is_staff?: boolean;
}

export interface ConfirmUserCreationRequest {
  email: string;
  code: string;
}

export interface ActivateUserRequest {
  email: string;
  code: string;
}

export interface ResendConfirmationCodeRequest {
  email: string;
}

export interface SetActiveCompanyRequest {
  company_id: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  is_verified: boolean;
  is_blocked: boolean;
  active_company?: {
    id: string;
    name: string;
    is_verified: boolean;
    is_blocked: boolean;
    is_deleted: boolean;
  };
}

export const authService = {
  login: (data: LoginRequest) =>
    apiPost<ApiResponse>(endpoints.auth.login, data),

  confirmLogin: (data: ConfirmLoginRequest) =>
    apiPost<ApiResponse>(endpoints.auth.confirmLogin, data),

  getCurrentUser: () =>
    apiGet<ApiResponse<{ user: CurrentUser }>>(endpoints.auth.getCurrentUser),

  createUser: (data: CreateUserRequest) =>
    apiPost<ApiResponse>(endpoints.auth.createUser, data),

  confirmUserCreation: (data: ConfirmUserCreationRequest) =>
    apiPost<ApiResponse>(endpoints.auth.confirmUserCreation, data),

  activateUser: (data: ActivateUserRequest) =>
    apiPost<ApiResponse>(endpoints.auth.activateUser, data),

  resendConfirmationCode: (data: ResendConfirmationCodeRequest) =>
    apiPost<ApiResponse>(endpoints.auth.resendConfirmationCode, data),

  setActiveCompany: (data: SetActiveCompanyRequest) =>
    apiPost<ApiResponse>(endpoints.auth.setActiveCompany, data),
};
