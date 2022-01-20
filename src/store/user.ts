
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
import { UserModel } from "../models/User";

@Module({ dynamic: true, store: store, namespaced: true, name: "User" })
export class UserModule extends VuexModule {
  _user: Partial<UserModel> = {};
  _userTokens: any = null;

  get user(): Partial<UserModel> {
    return this._user;
  }

  get tokens(): any {
    return this._userTokens;
  }

  @Mutation
  SET_USER(user: UserModel): void {
    this._user = user;
    //this.fetchUserTokens();
  }

  @Mutation
  SET_TOKENS(userTokens: any): void {
    this._userTokens = userTokens;
  }

  @Action
  async fetchUserTokens(chain?: Chain): Promise<void> {
    const options = {
      chain: chain ? chain : "avalanche",
    };
    const balances = await Moralis.Web3API.account.getTokenBalances(options);
    this.SET_TOKENS(balances);
  }
}

export const userModule = getModule(UserModule);
