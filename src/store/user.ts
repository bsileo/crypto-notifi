import { channelsModule } from "./channels";
import { Chain } from "@/models/Contract";
import Moralis from "moralis";
import {
  Module,
  VuexModule,
  Mutation,
  getModule,
  Action,
} from "vuex-module-decorators";
import { store } from ".";
import { NotifiUser, TokenBalance, UserLevel } from "../models/NotifiUser";

@Module({ dynamic: true, store: store, namespaced: true, name: "User" })
export class UserModule extends VuexModule {
  _user: NotifiUser | undefined = undefined;
  _userTokens: TokenBalance[] = [];

  get user(): NotifiUser | undefined {
    return this._user;
  }

  get tokens(): TokenBalance[] {
    return this._userTokens;
  }

  get currentLevel(): UserLevel {
    const bal = this.NotifiTokens;
    if (bal < 100) return UserLevel.Free;
    else if (bal <= 500) return UserLevel.Basic;
    else if (bal >= 500) return UserLevel.Gold;
    return UserLevel.Free;
  }

  get NotifiTokens(): number {
    const address = "0xd3CF2281e6d8C445905c859b3AbE692a707286cf";
    const info = this._userTokens.find(
      (tok: any) => tok.token_address.toLowerCase() == address.toLowerCase()
    );
    if (!info) {
      return 0;
    }
    const result = Moralis.Units.FromWei(info.balance, info.decimals);
    return result;
  }

  @Mutation
  SET_USER(user: NotifiUser): void {
    this._user = user;
    //this.fetchUserTokens();
    channelsModule.setupChannels();
  }

  @Mutation
  SET_TOKENS(userTokens: TokenBalance[]): void {
    this._userTokens = userTokens;
  }

  @Action
  async fetchUserTokens(chain?: Chain): Promise<void> {
    const user = Moralis.User.current();
    if (!user) return;
    const options = {
      chain: chain ? chain : "avalanche",
    };
    const balances: TokenBalance[] =
      await Moralis.Web3API.account.getTokenBalances(options);
    this.SET_TOKENS(balances);
  }
}

export const userModule = getModule(UserModule);
