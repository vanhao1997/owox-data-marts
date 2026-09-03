import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@owox/ui/components/sheet';
import { Button } from '@owox/ui/components/button';
import { Input } from '@owox/ui/components/input';
import { Textarea } from '@owox/ui/components/textarea';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@owox/ui/components/accordion';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { contextService } from '../../services/context.service';
import { MembersAssignmentField } from '../../../../shared/components/MembersAssignmentField';
import { UserReference } from '../../../../shared/components/UserReference';
import { getRoleDisplayName } from '../../../idp/utils/role-display-name';
import type { ContextDto, MemberWithScopeDto } from '../../types/context.types';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return DATE_FORMATTER.format(d);
}

const contextDetailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(255, 'Name must be 255 characters or fewer'),
  description: z.string().optional(),
});

type ContextDetailsFormValues = z.infer<typeof contextDetailsSchema>;

interface ContextDetailsSheetProps {
  isOpen: boolean;
  context: ContextDto | null;
  members: MemberWithScopeDto[];
  onClose: () => void;
  onSaved: () => void;
}

export function ContextDetailsSheet({
  isOpen,
  context,
  members,
  onClose,
  onSaved,
}: ContextDetailsSheetProps) {
  const { t } = useTranslation();
  const form = useForm<ContextDetailsFormValues>({
    resolver: zodResolver(contextDetailsSchema),
    defaultValues: { name: '', description: '' },
    mode: 'onChange',
  });
  const { control, handleSubmit, reset: resetForm, formState } = form;
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const initialMemberIds = useMemo(() => {
    if (!context) return [] as string[];
    return members.filter(m => m.contextIds.includes(context.id)).map(m => m.userId);
  }, [context, members]);

  // Reset form + member selection whenever the sheet opens for a new context.
  useEffect(() => {
    if (context) {
      resetForm({
        name: context.name,
        description: context.description ?? '',
      });
      setSelectedMemberIds(initialMemberIds);
    }
  }, [context, initialMemberIds, resetForm]);

  const memberSelectionDirty = useMemo(() => {
    if (selectedMemberIds.length !== initialMemberIds.length) return true;
    const a = [...selectedMemberIds].sort();
    const b = [...initialMemberIds].sort();
    return a.some((id, i) => id !== b[i]);
  }, [selectedMemberIds, initialMemberIds]);

  const handleToggleMember = (userId: string, checked: boolean) => {
    setSelectedMemberIds(prev => (checked ? [...prev, userId] : prev.filter(id => id !== userId)));
  };

  const onSubmit = useCallback(
    async (values: ContextDetailsFormValues) => {
      if (!context) return;
      setSaving(true);
      try {
        await contextService.updateContext(context.id, {
          name: values.name.trim(),
          description: values.description?.trim() ?? '',
        });

        if (memberSelectionDirty) {
          await contextService.updateContextMembers(context.id, selectedMemberIds);
        }

        toast.success('Context updated');
        onSaved();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to save');
      } finally {
        setSaving(false);
      }
    },
    [context, selectedMemberIds, memberSelectionDirty, onSaved]
  );

  if (!context) return null;

  return (
    <>
      <Sheet
        open={isOpen}
        onOpenChange={open => {
          if (!open && !saving) onClose();
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t('contextsPage.configureTitle')}</SheetTitle>
            <SheetDescription>{t('contextsPage.configureDescription')}</SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <AppForm
              onSubmit={e => {
                void handleSubmit(onSubmit)(e);
              }}
            >
              <FormLayout>
                <FormSection title={t('formCommon.general')} name='ctx-details-general'>
                  <FormField
                    control={control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel tooltip='Business-domain label shown on resources'>
                          Name
                        </FormLabel>
                        <FormControl>
                          <Input {...field} disabled={saving} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel tooltip='Helps members understand what resources belong to this context'>
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            disabled={saving}
                            placeholder='What this context represents'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormSection>

                <FormSection title={t('membersPage.title')} name='ctx-details-members'>
                  <MembersAssignmentField
                    idPrefix='ctx-mem'
                    label='Assigned members'
                    tooltip='Members assigned to this context can access resources tagged with it. Admins and project-wide members are always included.'
                    members={members.map(m => ({
                      userId: m.userId,
                      email: m.email,
                      displayName: m.displayName,
                      avatarUrl: m.avatarUrl,
                      role: m.role,
                      roleScope: m.roleScope,
                      roleLabel: getRoleDisplayName(m.role),
                    }))}
                    selectedIds={selectedMemberIds}
                    onToggle={handleToggleMember}
                    onSetSelected={setSelectedMemberIds}
                    disabled={saving}
                    emptyText={t('contextsPage.noMembers')}
                    footer={
                      <FormDescription>
                        <Accordion variant='common' type='single' collapsible>
                          <AccordionItem value='ctx-members-help'>
                            <AccordionTrigger>{t('contextsPage.lockedMembersQuestion')}</AccordionTrigger>
                            <AccordionContent>
                              <p className='mb-2'>
                                {t('contextsPage.lockedMembersAnswer')}
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </FormDescription>
                    }
                  />
                </FormSection>

                <FormSection title={t('common.viewDetails')} name='ctx-details-meta' defaultOpen={false}>
                  <FormItem>
                    <FormLabel>{t('common.createdBy')}</FormLabel>
                    {context.createdByUser ? (
                      <UserReference userProjection={context.createdByUser} />
                    ) : (
                      <span className='text-muted-foreground text-sm'>—</span>
                    )}
                  </FormItem>
                  <FormItem>
                    <FormLabel>{t('common.createdAt')}</FormLabel>
                    <span className='text-muted-foreground text-sm'>
                      {formatDate(context.createdAt)}
                    </span>
                  </FormItem>
                  <FormItem>
                    <FormLabel>{t('contextsPage.lastModified')}</FormLabel>
                    <span className='text-muted-foreground text-sm'>
                      {formatDate(context.modifiedAt)}
                    </span>
                  </FormItem>
                </FormSection>
              </FormLayout>

              <FormActions>
                <Button
                  type='submit'
                  className='w-full'
                  disabled={saving || (!formState.isDirty && !memberSelectionDirty)}
                >
                  {saving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  {t('common.save')}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  className='w-full'
                  onClick={onClose}
                  disabled={saving}
                >
                  {t('common.cancel')}
                </Button>
              </FormActions>
            </AppForm>
          </Form>
        </SheetContent>
      </Sheet>
    </>
  );
}
