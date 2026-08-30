import { Input } from '@owox/ui/components/input';
import { DataStorageType } from '../../../shared';
import type { DataStorageFormData } from '../../../shared/types/data-storage.schema.ts';
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
import AthenaRegionDescription from './FormDescriptions/AthenaRegionDescription.tsx';
import AthenaOutputBucketDescription from './FormDescriptions/AthenaOutputBucketDescription.tsx';
import AthenaAccessKeyIdDescription from './FormDescriptions/AthenaAccessKeyIdDescription.tsx';
import AthenaSecretAccessKeyDescription from './FormDescriptions/AthenaSecretAccessKeyDescription.tsx';
import { useEffect, useState } from 'react';
import { AuthenticationSectionHeader } from '../../../../../shared/components/AuthenticationSectionHeader';
import { CopyStorageCredentialsButton } from '../CopyStorageCredentialsButton';
import { useCopyCredentialContext } from '../../model/context/useCopyCredentialContext';

interface AwsAthenaFieldsProps {
  form: UseFormReturn<DataStorageFormData>;
}

export const AwsAthenaFields = ({ form }: AwsAthenaFieldsProps) => {
  const {
    entityId: storageId,
    onSourceSelect: onSourceStorageSelect,
    selectedSource,
    onSourceClear,
  } = useCopyCredentialContext();
  const [maskedSecretValue, setMaskedSecretValue] = useState<string>('');

  useEffect(() => {
    const accessKeyId = form.getValues('credentials.accessKeyId');

    if (accessKeyId) {
      const maskedValue = '_'.repeat(accessKeyId.length);
      setMaskedSecretValue(maskedValue);
      form.setValue('credentials.secretAccessKey', maskedValue, { shouldDirty: false });
    }
  }, [form]);

  if (form.watch('type') !== DataStorageType.AWS_ATHENA) {
    return null;
  }
  return (
    <>
      {/* Connection Settings */}
      <FormSection title='Cài đặt kết nối'>
        <FormField
          control={form.control}
          name='config.region'
          render={({ field }) => (
            <FormItem>
              <FormLabel tooltip='Nhập khu vực AWS nơi dịch vụ Athena của bạn đang hoạt động'>
                Khu vực
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder='Nhập khu vực' />
              </FormControl>
              <FormDescription>
                <AthenaRegionDescription />
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='config.outputBucket'
          render={({ field }) => (
            <FormItem>
              <FormLabel tooltip='Chỉ định bucket S3 nơi kết quả truy vấn Athena sẽ được lưu'>
                Bucket đầu ra
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder='Nhập bucket đầu ra' />
              </FormControl>
              <FormDescription>
                <AthenaOutputBucketDescription />
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
              storageType={DataStorageType.AWS_ATHENA}
              currentStorageId={storageId}
              onSelect={onSourceStorageSelect}
            />
          }
          selectedSource={selectedSource}
          onSourceClear={onSourceClear}
        />
        {!selectedSource && (
          <div className='flex flex-col gap-2'>
            <FormField
              control={form.control}
              name='credentials.accessKeyId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel tooltip='Mã AWS Access Key ID dùng để xác thực'>
                    Mã Access Key ID
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Nhập mã access key id' />
                  </FormControl>
                  <FormDescription>
                    <AthenaAccessKeyIdDescription />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='credentials.secretAccessKey'
              render={({ field }) => (
                <FormItem>
                  <FormLabel tooltip='AWS Secret Access Key dùng để xác thực'>
                    Mã Secret Access Key
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='password'
                      placeholder={maskedSecretValue || 'Nhập secret access key'}
                    />
                  </FormControl>
                  <FormDescription>
                    <AthenaSecretAccessKeyDescription />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </>
  );
};
