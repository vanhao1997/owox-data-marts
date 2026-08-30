import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { zodResolver } from '@hookform/resolvers/zod';
import type { CredentialIdentity } from '../../../../../shared/types/credential-identity';
import type { UserProjection } from '../../../../../shared/types';
import type { UserProjectionDto } from '../../../../../shared/types/api';
import { useOwnerState } from '../../../../../shared/hooks/useOwnerState';
import { OwnersSection } from '../../../../../shared/components/OwnersSection/OwnersSection';
import { ContextPicker } from '../../../../../features/contexts/components/ContextPicker/ContextPicker';
import { AddContextSheet } from '../../../../../features/contexts/components/AddContextSheet/AddContextSheet';
import { useInlineContextCreate } from '../../../../../features/contexts/hooks/useInlineContextCreate';
import { UserReference } from '../../../../../shared/components/UserReference/UserReference';
import { useUser } from '../../../../idp/hooks/useAuthState';
import { useIsAdmin } from '../../../../idp/hooks/useRole';
import { CopyCredentialContext } from '../../model/context/copy-credential-context';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@owox/ui/components/button';
import {
  AppForm,
  Form,
  FormActions,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormLayout,
  FormMessage,
  FormSection,
} from '@owox/ui/components/form';
import { Input } from '@owox/ui/components/input';
import { Switch } from '@owox/ui/components/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@owox/ui/components/accordion';

import { createFormPayload, focusFirstInvalidField } from '../../../../../utils';
import { COPY_SOURCE_CREDENTIAL_PLACEHOLDER } from '../../../../../shared/utils/credential-identity-utils';
import {
  DataDestinationType,
  dataDestinationSchema,
  type DataDestinationFormData,
} from '../../../shared';
import { DestinationTypeField } from './DestinationTypeField';
import { EmailFields } from './EmailFields';
import { GoogleSheetsFields } from './GoogleSheetsFields';
import { LookerStudioFields } from './LookerStudioFields';
import { GoogleChatFields } from './GoogleChatFields';

interface DataDestinationFormProps {
  initialData:
    | (DataDestinationFormData & {
        ownerUsers?: UserProjection[];
        createdAt?: Date;
        createdByUser?: UserProjection | null;
        contexts?: { id: string; name: string }[];
      })
    | null;
  onSubmit: (
    data: DataDestinationFormData,
    source?: { id: string; title: string } | null
  ) => Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  isEditMode?: boolean;
  allowedDestinationTypes?: DataDestinationType[];
  destinationId?: string;
}

