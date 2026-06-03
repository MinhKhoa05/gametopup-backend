import { FormEvent, useEffect, useState } from 'react';
import { AsyncActionExecutor } from './common/useAsyncAction';
import { getApiMessage } from '../lib/api';
import { updateMyProfile } from '../services/user.api';
import { userDisplayName } from '../lib/labels';
import { User } from '../types';

type UseProfileEditorArgs = {
  user: User | null;
  execute: AsyncActionExecutor;
  onProfileUpdated: (displayName: string) => void;
};

export function useProfileEditor({ user, execute, onProfileUpdated }: UseProfileEditorArgs) {
  const [draftName, setDraftName] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setDraftName(user?.displayName ?? '');
    setSaveError(null);
  }, [user?.id, user?.displayName, user?.email]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await execute(
      async () => {
        if (!user) {
          const message = 'Không tìm thấy người dùng để cập nhật.';
          setSaveError(message);
          throw new Error(message);
        }

        const nextDisplayName = draftName.trim();

        try {
          await updateMyProfile(user.id, nextDisplayName);
          setSaveError(null);
          return nextDisplayName;
        } catch (error) {
          setSaveError(getApiMessage(error));
          throw error;
        }
      },
      {
        successMessage: 'Đã cập nhật hồ sơ.',
        onSuccess: (displayName) => {
          onProfileUpdated(displayName);
          setSaveError(null);
        },
      },
    );
  }

  return {
    canSave: draftName.trim().length > 0 && draftName.trim() !== userDisplayName(user),
    draftName,
    handleSubmit,
    saveError,
    setDraftName,
  };
}
