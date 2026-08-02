/**
 * Handing a file to the user.
 *
 * One place, because the object URL has to be revoked whether the click worked or not, and that is
 * exactly the line people forget when they copy the anchor trick into a third file.
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;

  try {
    anchor.click();
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const downloadText = (text: string, filename: string, type: string): void => {
  downloadBlob(new Blob([text], { type }), filename);
};
