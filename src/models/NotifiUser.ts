import Moralis from "moralis";
import { LimitType, SummaryItem } from "@/notifi_types";

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

    /*const address = "0xd3CF2281e6d8C445905c859b3AbE692a707286cf";
    const options = { chain: "avalanche" };
    const tokens = await Moralis.Web3API.account.getTokenBalances(options);
    const info = tokens.find(
      (tok: any) => tok.token_address.toLowerCase() == address.toLowerCase()
    );
    const result = Moralis.Units.FromWei(info.balance, info.decimals);
    return result;*/
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

  
}

Moralis.Object.registerSubclass("_User", NotifiUser);
