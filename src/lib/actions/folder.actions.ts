'use server';

import { revalidateTag } from 'next/cache';

import { URL_FOLDER } from '@/lib/constants';
import { CacheTags, serverDelete, serverPost } from '@/lib/http.server';

/**
 * Server Actions cho nghiệp vụ Folder.
 * Sau mỗi mutation gọi `revalidateTag('folders')` để mọi RSC đã fetch với
 * tag `folders` sẽ re-fetch lần kế tiếp.
 */

export async function createFolderAction(input: { name: string }) {
  const result = await serverPost<{ name: string }, { id: number }>(URL_FOLDER, input);
  if (result.isSuccess) revalidateTag(CacheTags.folders, {});
  return result;
}

export async function deleteFolderAction(folderId: number) {
  const result = await serverDelete<{ id: number }>(`${URL_FOLDER}/${folderId}`);
  if (result.isSuccess) revalidateTag(CacheTags.folders, {});
  return result;
}
