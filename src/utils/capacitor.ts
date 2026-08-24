import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export const isNativePlatform = () => Capacitor.isNativePlatform();

export const saveFileOnDevice = async (blob: Blob, fileName: string) => {
  if (!isNativePlatform()) {
    // Browser: use standard download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  // Native platform (APK): save to device filesystem
  const base64 = await blobToBase64(blob);
  const base64Data = base64.split(',')[1] || base64;

  const result = await Filesystem.writeFile({
    path: fileName,
    data: base64Data,
    directory: Directory.Documents,
  });

  // Share the file so user can choose where to save/send it
  await Share.share({
    title: fileName,
    url: result.uri,
  });
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
