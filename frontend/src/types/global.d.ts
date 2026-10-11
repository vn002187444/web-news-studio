interface NetworkInformation {
  readonly effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  readonly rtt?: number;
  readonly downlink?: number;
  readonly saveData?: boolean;
}

interface Navigator {
  readonly connection?: NetworkInformation;
}
