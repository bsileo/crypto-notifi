import { ContractActivity } from "./ContractActivity";
import { Chain, Contract } from "./Contract";
import Moralis from "moralis";
import { contractsModule } from "@/store/contracts";
import { userModule } from "@/store/user";
import { TokenBalance } from "@/models/NotifiUser";
import { SubscriptionType } from "./SubscriptionType";

export enum ProtocolLevel {
  "Free" = "Free",
  "Basic" = "Basic",
  "Gold" = "Gold",
}

export enum StakingLevel {
  "free" = "Free",
  "basic" = "Basic",
  "gold" = "Gold",
}

export type SummaryItem = {
  name: string;
  quantity: number;
  limit: number;
};

export type TokenData = {
  symbol: string;
  contractAddress: string;
  chain: string;
  basicQuantity: number;
  goldQuantity: number;
};

enum LimitType {
  "category" = "Category",
  "contracts" = "Contracts",
  "events" = "Events",
  "managers" = "Managers",
}

type RefreshCallbackFunction = (obj: any) => void;
export class Protocol extends Moralis.Object {
  get name(): string {
    return this.get("name");
  }
  set name(newVal: string) {
    this.set("name", newVal);
  }

  get website(): string {
    return this.get("website");
  }
  set website(newVal: string) {
    this.set("website", newVal);
  }

  get description(): string {
    return this.get("description");
  }
  set description(newVal: string) {
    this.set("description", newVal);
  }

  get iconURL(): string {
    return this.get("iconURL");
  }
  set iconURL(newVal: string) {
    this.set("iconURL", newVal);
  }

  get chains(): Chain[] {
    const chainNames = this.get("chains");
    const chs = contractsModule.CHAINS;
    const res = [] as Chain[];
    if (!chainNames) return res;
    chainNames.forEach((cn: string) => {
      const aChain = chs.find((c) => c == cn);
      if (aChain) {
        res.push(aChain);
      }
    });
    return res;
  }

  get tokenData(): TokenData {
    return this.get("tokenData");
  }

  get symbol(): string {
    return this.tokenData?.symbol;
  }
  set symbol(newVal: string) {
    this.tokenData.symbol = newVal;
  }

  get stakingAddress(): string {
    return this.tokenData?.contractAddress;
  }
  set stakingAddress(newVal: string) {
    this.tokenData.contractAddress = newVal;
  }

  get goldQuantity(): number {
    const td = this.tokenData;
    return td?.goldQuantity;
  }
  set goldQuantity(val: number) {
    const td = this.tokenData;
    td.goldQuantity = val;
    this.set("tokenData", td);
  }

  get userStakingChain(): Chain {
    return this.tokenData?.chain as Chain;
  }
  set userStakingChain(newVal: Chain) {
    this.tokenData.chain = newVal;
  }

  get basicQuantity(): number {
    const td = this.tokenData;
    return td?.basicQuantity;
  }
  set basicQuantity(val: number) {
    this.tokenData.basicQuantity = val;
  }

  async managers(): Promise<string[]> {
    const m = this.relation("Managers");
    return await m.query().fetch();
  }

  async managersCount(): Promise<number> {
    const r = this.relation("Managers");
    return await r.query().count();
  }

  async categoryCount(): Promise<number> {
    const q = new Moralis.Query(SubscriptionType);
    q.equalTo("protocol", this);
    return await q.count();
  }

  async contractActivityCount(): Promise<number> {
    const q = new Moralis.Query(ContractActivity);
    q.equalTo("contract.protocol", this);
    return await q.count();
  }

  async contractsCount(): Promise<number> {
    const q = new Moralis.Query(Contract);
    q.equalTo("protocol", this);
    return await q.count();
  }

