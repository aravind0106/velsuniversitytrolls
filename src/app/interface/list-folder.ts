export interface ListFolderResult {
    entries: Array<{
      name: string;
      path_display: string;
      [key: string]: any;
    }>;
  }