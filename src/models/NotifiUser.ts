import { userModule } from "@/store/user";
import Moralis from "moralis/types";

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
export interface UserModel extends Moralis.User<Moralis.Attributes> {
  createdAt: Date;
}

export class NotifiUser extends Moralis.User {
  constructor(attributes: Moralis.Attributes) {
    super(attributes);
  }

  currentLevel(): UserLevel {
    const bal = this.tokenBalance();
    if (bal < 100 ) return UserLevel.Free;
    else if (bal <= 500) return UserLevel.Basic;
    else if (bal >= 500) return UserLevel.Gold;
    return UserLevel.Free;
  }

  tokenBalance(): number {
    const tokens = userModule.tokens;
    if (!tokens) {
      return 0;
    }
    const token = tokens.find((e: TokenBalance) => e.symbol == "Notifi");
    if (token) {
      return parseFloat((token.balance / 10 ** token.decimals).toFixed(2));
    }
    return 0;
  }
}

Moralis.Object.registerSubclass("_User", NotifiUser);
