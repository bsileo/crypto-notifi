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
import { TokenBalance, UserModel } from "../models/User";

@Module({ dynamic: true, store: store, namespaced: true, name: "User" })
export class UserModule extends VuexModule {
  _user: Partial<UserModel> = {};
  _userTokens: TokenBalance[] = [];

  get user(): Partial<UserModel> {
    return this._user;
  }

  get tokens(): TokenBalance[] {
    return this._userTokens;
  }

  @Mutation
  SET_USER(user: UserModel): void {
    this._user = user;
    //this.fetchUserTokens();
  }

  @Mutation
  SET_TOKENS(userTokens: TokenBalance[]): void {
    this._userTokens = userTokens;
  }

  @Action
  async fetchUserTokens(chain?: Chain): Promise<void> {
    const options = {
      chain: chain ? chain : "avalanche",
    };
    const balances: TokenBalance[] =
      await Moralis.Web3API.account.getTokenBalances(options);
    this.SET_TOKENS(balances);
  }
}

export const userModule = getModule(UserModule);
