declare module 'mammoth' {
  interface ExtractRawTextResult {
    value: string;
    messages: unknown[];
  }

  interface ExtractRawTextInput {
    arrayBuffer: ArrayBuffer;
  }

  function extractRawText(input: ExtractRawTextInput): Promise<ExtractRawTextResult>;

  const mammoth: { extractRawText: typeof extractRawText };
  export default mammoth;
}
