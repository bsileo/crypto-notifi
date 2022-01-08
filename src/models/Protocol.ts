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
  public name!: string;
  public website!: string;
  public iconURL!: string;
  public chains!: string[];
  public tokenData!: TokenData;

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
    if (this.get("tokenData").chain == "Avalanche") {
      return `https://snowtrace.io/token/${
        this.get("tokenData").contractAddress
      }`;
    } else throw "Chain not configured";
  }
}

Moralis.Object.registerSubclass("Protocol", Protocol);
