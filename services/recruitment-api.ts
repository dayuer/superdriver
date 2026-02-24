// 招聘货运系统 API 客户端
import { secureFetch } from '../lib/security';
import { BASE_URL } from './api';
import { PaginatedResponse } from '../types';

/**
 * API 错误类 — 包含 HTTP 状态码和响应体
 * 调用方可以 catch 后通过 error.status 做精细判断
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body?: any,
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

/**
 * [P1-001 修复] 封装带 BASE_URL + 响应校验的 API 调用
 * 
 * 之前：response.json() 直接返回，4xx/5xx 错误静默变成脏数据
 * 现在：非 2xx 统一抛 ApiError，调用方必须显式处理错误
 * 
 * @param assertOk 是否校验 response.ok（默认 true）
 *   设为 false 可让调用方自行处理状态码（如 getDriverProfile 404→null）
 */
const secureApiFetch = async (
  endpoint: string,
  options: RequestInit = {},
  assertOk = true,
): Promise<Response> => {
  const response = await secureFetch(`${BASE_URL}${endpoint}`, options);

  if (assertOk && !response.ok) {
    let body: any;
    try {
      body = await response.json();
    } catch {
      // 无法解析 JSON body，用 statusText
    }
    throw new ApiError(response.status, response.statusText, body);
  }

  return response;
};

// ==================== 司机档案类型 ====================

export interface DriverProfile {
  id: string;
  userId: string;
  realName?: string;
  phone: string;
  licenseType: string;
  vehicleType: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  vehicleLength?: number;
  vehicleLoad?: number;
  preferredCities: string[];
  preferredRoutes?: string[];
  workingHours?: string;
  expectedSalary?: number;
  totalOrders: number;
  completedOrders: number;
  rating: number;
  onTimeRate: number;
  isAvailable: boolean;
  isVerified: boolean;
}

export interface JobListing {
  id: string;
  enterpriseId: string;
  title: string;
  description: string;
  requirements: string[];
  city: string;
  vehicleType: string;
  licenseRequired: string;
  salaryMin: number;
  salaryMax: number;
  benefits: string[];
  quota: number;
  filled: number;
  status: string;
  viewCount: number;
  applicationCount: number;
  enterprise?: {
    name: string;
    logoColor: string;
    logoText: string;
    rating: number;
  };
}

export interface CargoListing {
  id: string;
  title: string;
  cargoType: string;
  weight: number;
  volume?: number;
  originCity: string;
  originAddress: string;
  destCity: string;
  destAddress: string;
  loadingTime: string;
  deliveryTime: string;
  vehicleType: string;
  price: number;
  priceUnit: string;
  status: string;
  contactName: string;
  contactPhone: string;
  distance?: number;
}

export interface CargoMatch {
  id: string;
  matchScore: number;
  status: string;
  cargo: CargoListing;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  coverLetter?: string;
  status: string;
  reviewedAt?: string;
  reviewNote?: string;
  job: JobListing;
  createdAt: string;
}

// ==================== 司机档案 API ====================

/**
 * 创建或更新司机档案
 */
export async function createOrUpdateDriverProfile(data: {
  realName?: string;
  phone: string;
  licenseType: string;
  vehicleType: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  vehicleLength?: number;
  vehicleLoad?: number;
  preferredCities: string[];
  workingHours?: string;
  expectedSalary?: number;
}): Promise<DriverProfile> {
  const response = await secureApiFetch('/api/drivers', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return response.json();
}

/**
 * 获取当前司机档案
 */
export async function getDriverProfile(): Promise<DriverProfile | null> {
  const response = await secureApiFetch('/api/drivers', {}, false);
  
  if (!response.ok) {
    if (response.status === 404) return null;
    const body = await response.json().catch(() => undefined);
    throw new ApiError(response.status, response.statusText, body);
  }

  return response.json();
}

/**
 * 更新司机可用状态
 */
export async function updateDriverAvailability(isAvailable: boolean): Promise<DriverProfile> {
  const response = await secureApiFetch('/api/drivers', {
    method: 'PATCH',
    body: JSON.stringify({ isAvailable }),
  });

  return response.json();
}

// ==================== 职位搜索 API ====================

/**
 * 搜索职位列表
 */
export async function searchJobs(params?: {
  city?: string;
  vehicleType?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<JobListing>> {
  const query = new URLSearchParams(
    Object.entries(params || {}).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null) acc[k] = String(v);
      return acc;
    }, {} as Record<string, string>)
  );
  const response = await secureApiFetch(`/api/jobs?${query}`);

  return response.json();
}

/**
 * 获取职位详情
 */
export async function getJobDetail(jobId: string): Promise<JobListing> {
  const response = await secureApiFetch(`/api/jobs?id=${jobId}`);
  return response.json();
}

/**
 * 申请职位
 */
export async function applyJob(jobId: string, coverLetter?: string): Promise<JobApplication> {
  const response = await secureApiFetch('/api/applications', {
    method: 'POST',
    body: JSON.stringify({ jobId, coverLetter }),
  });

  return response.json();
}

/**
 * 获取我的申请列表
 */
