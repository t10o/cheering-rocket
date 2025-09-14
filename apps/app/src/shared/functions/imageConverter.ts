import heic2any from "heic2any";
import {
  isHeicFile,
  changeHeicExtensionToJpg,
  isValidConversionResult,
  getFirstBlob,
} from "./imageValidation";

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

    // 変換結果から最初のBlobを取得
    const jpegBlob = getFirstBlob(convertedBlob);

    // 変換結果が存在しない場合はエラーを投げる
    if (!isValidConversionResult(jpegBlob)) {
      throw new Error("HEIC変換の結果が空です");
    }

    // ファイル名の拡張子を変更
    const fileName = changeHeicExtensionToJpg(file.name);

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
