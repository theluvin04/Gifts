declare module 'virtual:dearly-code-assets' {
  const assets:
    Array<{
      id: string;
      name: string;
      url: string;
      storagePath: string;
      sourcePath: string;
      folderId: string;
      folderName: string;
      mimeType: string;
      size: number;
      tags: string[];
      createdAtMs: number;
      updatedAtMs: number;
      source: 'code';
      readOnly: true;
    }>;

  export default assets;
}