  constructor() {
    // Pass the ClassName to the Moralis.Object constructor
    super("Protocol");
    // All other initialization
    this.set("tokendata", {
      symbol: "",
      contractAddress: "",
      chain: "",
      basicQuantity: 0,
      goldQuantity: 0,
    });
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
        (e: TokenBalance) => e?.symbol == this.tokenData.symbol
      );
    }
    if (token) {
      return (token.balance / 10 ** token.decimals).toFixed(2);
    }
    return 0;
  }
  getUserLevel(): ProtocolLevel {
    const bal = this.getWalletBalance();
    if (bal >= this.tokenData.goldQuantity) {
      return ProtocolLevel.Gold;
    } else if (bal >= this.tokenData.basicQuantity) {
      return ProtocolLevel.Basic;
    } else {
      return ProtocolLevel.Free;
    }
  }

  get protocolStakingWallet(): string {
    return this.get("protocolStakingWallet") || "";
  }
  set protocolStakingWallet(newVal: string) {
    this.set("protocolStakingWallet", newVal);
  }

  get protocolStakingChain(): Chain {
    return this.get("protocolStakingChain") as Chain;
  }
  set protocolStakingChain(newVal: Chain) {
    this.set("protocolStakingChain", newVal);
  }

  get stakingBalance(): number {
    let token = undefined;
    const tokens = userModule.tokens;
    if (!tokens) {
      return 0;
    }
    if (this.get("tokenData")) {
      token = userModule.tokens.find((e: TokenBalance) => e.symbol == "Notifi");
    }
    if (token) {
      return parseFloat((token.balance / 10 ** token.decimals).toFixed(2));
    }
    return 0;
  }

  get stakingLevel(): StakingLevel {
    const bal = this.stakingBalance;
    if (bal < 10) {
      return StakingLevel.free;
    } else if (bal < 100) {
      return StakingLevel.basic;
    } else {
      return StakingLevel.gold;
    }
  }

  async subscriptionSummary(): Promise<SummaryItem[]> {
    return [
      {
        name: "Categories",
        quantity: await this.subscriptionQuantity(LimitType.category),
        limit: this.subscriptionLimit(LimitType.category),
      },
      {
        name: "Contracts",
        quantity: await this.subscriptionQuantity(LimitType.contracts),
        limit: this.subscriptionLimit(LimitType.contracts),
      },
      {
        name: "Events",
        quantity: await this.subscriptionQuantity(LimitType.events),
        limit: this.subscriptionLimit(LimitType.events),
      },
      {
        name: "Managers",
        quantity: await this.subscriptionQuantity(LimitType.managers),
        limit: this.subscriptionLimit(LimitType.managers),
      },
    ];
  }

  async subscriptionQuantity(limType: LimitType): Promise<number> {
    const quans = await this.subscriptionQuantities();
    return quans[limType];
  }

  subscriptionLimit(limType: LimitType): number {
    const level = this.stakingLevel;
    const limits = this.subscriptionLimits()[level];
    return limits[limType];
  }

  subscriptionLimits(): {
    [key in StakingLevel]: { [key in LimitType]: number };
  } {
    const limits: { [key in StakingLevel]: { [key in LimitType]: number } } = {
      Free: { Category: 1, Contracts: 1, Events: 3, Managers: 1 },
      Basic: { Category: 5, Contracts: 10, Events: 5, Managers: 3 },
      Gold: { Category: 10, Contracts: 100, Events: 10, Managers: 10 },
    };
    return limits;
  }

  async subscriptionQuantities(): Promise<{
    Category: number;
    Contracts: number;
    Events: number;
    Managers: number;
  }> {
    return {
      Category: await this.categoryCount(),
      Contracts: await this.contractsCount(),
      Events: await this.contractActivityCount(),
      Managers: await this.managersCount(),
    };
  }
  // Returns True if the user is allowed to subscribe to aActivity
  // based on the user and protocols current token balances
  userSubscriptionAllowed(aActivity: ContractActivity): boolean {
    const userLevel = this.getUserLevel();
    const actLevel = aActivity.level as ProtocolLevel;
    if (actLevel == ProtocolLevel.Free) {
      return true;
    }
    if (actLevel == ProtocolLevel.Gold) {
      if (userLevel == ProtocolLevel.Gold) {
        return true;
      }
    } else if (actLevel == ProtocolLevel.Basic) {
      if (userLevel == ProtocolLevel.Gold || userLevel == ProtocolLevel.Basic) {
        return true;
      }
    }
    return false;
  }

  ACLName(): string {
    return `Protocol_${this.name}`;
  }

  // returns true if the current user is a manager of this protocol
  async managerOf(): Promise<boolean> {
    const mans = await this.relation("Managers").query().find();
    const currentUser = Moralis.User.current();
    for (let i = 0; i < mans.length; i++) {
      const man = mans[i];
      console.log(man.id == currentUser?.id);
      if (man.id == currentUser?.id) return true;
    }
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
      } else {
        // throw `Chain not configured in protocol.tokenContractURL() for ${this.id}`;
        console.log(
          `Chain not configured in protocol.tokenContractURL() for ${this.id}`
        );
        return "";
      }
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
      refresh(object);
    });
    sub.on("close", () => {
      console.log("Manager Protocol subscription closed");
    });
    return query;
  }
}

Moralis.Object.registerSubclass("Protocol", Protocol);
