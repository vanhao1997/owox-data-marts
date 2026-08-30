import { Input } from '@owox/ui/components/input';
import type { GoogleBigQueryFormData } from '../../../shared';
import { googleBigQueryLocationOptions, DataStorageType } from '../../../shared';
import { Combobox } from '../../../../../shared/components/Combobox/combobox.tsx';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormSection,
  FormDescription,
} from '@owox/ui/components/form';
import type { UseFormReturn } from 'react-hook-form';
import GoogleBigQueryServiceAccountDescription from './FormDescriptions/GoogleBigQueryServiceAccountDescription';
import GoogleBigQueryOAuthDescription from './FormDescriptions/GoogleBigQueryOAuthDescription';
import GoogleBigQueryAuthMethodDescription from './FormDescriptions/GoogleBigQueryAuthMethodDescription';
import GoogleBigQueryProjectIdDescription from './FormDescriptions/GoogleBigQueryProjectIdDescription.tsx';
import GoogleBigQueryLocationDescription from './FormDescriptions/GoogleBigQueryLocationDescription.tsx';
import { Button } from '@owox/ui/components/button';
import { FieldWithActions } from '@owox/ui/components/common/field-with-actions';
import { FileDropTextarea } from '@owox/ui/components/file-drop-textarea';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { getServiceAccountLink } from '../../../../../utils/google-cloud-utils';
import { GoogleOAuthConnectButton, storageOAuthApi } from '../../../../../features/google-oauth';
import { Tabs, TabsList, TabsTrigger } from '@owox/ui/components/tabs';
import { AuthenticationSectionHeader } from '../../../../../shared/components/AuthenticationSectionHeader';
import { CopyStorageCredentialsButton } from '../CopyStorageCredentialsButton';
import { useCopyCredentialContext } from '../../model/context/useCopyCredentialContext';

interface GoogleBigQueryFieldsProps {
  form: UseFormReturn<GoogleBigQueryFormData>;
}

