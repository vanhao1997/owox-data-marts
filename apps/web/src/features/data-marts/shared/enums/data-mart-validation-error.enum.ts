/**
 * Data mart validation error enum
 */
export enum DataMartValidationError {
  ALREADY_PUBLISHED = 'ALREADY_PUBLISHED',
  INVALID_STORAGE = 'INVALID_STORAGE',
  MISSING_DEFINITION = 'MISSING_DEFINITION',
}

/**
 * Data mart validation error messages
 */
export const DATA_MART_VALIDATION_ERROR_MESSAGES: Record<DataMartValidationError, string> = {
  [DataMartValidationError.ALREADY_PUBLISHED]: 'Data Mart đã được xuất bản',
  [DataMartValidationError.INVALID_STORAGE]: 'Data Mart phải có cấu hình kho lưu trữ hợp lệ',
  [DataMartValidationError.MISSING_DEFINITION]: 'Data Mart phải có nguồn dữ liệu được cấu hình',
};

/**
 * Data mart required setup actions
 */
export const DATA_MART_REQUIRED_ACTIONS: Record<DataMartValidationError, string> = {
  [DataMartValidationError.ALREADY_PUBLISHED]: 'Data Mart đã được xuất bản',
  [DataMartValidationError.INVALID_STORAGE]: 'hoàn tất cấu hình kho lưu trữ',
  [DataMartValidationError.MISSING_DEFINITION]: 'cấu hình nguồn dữ liệu đầu vào',
};
