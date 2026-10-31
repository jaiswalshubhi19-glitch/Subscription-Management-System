export interface AIProvider {
  name: string;
  isConfigured(): boolean;
  generateExplanation(
    question: string,
    verifiedContext: Record<string, unknown>
  ): Promise<string>;
}
