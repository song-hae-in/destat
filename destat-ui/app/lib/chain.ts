import { defineChain } from "viem";

export const kairos = defineChain({
  id: 1001,
  name: "Kaia Kairos Testnet",
  nativeCurrency: {
    name: "KAIA",
    symbol: "KAIA",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://public-en-kairos.node.kaia.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Kairos Scope",
      url: "https://kairos.kaiascope.com",
    },
  },
});

export const kairosRpcUrl =
  import.meta.env.VITE_KAIROS_RPC_URL ??
  "https://public-en-kairos.node.kaia.io";
