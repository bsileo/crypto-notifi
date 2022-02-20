import { LimitType } from "@/notifi_types";

export interface StakingLevelLimits {
  stakingBalance(): number;
  subscriptionQuantities(): Promise<Record<LimitType, number>>;
}
