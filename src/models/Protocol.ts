import Moralis from "moralis";

export enum ProtocolLevel {
  "Free" = "Free",
  "Basic" = "Basic",
  "Gold" = "Gold",
}

export type TokenData = {
  symbol: string;
  contractAddress: string;
  chain: string;
  basicQuantity: number;
  goldQuantity: number;
};
export class Protocol extends Moralis.Object {
  get name(): string {
    return this.get("name");
  }

  get website(): string {
    return this.get("website");
  }

  get iconURL(): string {
    return this.get("iconURL");
  }

  get chains(): string[] {
    return this.get("chains");
  }

  get tokenData(): Record<string, string | number> {
    return this.get("tokenData");
  }

  get managers(): string {
    return this.get("managers");
  }

  constructor() {
    // Pass the ClassName to the Moralis.Object constructor
    super("Protocol");
    // All other initialization
  }

  static spawn(name: string, website: string, iconURL: string): Protocol {
    const a = new Protocol();
    a.set("name", name);
    a.set("website", website);
    a.set("iconURL", iconURL);
    return a;
  }

  tokenContractURL(): string {
    if (this.get("tokenData")) {
      const chain = this.get("tokenData").chain;
      if (chain == "Avalanche") {
        return `https://snowtrace.io/token/${
          this.get("tokenData").contractAddress
        }`;
      } else if (chain == "Ethereum") {
        return `https://etherscan.io/address/${
          this.get("tokenData").contractAddress
        }`;
      } else throw "Chain not configured in tokenContractURL()";
    } else {
      return "";
    }
  }
}

Moralis.Object.registerSubclass("Protocol", Protocol);
