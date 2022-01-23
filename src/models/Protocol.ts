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

type RefreshCallbackFunction = (obj: any) => void;
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

  AClName(): string {
    return `Protocol_${this.name}`;
  }

  // returns true if the current user is a manager of this protocol
  async managerOf(): Promise<boolean> {
    const mans = await this.relation("Managers").query().find();
    const currentUser = Moralis.User.current();
    console.log(mans);
    for (let i=0; i < mans.length; i++) {
      const man = mans[i];
      console.log(man.id == currentUser?.id);
      if (man.id == currentUser?.id) return true;
    }
    console.log(`Manager false for ${this.name}`);
    return false;
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

  public static async setupSubscription(
    refresh: RefreshCallbackFunction,
    manager?: boolean
  ): Promise<any> {
    const query = new Moralis.Query(Protocol);
    if (manager == true) {
      //const user = userModule._user;
      //const uQuery = new Moralis.Query("User");
      //uQuery.equalTo(user);
      //query.matchesQuery("Managers", uQuery);
    }
    const sub = await query.subscribe();
    sub.on("open", refresh);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sub.on("create", (object: Protocol) => {
      console.log("Manager Protocols object created");
      refresh(object);
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sub.on("update", (object: Protocol) => {
      console.log("Manager Protocols object updated");
      refresh(object);
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sub.on("enter", (object: Protocol) => {
      console.log("Manager Protocols  object entered");
      refresh(object);
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sub.on("leave", (object: Protocol) => {
      console.log("Manager Protocols object left");
      refresh(object);
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sub.on("delete", (object: Protocol) => {
      console.log("Manager Protocols  object deleted");
      refresh(object)
    });
    sub.on("close", () => {
      console.log("Manager Protocol subscription closed");
    });
    return query;
  }
}

Moralis.Object.registerSubclass("Protocol", Protocol);
