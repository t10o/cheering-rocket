/**
 * ファイルがHEIC形式かどうかを判定する
 * @param file 判定するファイル
 * @returns HEIC形式の場合true
 */
export const isHeicFile = (file: File): boolean => {
  const heicTypes = ["image/heic", "image/heif"];
  const heicExtensions = [".heic", ".heif"];

  // MIMEタイプで判定
  if (heicTypes.includes(file.type.toLowerCase())) {
    return true;
  }

  // ファイル名の拡張子で判定
  const fileName = file.name.toLowerCase();
  return heicExtensions.some((ext) => fileName.endsWith(ext));
};

/**
 * ファイル名の拡張子をHEICからJPGに変更する
 * @param fileName 元のファイル名
 * @returns 拡張子を変更したファイル名
 */
export const changeHeicExtensionToJpg = (fileName: string): string => {
  return fileName.replace(/\.(heic|heif)$/i, ".jpg");
};

/**
 * 変換結果が有効かどうかを判定する
 * @param convertedBlob 変換結果のBlob
 * @returns 有効な場合true
 */
export const isValidConversionResult = (convertedBlob: unknown): boolean => {
  return convertedBlob !== null && convertedBlob !== undefined;
};

/**
 * 変換結果から最初のBlobを取得する
 * @param convertedBlob 変換結果（配列または単一のBlob）
 * @returns 最初のBlob
 */
export const getFirstBlob = (convertedBlob: unknown): Blob => {
  if (Array.isArray(convertedBlob)) {
    return convertedBlob[0] as Blob;
  }
  return convertedBlob as Blob;
};
