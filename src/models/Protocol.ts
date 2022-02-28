import { PositionCache } from "@/notifi_types";
import { SubscriptionLimiter } from "./lib/subscriptionLimits";
import { ContractActivity } from "./ContractActivity";
import { Chain, Contract } from "./Contract";
import Moralis from "moralis";
import { contractsModule } from "@/store/contracts";
import { userModule } from "@/store/user";
import { TokenBalance } from "@/models/NotifiUser";
import { SubscriptionType } from "./SubscriptionType";
import { Position } from "./Position";
import { APIResponse, TokenStatus, ChainEndpoint } from "cookietrack-types";
import { ProtocolStatus } from "./ProtocolStatus";
import {
  LimitType,
  ProtocolLevel,
  SiteStatus,
  StakingLevel,
  SummaryItem,
  TokenData,
} from "@/notifi_types";
import { Subscription } from "./Subscription";
import { protocolsModule } from "@/store/protocol";

type RefreshCallbackFunction = (obj: any) => void;
export class Protocol extends SubscriptionLimiter {
  constructor() {
    super("Protocol");

    this.set("tokenData", {
      symbol: "",
      contractAddress: "",
      chain: "",
      basicQuantity: 0,
      goldQuantity: 0,
    });
  }

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
  set chains(chains: Chain[]) {
    this.set("chains", chains);
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

  get userStakingAddress(): string {
    return this.tokenData?.contractAddress;
  }
  set userStakingAddress(newVal: string) {
    this.tokenData.contractAddress = newVal;
  }

  get goldQuantity(): number {
    const td = this.tokenData;
    return td?.goldQuantity || 0;
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
    return td?.basicQuantity || 0;
  }
  set basicQuantity(val: number) {
    this.tokenData.basicQuantity = val;
  }

  public async isFavorite(): Promise<boolean> {
    const u = Moralis.User.current();
    const rel = u.relation("FavoriteProtocols");
    const prots: Array<Protocol> = await rel.query().find();
    const found = prots.find((p) => p.id == this.id);
    return found != undefined;
  }

  public async toggleFavorite(): Promise<boolean> {
    const fav = await this.isFavorite();
    console.log("FAV:" + fav);
    const u = Moralis.User.current();
    if (fav) {
      u.relation("FavoriteProtocols").remove(this);
      await u.save();
      return false;
    } else {
      u.relation("FavoriteProtocols").add(this);
      await u.save();
      return true;
    }
  }

  public async positions(refresh?: boolean): Promise<Position[]> {
    if (!refresh) {
      const pos = protocolsModule.positions;
      const myPos = pos[this.id];
      if (myPos) return myPos.data;
    }
    const config = await Moralis.Config.get();
    const cookieAPI = config.get("cookieAPIURL");
    const chain = this.chains[0];
    const name = this.get("cookieName");
    const addr = Moralis.User.current().get("accounts")[0];
    const res: Position[] = [];
    if (name && addr) {
      const url = `${cookieAPI}/${chain}/${name}?address=${addr}`;
      console.log(url);
      try {
        const resp = await fetch(url);
        const result = (await resp.json()) as APIResponse;
        console.log(result);
        if (result.status == "ok") {
          result.data.forEach(async (aPos: any) => {
            const pos = new Position(aPos, this);
            res.push(pos);
            await pos.fetchSubscription();
          });
        }
      } catch (err: any) {
        console.log("Fetch failed - " + err.message);
      }
    }
    protocolsModule.SavePositions({ protocol: this, positions: res });
    return res;
  }

  public async getPosition(
    chain: Chain,
    address: string,
    status: TokenStatus
  ): Promise<Position | undefined> {
    const positions = await this.positions();
    console.log(positions);

    const pos = positions.find((p: Position) => {
      return (
        ChainEndpoint[p.chain] == chain &&
        p.address == address &&
        p.status == status
      );
    });
    return pos;
  }

  async managers(): Promise<string[]> {
    const m = this.relation("Managers");
    return await m.query().fetch();
  }

  async managersCount(): Promise<number> {
    const r = this.relation("Managers");
    return await r.query().count();
  }

  async subscriptionsCount(): Promise<number> {
    const subs = new Moralis.Query(Subscription);
    subs.equalTo("Protocol", this);
    return await subs.count();
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

  static async fetch(id: string): Promise<Protocol> {
    const q = new Moralis.Query(Protocol);
    const p = await q.get(id);
    return p;
  }

  static spawn(name: string, website: string, iconURL?: string): Protocol {
    const a = new Protocol();
    a.set("name", name);
    a.set("website", website);
    if (iconURL) a.set("iconURL", iconURL);
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
  // return the current Users wallet balance for my User Staking token
  getWalletBalance(): number | string {
    let token = undefined;
    const tokens = userModule.tokens;
    if (!tokens) {
      return "";
    }
    if (this.get("tokenData")) {
      token = userModule.tokens.find(
        (e: TokenBalance) => e?.symbol == this.symbol
      );
    }
    if (token) {
      return (token.balance / 10 ** token.decimals).toFixed(2);
    }
    return 0;
  }
  getUserLevel(): ProtocolLevel {
    const bal = this.getWalletBalance();
    if (!this.tokenData) {
      return ProtocolLevel.Free;
    }
    if (bal >= this.goldQuantity) {
      return ProtocolLevel.Gold;
    } else if (bal >= this.basicQuantity) {
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

  // Gets the token balances for me StakingWallet/StakingChain for Protocol level staking
  async getStakingTokens(): Promise<TokenBalance[]> {
    const options = {
      chain: this.protocolStakingChain,
      address: this.protocolStakingWallet,
    };
    const balances = await Moralis.Web3API.account.getTokenBalances(options);
    return balances;
  }

  // Status of this protocol on the overall website -  Is it active / being managed?
  get protocolSiteStatus(): SiteStatus {
    return this.get("siteStatus");
  }
  set protocolSiteStatus(s: SiteStatus) {
    this.set("siteStatus", s);
  }

  get protocolPendingVotes(): number {
    const ps = this.get("ProtocolStatus");
    if (!ps || !ps.isDataAvailable()) {
      throw "Data not retrieved with Protocol Query";
    }
    return ps.get("sitePendingVotes");
  }

  async retrieveProtocolPendingVotes(): Promise<number> {
    const ps = await this.getProtocolStatus();
    const votes = ps.get("sitePendingVotes");
    return votes;
  }

  async getProtocolStatus(): Promise<any> {
    let ps = this.get("ProtocolStatus");
    if (!ps || !ps.isDataAvailable()) {
      const qps = new Moralis.Query("ProtocolStatus");
      qps.equalTo("Protocol", this);
      ps = await qps.first();
      if (!ps) {
        ps = await this.makeProtocolStatus();
      }
    }
    return ps;
  }

  async makeProtocolStatus(): Promise<any> {
    let ps = ProtocolStatus.spawn(this);
    ps = await ps.save();
    this.set("ProtocolStatus", ps);
    this.save();
    return ps;
  }

  async siteVote(): Promise<number> {
    let ps = await this.getProtocolStatus();
    const rel = ps.relation("Voters");
    rel.add(Moralis.User.current());
    ps = await ps.save();
    const votes = await rel.query().count();
    ps.set("sitePendingVotes", votes);
    ps.save();
    return votes;
  }

  subscriptionLimits(): {
    [key in StakingLevel]: { [key in LimitType]: number };
  } {
    const limits: { [key in StakingLevel]: { [key in LimitType]: number } } = {
      Free: {
        Category: 1,
        Contracts: 1,
        Events: 3,
        Managers: 1,
        Subscriptions: 10,
      },
      Basic: {
        Category: 5,
        Contracts: 10,
        Events: 5,
        Managers: 3,
        Subscriptions: 100,
      },
      Gold: {
        Category: 10,
        Contracts: 100,
        Events: 10,
        Managers: 10,
        Subscriptions: 1000,
      },
    };
    return limits;
  }

  async subscriptionQuantities(): Promise<Record<LimitType, number>> {
    return {
      Category: await this.categoryCount(),
      Contracts: await this.contractsCount(),
      Events: await this.contractActivityCount(),
      Managers: await this.managersCount(),
      Subscriptions: 0,
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
      if (man.id == currentUser?.id) return true;
    }
    return false;
  }
  tokenContractURL(): string {
    if (this.get("tokenData")) {
      const chain = this.userStakingChain as Chain;
      if (chain == "avalanche") {
        return `https://snowtrace.io/token/${this.stakingAddress}`;
      } else if (chain == "eth") {
        return `https://etherscan.io/address/${this.stakingAddress}`;
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
