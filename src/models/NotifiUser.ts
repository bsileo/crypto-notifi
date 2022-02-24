import Moralis from "moralis";
import { LimitType, SummaryItem, UserSummaryItem } from "@/notifi_types";
import { Subscription } from "./Subscription";
import { UserChannel } from "./Channel";

export type TokenBalance = {
  token_address: string;
  name: string;
  symbol: string;
  logo: string;
  thumbnail: string;
  decimals: number;
  balance: number;
};

export enum UserLevel {
  "Free" = "free",
  "Basic" = "basic",
  "Gold" = "gold",
}
/*export interface UserModel extends Moralis.User<Moralis.Attributes> {
  createdAt: Date;
}
*/

export class NotifiUser extends Moralis.User {
  constructor(attributes: any) {
    super(attributes);
  }

  static async currentLevel(): Promise<UserLevel> {
    const bal = await this.tokenBalance();
    if (bal < 100) return UserLevel.Free;
    else if (bal <= 500) return UserLevel.Basic;
    else if (bal >= 500) return UserLevel.Gold;
    return UserLevel.Free;
  }

  static async tokenBalance(): Promise<number> {
    const bal = Moralis.Cloud.run("NotifiBalance");
    return bal;
  }

  async subscriptionSummary(): Promise<SummaryItem[]> {
    return [
      {
        name: "Subscriptions",
        quantity: await this.subscriptionQuantity(LimitType.subscriptions),
        limit: this.subscriptionLimit(LimitType.subscriptions),
      },
    ];
  }
  async getCostSummaryItems(): Promise<UserSummaryItem[]> {
    const res: UserSummaryItem[] = [];
    res.push(...(await this.channelSummaryItems()));
    res.push(...(await this.subscriptionSummaryItems()));
    return res;
  }

  async channelSummaryItems(): Promise<UserSummaryItem[]> {
    const chans = await this.channels();
    const res: UserSummaryItem[] = chans.map((chan: UserChannel) => {
      return {
        type: "Channel",
        detail: chan.providerName,
        name: chan.name,
        tokenCost: chan.tokenCost,
        status: "Active",
        relatedItem: chan,
      };
    });
    return res;
  }

  async channels(): Promise<UserChannel[]> {
    const q = new Moralis.Query(UserChannel);
    const u = Moralis.User.current();
    q.equalTo("User", u);
    return q.find();
  }
  async subscriptionSummaryItems(): Promise<UserSummaryItem[]> {
    const subs = await this.subscriptions();
    const res: UserSummaryItem[] = subs.map((sub: Subscription) => {
      return {
        type: "Subscription",
        detail: sub.subscriptionType,
        name: sub.name,
        tokenCost: sub.tokenCost,
        status: "Active",
        relatedItem: sub,
        costPriority: sub.costPriority,
      };
    });
    return res;
  }

  async subscriptions(): Promise<Subscription[]> {
    const q = new Moralis.Query(Subscription);
    const u = Moralis.User.current();
    q.equalTo("User", u);
    return q.find();
  }
}

Moralis.Object.registerSubclass("_User", NotifiUser);
