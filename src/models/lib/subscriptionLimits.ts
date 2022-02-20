import { LimitType, StakingLevel, SummaryItem } from "@/notifi_types";
import Moralis from "moralis";
import { StakingLevelLimits } from "./StakinglevelLimits";

export class SubscriptionLimiter
  extends Moralis.Object
  implements StakingLevelLimits
{
  constructor(name: string) {
    super(name);
  }
  stakingBalance(): number {
    throw new Error("Method not implemented.");
  }
  subscriptionQuantities(): Promise<Record<LimitType, number>> {
    throw new Error("Method not implemented.");
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
      {
        name: "Subscriptions",
        quantity: await this.subscriptionQuantity(LimitType.subscriptions),
        limit: this.subscriptionLimit(LimitType.subscriptions),
      },
    ];
  }

  async subscriptionQuantity(limType: LimitType): Promise<number> {
    const quans = await this.subscriptionQuantities();
    return quans[limType];
  }

  subscriptionLimit(limType: LimitType): number {
    const level = this.stakingLevel();
    const limits = this.subscriptionLimits()[level];
    return limits[limType];
  }

  stakingLevel(): StakingLevel {
    const bal = this.stakingBalance();
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
