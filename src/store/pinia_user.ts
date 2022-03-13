import { Chain } from "@/models/Contract";
import Moralis from "moralis";
import { NotifiUser, TokenBalance, UserLevel } from "../models/NotifiUser";
import { defineStore } from "pinia";
import { useUserChannelsStore } from "./pinia_userChannel";
import { useSubscriptionsStore } from "./pinia_subscriptions";
import { Protocol } from "@/models/Protocol";

export const useUserStore = defineStore("user", {
  state: () => {
    return {
      _user: undefined as NotifiUser | undefined,
      _userTokens: undefined as TokenBalance[] | undefined,
    };
  },
  getters: {
    user(): NotifiUser | undefined {
      return this._user;
    },

    tokens(): TokenBalance[] | undefined {
      return this._userTokens;
    },

    currentLevel(): UserLevel {
      const bal = this.NotifiTokens;
      if (bal < 100) return UserLevel.Free;
      else if (bal <= 500) return UserLevel.Basic;
      else if (bal >= 500) return UserLevel.Gold;
      return UserLevel.Free;
    },

    NotifiTokens(): number {
      const address = "0xd3CF2281e6d8C445905c859b3AbE692a707286cf";
      if (!this._userTokens) return 0;
      const info = this._userTokens.find(
        (tok: any) => tok.token_address.toLowerCase() == address.toLowerCase()
      );
      if (!info) {
        return 0;
      }
      const result = Moralis.Units.FromWei(info.balance, info.decimals);
      return result;
    },
  },
  actions: {
    SET_USER(user: NotifiUser): void {
      this._user = user;
      this.fetchUserTokens();
      const userChannelStore = useUserChannelsStore();
      const subscriptionsStore = useSubscriptionsStore();
      userChannelStore.setupChannels();
      subscriptionsStore.fetchSubscriptions();
    },

    SET_TOKENS(userTokens: TokenBalance[]): void {
      this._userTokens = userTokens;
    },

    async fetchUserTokens(chain?: Chain, refresh = false): Promise<void> {
      const user = Moralis.User.current();
      if (!user) return;
      if (!refresh && this._userTokens) return;
      const options = {
        chain: chain ? chain : "avalanche",
      };
      const balances: TokenBalance[] =
        await Moralis.Web3API.account.getTokenBalances(options);
      this._userTokens = balances;
    },
  },
});
