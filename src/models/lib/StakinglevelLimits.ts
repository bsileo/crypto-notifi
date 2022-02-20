import { LimitType } from "@/notifi_types";

export interface StakingLevelLimits {
  stakingBalance(): Promise<number>;
  subscriptionQuantities(): Promise<Record<LimitType, number>>;
}
