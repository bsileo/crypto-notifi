import { Chain, Contract } from "./Contract";
import Moralis from "moralis";
import { contractsModule } from "@/store/contracts";
import { userModule } from "@/store/user";

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

  get description(): string {
    return this.get("description");
  }

  get iconURL(): string {
    return this.get("iconURL");
  }

  get chains(): Chain[] {
    const chainNames = this.get("chains");
    const chs = contractsModule.CHAINS;
    const res = [] as Chain[];
    chainNames.forEach((cn: string) => {
      const aChain = chs.find((c) => c == cn);
      if (aChain) {
        res.push(aChain);
      }
    });
    return res;
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

  // return the set of contracts that have me as their parent
  async contracts(): Promise<Contract[]> {
    const q = new Moralis.Query(Contract);
    q.equalTo("protocol", this);
    q.include("ContractActivities");
    const res = await q.find();
    return res;
  }
  // return the current Users wallet ba;ance for my toekn
  getWalletBalance(): number | string {
    let token = undefined;
    const tokens = userModule.tokens;
    if (!tokens) {
      return "";
    }
    if (this.get("tokenData")) {
      token = userModule.tokens.find(
        (e: any) => e?.symbol == this.get("tokenData").symbol
      );
    }
    if (token) {
      return (token.balance / 10 ** token.decimals).toFixed(2);
    }
    return 0;
  }
  getUserLevel(): ProtocolLevel {
    const bal = this.getWalletBalance();
    if (bal > this.tokenData.goldQuantity) {
      return ProtocolLevel.Gold;
    } else if (bal > this.tokenData.basicQuantity) {
      return ProtocolLevel.Basic;
    } else {
      return ProtocolLevel.Free;
    }
  }

  tokenContractURL(): string {
    if (this.get("tokenData")) {
      const chain = this.get("tokenData").chain as Chain;
      if (chain == "avalanche") {
        return `https://snowtrace.io/token/${
          this.get("tokenData").contractAddress
        }`;
      } else if (chain == "eth") {
        return `https://etherscan.io/address/${
          this.get("tokenData").contractAddress
        }`;
      } else
        throw `Chain not configured in protocol.tokenContractURL() for ${this.id}`;
    } else {
      return "";
    }
  }
}

Moralis.Object.registerSubclass("Protocol", Protocol);
