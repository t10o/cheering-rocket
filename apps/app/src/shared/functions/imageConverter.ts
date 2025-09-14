import heic2any from "heic2any";

/**
 * HEIC画像をJPEGに変換する
 * @param file 変換するファイル
 * @returns 変換されたJPEGファイル
 */
export const convertHeicToJpeg = async (file: File): Promise<File> => {
  try {
    // HEICファイルかどうかを確認
    if (!isHeicFile(file)) {
      return file; // HEICでない場合はそのまま返す
    }

    // HEICをJPEGに変換
    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.8, // 品質を80%に設定
    });

    // 変換結果は配列で返されるので、最初の要素を取得
    const jpegBlob = Array.isArray(convertedBlob)
      ? convertedBlob[0]
      : convertedBlob;

    // 変換結果が存在しない場合はエラーを投げる
    if (!jpegBlob) {
      throw new Error("HEIC変換の結果が空です");
    }

    // ファイル名の拡張子を変更
    const fileName = file.name.replace(/\.(heic|heif)$/i, ".jpg");

    // 新しいFileオブジェクトを作成
    return new File([jpegBlob], fileName, {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } catch (error) {
    console.error("HEIC変換に失敗しました:", error);
    // 変換に失敗した場合は元のファイルを返す
    return file;
  }
};

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
 * 画像ファイルを適切な形式に変換する（HEICの場合はJPEGに変換）
 * @param file 変換するファイル
 * @returns 変換されたファイル
 */
export const convertImageIfNeeded = async (file: File): Promise<File> => {
  if (isHeicFile(file)) {
    return await convertHeicToJpeg(file);
  }
  return file;
};
