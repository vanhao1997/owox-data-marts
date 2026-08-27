import { useState } from 'react';
import { FacebookLoginButton } from '../../../../../../../shared/components/FacebookLoginButton';
import type { FacebookLoginResponse } from '../../../../../../../shared/components/FacebookLoginButton';
import type { OAuthCallbackResponseDto } from '../../../../../../../shared/api/types/response/oauth.response.dto';
import type { OauthRenderComponentProps } from '../OauthRenderFactory';

interface FacebookPageOption {
  id: string;
  name: string;
  tasks: string[];
}

type FacebookPagesOauthRenderProps = Pick<
  OauthRenderComponentProps,
  'isLoading' | 'status' | 'settings' | 'onOAuthSuccess' | 'configuration' | 'onValueChange'
>;

export function FacebookPagesOauthRender({
  isLoading,
  status,
  settings,
  onOAuthSuccess,
  configuration,
  onValueChange,
}: FacebookPagesOauthRenderProps) {
  const [pages, setPages] = useState<FacebookPageOption[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const configuredPageIds =
    typeof configuration.PageIDs === 'string'
      ? configuration.PageIDs
      : typeof configuration.PageID === 'string'
        ? configuration.PageID
        : '';
  const selectedPageIds = configuredPageIds
    .split(/[\s,;]+/)
    .map(value => value.trim())
    .filter(Boolean);

  const handleFacebookLogin = async (response: FacebookLoginResponse) => {
    setPageError(null);
    const exchanged = await onOAuthSuccess({ accessToken: response.accessToken });
    if (!exchanged) {
      return;
    }

    const discoveredPages = parsePages(exchanged);
    setPages(discoveredPages);
    if (discoveredPages.length === 0) {
      setPageError(
        'No managed Facebook Pages with the ANALYZE task were found. Check Page permissions and try again.'
      );
    }
  };

  const handlePageChange = (selectedPageId: string, checked: boolean) => {
    const selectedPage = pages.find(page => page.id === selectedPageId);
    if (!selectedPage) {
      return;
    }

    const nextIds = checked
      ? [...new Set([...selectedPageIds, selectedPage.id])]
      : selectedPageIds.filter(id => id !== selectedPage.id);
    const nextNames = pages.filter(page => nextIds.includes(page.id)).map(page => page.name);
    onValueChange('PageIDs', nextIds.join(','));
    // Keep legacy single-page config populated for existing runners.
    onValueChange('PageID', nextIds.join(','));
    onValueChange('PageName', nextNames.join(', '));
  };

  return (
    <div className='mt-2 mb-2 space-y-4'>
      <FacebookLoginButton
        appId={settings?.vars.AppId as string}
        scope={settings?.vars.Scopes as string}
        version='v26.0'
        onSuccess={response => {
          void handleFacebookLogin(response);
        }}
        disabled={isLoading}
      >
        {status?.user ? (
          <>
            Connected as <strong>{status.user.name ?? status.user.id}</strong>
          </>
        ) : (
          'Continue with Facebook'
        )}
      </FacebookLoginButton>

      <div className='rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950'>
        Page Insights are usually delayed T+1 / approximately 24 hours. The latest day can be
        incomplete or unavailable until Meta finishes processing it.
      </div>

      {pages.length > 0 && (
        <div className='space-y-2'>
          <div className='text-sm font-medium'>Select Facebook Pages</div>
          <div className='space-y-2 rounded-md border p-3'>
            {pages.map(page => (
              <label key={page.id} className='flex items-center gap-2 text-sm'>
                <input
                  type='checkbox'
                  checked={selectedPageIds.includes(page.id)}
                  onChange={event => {
                    handlePageChange(page.id, event.target.checked);
                  }}
                />
                <span>
                  {page.name} ({page.id})
                </span>
              </label>
            ))}
          </div>
          <p className='text-muted-foreground text-xs'>
            Each selected Page must retain the ANALYZE task.
          </p>
        </div>
      )}

      {pageError && <div className='text-destructive text-sm'>{pageError}</div>}
    </div>
  );
}

function parsePages(response: OAuthCallbackResponseDto): FacebookPageOption[] {
  const rawPages = response.additional.pages;
  if (!Array.isArray(rawPages)) {
    return [];
  }

  return rawPages.filter((page): page is FacebookPageOption => {
    if (!page || typeof page !== 'object') {
      return false;
    }
    const candidate = page as Record<string, unknown>;
    return (
      typeof candidate.id === 'string' &&
      typeof candidate.name === 'string' &&
      Array.isArray(candidate.tasks) &&
      candidate.tasks.includes('ANALYZE')
    );
  });
}
