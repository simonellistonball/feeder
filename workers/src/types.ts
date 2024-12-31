export interface GmailJobData {
  // google user id
  userId: string;
  nextPageToken?: string;
  q?: string;
}

export interface GmailMessageJobData {
  // google user id
  userId: string;
  // the next page token to use
  messages: string[];
}

export interface GmailAttachmentJobData {
  // google user id
  userId: string;
  messageId: string;
  attachmentId: string;
}

export interface GdriveListJobData {
  // google user id
  userId: string;
  nextPageToken?: string;
  q?: string;
}

export interface GdriveFetchJobData {
  // google user id
  userId: string;
  fileId: string;
}

export interface GdocFetchJobData {
  userId: string;
  documentId: string;
}

export interface TextAnalysisJobData {
  src:
    | { type: "gdoc"; documentId: string }
    | { type: "gmail"; messageId: string }
    | { type: "url"; url: string }
    | { type: "file"; filePath: string };
}

export interface FormatConversionJobData {
  fileId: string;
  filePath: string;
  mimeType: string;
}
