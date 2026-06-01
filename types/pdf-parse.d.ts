declare module "pdf-parse" {
  type PdfParseResult = {
    text: string;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export default function pdf(data: any, options?: any): Promise<PdfParseResult>;
}

