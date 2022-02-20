import { TokenBalance } from './../NotifiUser';
import { LimitType, StakingLevel, SummaryItem } from "@/notifi_types";
import Moralis from "moralis";
import { StakingLevelLimits } from "./StakinglevelLimits";
import { userModule } from '@/store/user';

export class SubscriptionLimiter
  extends Moralis.Object
  implements StakingLevelLimits
{
  constructor(name: string) {
    super(name);
  }
  subscriptionQuantities(): Promise<Record<LimitType, number>> {
    throw new Error("Method not implemented.");
  }

  async stakingBalance(): Promise<number> {
    let token = undefined;
    const tokens = await this.getStakingTokens();
    console.log(tokens);
    if (!tokens) {
      return 0;
    }
    token = tokens.find(
      (e: TokenBalance) =>
        e.token_address == "0xd3cf2281e6d8c445905c859b3abe692a707286cf"
    );
    console.log(token);
    if (token) {
      return parseFloat((token.balance / 10 ** token.decimals).toFixed(2));
    }
    return 0;
  }

  // return a collection of Token balances for the wallet used to track staking for this entity
  async getStakingTokens(): Promise<TokenBalance[]> {
    return userModule.tokens;
  }

  async subscriptionSummary(): Promise<SummaryItem[]> {
    return [
      {
        name: "Categories",
        quantity: await this.subscriptionQuantity(LimitType.category),
        limit: await this.subscriptionLimit(LimitType.category),
      },
      {
        name: "Contracts",
        quantity: await this.subscriptionQuantity(LimitType.contracts),
        limit: await this.subscriptionLimit(LimitType.contracts),
      },
      {
        name: "Events",
        quantity: await this.subscriptionQuantity(LimitType.events),
        limit: await this.subscriptionLimit(LimitType.events),
      },
      {
        name: "Managers",
        quantity: await this.subscriptionQuantity(LimitType.managers),
        limit: await this.subscriptionLimit(LimitType.managers),
      },
      {
        name: "Subscriptions",
        quantity: await this.subscriptionQuantity(LimitType.subscriptions),
        limit: await this.subscriptionLimit(LimitType.subscriptions),
      },
    ];
  }

  async subscriptionQuantity(limType: LimitType): Promise<number> {
    const quans = await this.subscriptionQuantities();
    return quans[limType];
  }

  async subscriptionLimit(limType: LimitType): Promise<number> {
    const level = await this.stakingLevel();
    const limits = this.subscriptionLimits()[level];
    return limits[limType];
  }

  async stakingLevel(): Promise<StakingLevel> {
    const bal = await this.stakingBalance();
    if (bal < this.stakingLimit(StakingLevel.free)) {
      return StakingLevel.free;
    } else if (bal < this.stakingLimit(StakingLevel.basic)) {
      return StakingLevel.basic;
    } else {
      return StakingLevel.gold;
    }
  }

  stakingLimit(s: StakingLevel): number {
    if (s == StakingLevel.free) return 10;
    if (s == StakingLevel.basic) return 100;
    if (s == StakingLevel.gold) return 1000;
    return 0;
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
}