export const GoogleBigQueryFields = ({ form }: GoogleBigQueryFieldsProps) => {
  const {
    entityId: storageId,
    onSourceSelect: onSourceStorageSelect,
    selectedSource,
    onSourceClear,
  } = useCopyCredentialContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isOAuthAvailable, setIsOAuthAvailable] = useState<boolean | null>(null);
  const [oauthRedirectUri, setOauthRedirectUri] = useState<string | undefined>(undefined);
  const [authMethod, setAuthMethod] = useState<'oauth' | 'service-account'>(() => {
    const sa = form.getValues('credentials.serviceAccount');
    return sa?.trim() ? 'service-account' : 'oauth';
  });
  // Stash previous credential values so tab switching doesn't destroy them
  const [stashedServiceAccount, setStashedServiceAccount] = useState<string | undefined>(undefined);
  const [stashedCredentialId, setStashedCredentialId] = useState<string | null | undefined>(
    undefined
  );

  useEffect(() => {
    storageOAuthApi
      .getSettings()
      .then(s => {
        setIsOAuthAvailable(s.available);
        setOauthRedirectUri(s.redirectUri);
        if (!s.available) {
          setAuthMethod('service-account');
        }
      })
      .catch(() => {
        setIsOAuthAvailable(false);
        setAuthMethod('service-account');
      });
  }, []);
  const handleOAuthStatusChange = (isConnected: boolean, credentialId?: string) => {
    if (isConnected && credentialId) {
      setAuthMethod('oauth');
      form.setValue('credentials.credentialId', credentialId, {
        shouldDirty: false,
        shouldValidate: true,
      });
      form.setValue('credentials.serviceAccount', '');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    form.setValue('credentials.serviceAccount', '', {
      shouldDirty: true,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetField('credentials.serviceAccount');
  };

  const serviceAccountValue = form.watch('credentials.serviceAccount');
  const serviceAccountLink = serviceAccountValue
    ? getServiceAccountLink(serviceAccountValue)
    : null;

  const handleOAuthSuccess = (credentialId: string) => {
    form.setValue('credentials.credentialId', credentialId, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue('credentials.serviceAccount', '');
  };

  const handleAuthMethodChange = (value: 'oauth' | 'service-account') => {
    if (value === 'oauth') {
      setStashedServiceAccount(form.getValues('credentials.serviceAccount'));
      form.setValue('credentials.serviceAccount', '');
      if (stashedCredentialId) {
        form.setValue('credentials.credentialId', stashedCredentialId);
      }
    } else {
      setStashedCredentialId(form.getValues('credentials.credentialId'));
      form.setValue('credentials.credentialId', null);
      if (stashedServiceAccount) {
        form.setValue('credentials.serviceAccount', stashedServiceAccount);
      }
    }
    setAuthMethod(value);
  };

  return (
    <>
      {/* Connection Settings */}
      <FormSection title='Cài đặt kết nối'>
        <FormField
          control={form.control}
          name='config.projectId'
          render={({ field }) => (
            <FormItem>
              <FormLabel tooltip='Nhập mã dự án Google Cloud nơi chi phí BigQuery sẽ được tính'>
                Mã dự án
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder='Nhập mã dự án' />
              </FormControl>
              <FormDescription>
                <GoogleBigQueryProjectIdDescription />
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='config.location'
          render={({ field }) => (
            <FormItem>
              <FormLabel tooltip='Chọn cùng khu vực nơi dữ liệu BigQuery đang được lưu để truy vấn hoạt động đúng'>
                Vị trí
              </FormLabel>
              <FormControl>
                <Combobox
                  options={googleBigQueryLocationOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder='Chọn vị trí'
                  emptyMessage='Không tìm thấy vị trí nào'
                  className='w-full'
                />
              </FormControl>
              <FormDescription>
                <GoogleBigQueryLocationDescription />
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      {/* Authentication */}
      <div className='mb-4 flex flex-col gap-2'>
        <AuthenticationSectionHeader
          itemType='storage'
          copyButton={
            <CopyStorageCredentialsButton
              storageType={DataStorageType.GOOGLE_BIGQUERY}
              currentStorageId={storageId}
              onSelect={onSourceStorageSelect}
            />
          }
          selectedSource={selectedSource}
          onSourceClear={onSourceClear}
        />
        {!selectedSource && (
          <div className='flex flex-col gap-2'>
            {isOAuthAvailable && (
              <FormItem>
                <div className='flex items-center justify-between'>
                  <FormLabel>Phương thức xác thực</FormLabel>
                  <Tabs
                    value={authMethod}
                    onValueChange={v => {
                      handleAuthMethodChange(v as 'oauth' | 'service-account');
                    }}
                  >
                    <TabsList>
                      <TabsTrigger value='oauth'>Kết nối với Google</TabsTrigger>
                      <TabsTrigger value='service-account'>JSON tài khoản dịch vụ</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <FormDescription>
                  <GoogleBigQueryAuthMethodDescription />
                </FormDescription>
              </FormItem>
            )}

            {isOAuthAvailable && authMethod === 'oauth' && storageId && (
              <FormField
                control={form.control}
                name='credentials.credentialId'
                render={() => (
                  <FormItem>
                    <div className='mb-4 flex items-center justify-between'>
                      <FormLabel tooltip='Cho phép Owox truy cập các tập dữ liệu BigQuery của bạn'>
                        Kết nối bằng Google OAuth
                      </FormLabel>
                    </div>
                    <GoogleOAuthConnectButton
                      resourceType='storage'
                      resourceId={storageId}
                      redirectUri={oauthRedirectUri}
                      onSuccess={handleOAuthSuccess}
                      onStatusChange={handleOAuthStatusChange}
                    />
                    <FormDescription>
                      <GoogleBigQueryOAuthDescription />
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {authMethod === 'service-account' && (
              <FormField
                control={form.control}
                name='credentials.serviceAccount'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center justify-between'>
                      <FormLabel tooltip='Dán khóa JSON từ tài khoản dịch vụ có quyền truy cập vào nhà cung cấp kho lưu trữ đã chọn'>
                        Tài khoản dịch vụ
                      </FormLabel>
                      {!isEditing && serviceAccountValue && (
                          <Button variant='ghost' size='sm' onClick={handleEdit} type='button'>
                            Sửa
                          </Button>
                      )}
                      {isEditing && (
                          <Button variant='ghost' size='sm' onClick={handleCancel} type='button'>
                            Hủy
                          </Button>
                      )}
                    </div>
                    <FormControl>
                      {!isEditing && serviceAccountLink ? (
                        <FieldWithActions
                          value={serviceAccountLink.email}
                          actions={[
                            { type: 'copy', tooltip: 'Sao chép email' },
                            {
                              type: 'external-link',
                              href: serviceAccountLink.url,
                              tooltip: 'Mở chi tiết',
                            },
                          ]}
                        />
                      ) : (
                        <FileDropTextarea
                          {...field}
                          className='min-h-[150px] font-mono'
                          rows={8}
                          placeholder='Dán JSON tài khoản dịch vụ vào đây hoặc kéo thả tệp'
                          onFileRead={content => {
                            form.setValue('credentials.serviceAccount', content, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }}
                          onFileReject={error => {
                            toast.error(error);
                          }}
                        />
                      )}
                    </FormControl>
                    <FormDescription>
                      <GoogleBigQueryServiceAccountDescription />
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
};