export async function getMyApplications(params?: {
  status?: string;
  page?: number;
}): Promise<PaginatedResponse<JobApplication>> {
  const query = new URLSearchParams(
    Object.entries(params || {}).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null) acc[k] = String(v);
      return acc;
    }, {} as Record<string, string>)
  );
  const response = await secureApiFetch(`/api/applications?${query}`);

  return response.json();
}

/**
 * 撤回申请
 */
export async function withdrawApplication(applicationId: string): Promise<JobApplication> {
  const response = await secureApiFetch('/api/applications', {
    method: 'PATCH',
    body: JSON.stringify({ applicationId, action: 'withdraw' }),
  });

  return response.json();
}

// ==================== 货源匹配 API ====================

/**
 * 获取推荐货源（AI 匹配）
 */
export async function getRecommendedCargos(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<CargoMatch>> {
  const query = new URLSearchParams(
    Object.entries(params || {}).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null) acc[k] = String(v);
      return acc;
    }, {} as Record<string, string>)
  );
  const response = await secureApiFetch(`/api/matches?${query}`);

  return response.json();
}

/**
 * 接受货源匹配
 */
export async function acceptCargoMatch(matchId: string): Promise<CargoMatch> {
  const response = await secureApiFetch('/api/matches', {
    method: 'POST',
    body: JSON.stringify({ matchId }),
  });

  return response.json();
}

/**
 * 拒绝货源匹配
 */
export async function rejectCargoMatch(matchId: string): Promise<CargoMatch> {
  const response = await secureApiFetch('/api/matches', {
    method: 'PATCH',
    body: JSON.stringify({ matchId, action: 'reject' }),
  });

  return response.json();
}

/**
 * 完成订单
 */
export async function completeCargoOrder(
  matchId: string,
  driverRating?: number,
  cargoRating?: number,
  feedback?: string
): Promise<CargoMatch> {
  const response = await secureApiFetch('/api/matches', {
    method: 'PATCH',
    body: JSON.stringify({
      matchId,
      action: 'complete',
      driverRating,
      cargoRating,
      feedback,
    }),
  });

  return response.json();
}

// ==================== 货源搜索 API (货主端) ====================

/**
 * 发布货源
 */
export async function publishCargo(data: {
  title: string;
  cargoType: string;
  weight: number;
  volume?: number;
  originCity: string;
  originAddress: string;
  destCity: string;
  destAddress: string;
  loadingTime: Date;
  deliveryTime: Date;
  vehicleType: string;
  vehicleLengthMin?: number;
  vehicleLoadMin?: number;
  price: number;
  priceUnit?: string;
  contactName: string;
  contactPhone: string;
}): Promise<CargoListing> {
  const response = await secureApiFetch('/api/cargos', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return response.json();
}

/**
 * 搜索货源列表
 */
export async function searchCargos(params?: {
  originCity?: string;
  destCity?: string;
  vehicleType?: string;
  status?: string;
  page?: number;
}): Promise<PaginatedResponse<CargoListing>> {
  const query = new URLSearchParams(
    Object.entries(params || {}).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null) acc[k] = String(v);
      return acc;
    }, {} as Record<string, string>)
  );
  const response = await secureApiFetch(`/api/cargos?${query}`);

  return response.json();
}

// ==================== 评价 API ====================

export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  relatedType: 'job' | 'cargo';
  relatedId: string;
  rating: number;
  tags?: string[];
  content?: string;
  helpfulCount: number;
  createdAt: string;
}

/**
 * 创建评价
 */
export async function createReview(data: {
  revieweeId: string;
  relatedType: 'job' | 'cargo';
  relatedId: string;
  rating: number;
  tags?: string[];
  content?: string;
}): Promise<Review> {
  const response = await secureApiFetch('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return response.json();
}

/**
 * 获取评价列表
 */
export async function getReviews(params?: {
  revieweeId?: string;
  relatedType?: string;
  relatedId?: string;
  page?: number;
}): Promise<PaginatedResponse<Review>> {
  const query = new URLSearchParams(
    Object.entries(params || {}).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null) acc[k] = String(v);
      return acc;
    }, {} as Record<string, string>)
  );
  const response = await secureApiFetch(`/api/reviews?${query}`);

  return response.json();
}

/**
 * 点赞评价
 */
export async function likeReview(reviewId: string): Promise<Review> {
  const response = await secureApiFetch('/api/reviews', {
    method: 'PATCH',
    body: JSON.stringify({ reviewId }),
  });

  return response.json();
}

// ==================== 企业端 API (仅企业用户) ====================

/**
 * 发布职位
 */
export async function publishJob(data: {
  enterpriseId: string;
  title: string;
  description: string;
  requirements: string[];
  city: string;
  vehicleType: string;
  licenseRequired: string;
  salaryMin: number;
  salaryMax: number;
  benefits: string[];
  quota?: number;
  expiresAt?: Date;
}): Promise<JobListing> {
  const response = await secureApiFetch('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return response.json();
}

/**
 * 审核职位申请
 */
export async function reviewJobApplication(
  applicationId: string,
  action: 'accept' | 'reject',
  reviewNote?: string
): Promise<JobApplication> {
  const response = await secureApiFetch('/api/applications', {
    method: 'PATCH',
    body: JSON.stringify({ applicationId, action, reviewNote }),
  });

  return response.json();
}
