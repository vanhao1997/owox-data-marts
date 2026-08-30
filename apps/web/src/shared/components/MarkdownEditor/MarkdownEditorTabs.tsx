import { Tabs, TabsList, TabsTrigger } from '@owox/ui/components/tabs';
import { useTranslation } from 'react-i18next';

export interface MarkdownEditorTabsProps {
  value: 'markdown' | 'preview';
  onChange: (v: 'markdown' | 'preview') => void;
}

export function MarkdownEditorTabs({ value, onChange }: MarkdownEditorTabsProps) {
  const { t } = useTranslation();
  return (
    <Tabs
      value={value}
      onValueChange={v => {
        onChange(v as 'markdown' | 'preview');
      }}
    >
      <TabsList>
        <TabsTrigger value='markdown'>{t('markdownEditor.markdown', 'Markdown')}</TabsTrigger>
        <TabsTrigger value='preview'>{t('markdownEditor.preview', 'Preview')}</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