export function DataDestinationForm({
  initialData,
  onSubmit,
  onCancel,
  onDirtyChange,
  isEditMode,
  allowedDestinationTypes,
  destinationId,
}: DataDestinationFormProps) {
  const { t } = useTranslation();
  const form = useForm<DataDestinationFormData>({
    resolver: zodResolver(dataDestinationSchema),
    defaultValues: initialData ?? {
      title: t('destinationsPage.newDestination', 'New Destination'),
      type: DataDestinationType.GOOGLE_SHEETS,
    },
    mode: 'onTouched',
  });

  const currentUser = useUser();
  const initialOwnerUsers =
    (initialData?.ownerUsers as UserProjectionDto[] | undefined) ??
    (currentUser
      ? [
          {
            userId: currentUser.id,
            fullName: currentUser.fullName ?? null,
            email: currentUser.email ?? null,
            avatar: currentUser.avatar ?? null,
          },
        ]
      : []);
  const { ownerUsers, ownersDirty, handleOwnersChange, consumePendingOwnerIds } =
    useOwnerState(initialOwnerUsers);

  const sharingInitial = initialData as {
    availableForUse?: boolean;
    availableForMaintenance?: boolean;
  } | null;
  const [sharingState, setSharingState] = useState({
    availableForUse: sharingInitial?.availableForUse ?? true,
    availableForMaintenance: sharingInitial?.availableForMaintenance ?? true,
  });

  const sharingDirty =
    sharingState.availableForUse !== (sharingInitial?.availableForUse ?? true) ||
    sharingState.availableForMaintenance !== (sharingInitial?.availableForMaintenance ?? true);

  const initialContextIds = (initialData?.contexts ?? []).map(c => c.id);
  const [contextIds, setContextIds] = useState<string[]>(initialContextIds);
  const contextsDirty =
    contextIds.length !== initialContextIds.length ||
    contextIds.some(id => !initialContextIds.includes(id));

  const isAdmin = useIsAdmin();
  const inlineContext = useInlineContextCreate({
    enabled: isAdmin,
    onCreated: created => {
      setContextIds(prev => (prev.includes(created.id) ? prev : [...prev, created.id]));
    },
  });

  const [selectedSource, setSelectedSource] = useState<{
    id: string;
    title: string;
    identity: CredentialIdentity | null;
  } | null>(null);

  const handleSourceSelect = useCallback(
    (id: string, title: string, identity: CredentialIdentity | null) => {
      setSelectedSource({ id, title, identity });
      // Set placeholder credentialId so Zod validation passes.
      // Credentials are copied server-side; this value is stripped from the payload
      // because dirtyFields.credentials is not set (shouldDirty: false).
      form.setValue('credentials.credentialId', COPY_SOURCE_CREDENTIAL_PLACEHOLDER, {
        shouldDirty: false,
        shouldValidate: true,
      });
    },
    [form]
  );

  const handleSourceClear = useCallback(() => {
    setSelectedSource(null);
    // Restore credential field to its original value from initialData
    form.resetField('credentials.credentialId');
  }, [form]);

  // Get the current destination type
  const destinationType = form.watch('type');

  useEffect(() => {
    onDirtyChange?.(
      form.formState.isDirty ||
        selectedSource !== null ||
        ownersDirty ||
        sharingDirty ||
        contextsDirty
    );
  }, [
    form.formState.isDirty,
    selectedSource,
    ownersDirty,
    sharingDirty,
    contextsDirty,
    onDirtyChange,
  ]);

  const copyCredentialCtx = useMemo(
    () => ({
      entityId: destinationId,
      onSourceSelect: handleSourceSelect,
      selectedSource,
      onSourceClear: handleSourceClear,
    }),
    [destinationId, selectedSource, handleSourceSelect, handleSourceClear]
  );

  const handleSubmit = async (data: DataDestinationFormData) => {
    const { dirtyFields } = form.formState;
    const payload = createFormPayload(data);

    // Strip credentials when copying from another source (server handles it via sourceDestinationId)
    // or when no credential fields were touched by the user.
    if (!dirtyFields.credentials || selectedSource) {
      delete (payload as Partial<DataDestinationFormData>).credentials;
    }

    const ownerIds = consumePendingOwnerIds();
    if (ownerIds !== null) {
      (payload as Record<string, unknown>).ownerIds = ownerIds;
    }

    if (sharingDirty) {
      (payload as Record<string, unknown>).availableForUse = sharingState.availableForUse;
      (payload as Record<string, unknown>).availableForMaintenance =
        sharingState.availableForMaintenance;
    }

    if (contextsDirty) {
      (payload as Record<string, unknown>).contextIds = contextIds;
    }

    await onSubmit(payload, selectedSource);
  };

  return (
    <Form {...form}>
      <AppForm
        onSubmit={e => {
          void form.handleSubmit(handleSubmit, focusFirstInvalidField)(e);
        }}
      >
        <FormLayout>
          <FormSection title={t('formCommon.general', 'General')}>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel tooltip={t('formCommon.titleTooltipDestination', 'Name the destination to clarify its purpose')}>{t('common.title', 'Title')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('formCommon.destinationTitlePlaceholder', 'Enter title')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DestinationTypeField
              form={form}
              isEditMode={isEditMode}
              allowedDestinationTypes={allowedDestinationTypes}
            />
          </FormSection>

          <CopyCredentialContext.Provider value={copyCredentialCtx}>
            {destinationType === DataDestinationType.GOOGLE_SHEETS && (
              <GoogleSheetsFields form={form} />
            )}
          </CopyCredentialContext.Provider>

          {destinationType === DataDestinationType.LOOKER_STUDIO && (
            <LookerStudioFields form={form} />
          )}

          {destinationType === DataDestinationType.EMAIL && (
            <EmailFields
              form={form}
              emailsFieldTitle={t('destinationForm.userEmailsTitle', 'Enter user emails list')}
            />
          )}

          {destinationType === DataDestinationType.SLACK && (
            <EmailFields
              form={form}
              emailsFieldTitle={t(
                'destinationForm.slackChannelEmailsTitle',
                'Enter Slack channel emails list'
              )}
            />
          )}

          {destinationType === DataDestinationType.MS_TEAMS && (
            <EmailFields
              form={form}
              emailsFieldTitle={t(
                'destinationForm.microsoftTeamsChannelEmailsTitle',
                'Enter Microsoft Teams channel emails list'
              )}
            />
          )}

          {destinationType === DataDestinationType.GOOGLE_CHAT && <GoogleChatFields form={form} />}

          <FormSection title={t('formCommon.ownership', 'Ownership')} defaultOpen={false} name='destination-ownership'>
            <FormItem>
              <FormLabel tooltip='Các thành viên phụ trách điểm đến này'>{t('formCommon.owners', 'Owners')}</FormLabel>
              <OwnersSection ownerUsers={ownerUsers} onSave={handleOwnersChange} />
              <FormDescription>
                <Accordion variant='common' type='single' collapsible>
                  <AccordionItem value='destination-owners-help'>
                    <AccordionTrigger>Chủ sở hữu điểm đến là gì?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        Chủ sở hữu điểm đến là quyền sở hữu trực tiếp của điểm đến này. Khi vai trò
                        của chủ sở hữu là Technical User hoặc Project Admin, họ có thể xem, sửa, xóa,
                        cấu hình Sharing và sao chép thông tin xác thực từ điểm đến này — bất kể cài
                        đặt Sharing. Gán Owner cho Business User vẫn lưu lại phân công, nhưng chưa
                        cấp quyền bảo trì cho đến khi vai trò thay đổi.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </FormDescription>
            </FormItem>
          </FormSection>

          {isEditMode && destinationId && (
            <FormSection title={t('formCommon.contexts', 'Contexts')} defaultOpen={false} name='destination-contexts'>
              <FormItem>
                <FormLabel tooltip='Các ngữ cảnh miền nghiệp vụ được gán cho điểm đến này'>
                  {t('formCommon.assigned', 'Assigned')}
                </FormLabel>
                <ContextPicker
                  selectedContextIds={contextIds}
                  onChange={setContextIds}
                  idPrefix='destination-ctx'
                  {...inlineContext.pickerProps}
                />
                <FormDescription>
                  <Accordion variant='common' type='single' collapsible>
                    <AccordionItem value='destination-contexts-help'>
                      <AccordionTrigger>Ngữ cảnh là gì?</AccordionTrigger>
                      <AccordionContent>
                        <p>
                          Ngữ cảnh là các miền nghiệp vụ (ví dụ: Marketing, Finance, Sales) dùng để
                          nhóm Storages, Destinations và Data Mart. Chúng cũng kiểm soát quyền truy
                          cập: thành viên chỉ được giới hạn trong một số ngữ cảnh sẽ chỉ thấy các tài
                          nguyên được gán cho những ngữ cảnh đó. Hãy gán một hoặc nhiều ngữ cảnh để
                          điểm đến này dễ được đúng người tìm thấy.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </FormDescription>
              </FormItem>
            </FormSection>
          )}

          {isEditMode && (
            <FormSection title={t('formCommon.sharing', 'Sharing')} defaultOpen={false} name='destination-availability'>
              <FormItem>
                <div className='flex items-center justify-between gap-4'>
                  <FormLabel>{t('formCommon.sharedForUse', 'Shared for use')}</FormLabel>
                  <Switch
                    checked={sharingState.availableForUse}
                    onCheckedChange={v => {
                      setSharingState(prev => ({ ...prev, availableForUse: v }));
                    }}
                  />
                </div>
                <p className='text-muted-foreground text-sm'>
                  Thành viên dự án có thể dùng điểm đến này trong báo cáo của họ
                </p>
                <FormDescription>
                  <Accordion variant='common' type='single' collapsible>
                    <AccordionItem value='sharing-use-help'>
                      <AccordionTrigger>“Chia sẻ để sử dụng” nghĩa là gì?</AccordionTrigger>
                      <AccordionContent>
                        <p>
                          Khi bật, thành viên dự án có thể chọn điểm đến này khi cấu hình báo cáo.
                          Nếu tắt, chỉ chủ sở hữu điểm đến và quản trị viên mới dùng được.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </FormDescription>
              </FormItem>
              <FormItem>
                <div className='flex items-center justify-between gap-4'>
                  <FormLabel>{t('formCommon.sharedForMaintenance', 'Shared for maintenance')}</FormLabel>
                  <Switch
                    checked={sharingState.availableForMaintenance}
                    onCheckedChange={v => {
                      setSharingState(prev => ({ ...prev, availableForMaintenance: v }));
                    }}
                  />
                </div>
                <p className='text-muted-foreground text-sm'>
                  Thành viên dự án có quyền truy cập có thể sao chép thông tin xác thực, sửa và xóa
                  điểm đến này
                </p>
                <FormDescription>
                  <Accordion variant='common' type='single' collapsible>
                    <AccordionItem value='sharing-maintenance-help'>
                      <AccordionTrigger>“Chia sẻ để bảo trì” nghĩa là gì?</AccordionTrigger>
                      <AccordionContent>
                        <p>
                          Khi bật, thành viên dự án có thể sao chép thông tin xác thực từ điểm đến
                          này, sửa cấu hình và xóa nó. Nếu tắt, chỉ chủ sở hữu và quản trị viên mới
                          thực hiện được các thao tác này.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </FormDescription>
              </FormItem>
            </FormSection>
          )}

          {initialData?.createdAt && (
            <FormSection title={t('formCommon.details', 'Details')} defaultOpen={false} name='destination-details'>
              <FormItem>
                <FormLabel>{t('formCommon.createdBy', 'Created By')}</FormLabel>
                <div className='text-sm'>
                  {initialData.createdByUser ? (
                    <UserReference userProjection={initialData.createdByUser} variant='full' />
                  ) : (
                    <span className='text-muted-foreground'>{t('formCommon.unknown', 'Unknown')}</span>
                  )}
                </div>
              </FormItem>
              <FormItem>
                <FormLabel>{t('formCommon.createdAt', 'Created At')}</FormLabel>
                <div className='text-muted-foreground text-sm'>
                  {new Date(initialData.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </FormItem>
            </FormSection>
          )}
        </FormLayout>
        <FormActions>
          <Button
            variant='default'
            type='submit'
            className='w-full'
            aria-label={t('formCommon.save', 'Save')}
            disabled={
              (!form.formState.isDirty &&
                !selectedSource &&
                !ownersDirty &&
                !sharingDirty &&
                !contextsDirty) ||
              form.formState.isSubmitting
            }
          >
            {form.formState.isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {t('formCommon.save', 'Save')}
          </Button>
          <Button
            variant='outline'
            type='button'
            onClick={onCancel}
            className='w-full'
            aria-label={t('formCommon.cancel', 'Cancel')}
          >
            {t('formCommon.cancel', 'Cancel')}
          </Button>
        </FormActions>
      </AppForm>
      {/*
       * Sheet-in-sheet: the outer Destination sheet stays mounted beneath,
       * preserving unsaved form state. After creation, the hook refreshes
       * the picker and we auto-check the freshly created context.
       */}
      <AddContextSheet {...inlineContext.sheetProps} />
    </Form>
  );
}
