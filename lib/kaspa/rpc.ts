const KASPA_API_BASE =
  process.env.KASPA_API_URL || "https://api.kaspa.org";

class KaspaAPI {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  // Get address balance using REST API
  async getBalance(address: string): Promise<number> {
    const response = await fetch(
      `${this.baseUrl}/addresses/${address}/balance`,
      { cache: "no-store" }
    );
    if (!response.ok) {
      throw new Error(`Failed to get balance: ${response.statusText}`);
    }
    const data = await response.json();
    // Balance is returned in sompi (1 KAS = 100,000,000 sompi)
    return (data.balance || 0) / 1e8;
  }

  // Get address UTXOs
  async getUtxosByAddress(address: string): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/addresses/${address}/utxos`,
      { cache: "no-store" }
    );
    if (!response.ok) {
      throw new Error(`Failed to get UTXOs: ${response.statusText}`);
    }
    const data = await response.json();
    return data || [];
  }

  // Get transaction by ID (with resolved input addresses)
  async getTransaction(txId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/transactions/${txId}?inputs=true&resolve_previous_outpoints=light`,
      { cache: "no-store" }
    );
    if (!response.ok) {
      throw new Error(`Failed to get transaction: ${response.statusText}`);
    }
    return response.json();
  }

  // Get transactions for an address
  async getTransactionsByAddress(
    address: string,
    limit: number = 20
  ): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/addresses/${address}/full-transactions?limit=${limit}&resolve_previous_outpoints=light`,
      { cache: "no-store" }
    );
    if (!response.ok) {
      throw new Error(`Failed to get transactions: ${response.statusText}`);
    }
    return response.json();
  }

  // Get block DAG info
  async getBlockDagInfo(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/info/blockdag`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Failed to get block DAG info: ${response.statusText}`);
    }
    return response.json();
  }

  // Get network info
  async getNetworkInfo(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/info/network`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Failed to get network info: ${response.statusText}`);
    }
    return response.json();
  }

  // Check if address is valid
  isValidAddress(address: string): boolean {
    return (
      (address.startsWith("kaspa:") || address.startsWith("kaspatest:")) &&
      address.length > 40
    );
  }
}

// Export singleton instance
export const kaspaAPI = new KaspaAPI(KASPA_API_BASE);

// Get KAS to USD price
export async function getKaspaPrice(): Promise<number> {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=usd",
      { next: { revalidate: 60 } } as any
    );
    const data = await response.json();
    return data.kaspa?.usd || 0;
  } catch (error) {
    console.error("Error fetching Kaspa price:", error);
    return 0;
  }
}

// Convert KAS to USD
export async function kasToUsd(kasAmount: number): Promise<number> {
  const price = await getKaspaPrice();
  return kasAmount * price;
}

// Convert USD to KAS
export async function usdToKas(usdAmount: number): Promise<number> {
  const price = await getKaspaPrice();
  return price > 0 ? usdAmount / price : 0;
}
