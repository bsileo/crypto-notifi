import { Moralis } from "moralis";
import { Subscription } from "@/models/Subscription";
import { defineStore } from "pinia";

export const useSubscriptionsStore = defineStore("subscriptions", {
  state: () => {
    return {
      subscriptions: [] as Subscription[],
      loading: false,
      rawCount: 0,
    };
  },
  getters: {
  },
  actions: {
    async fetchSubscriptions(): Promise<void> {
      const aUser = Moralis.User.current();
      if (!aUser) {
        console.log("No user for subs");
        return;
      }
      this.loading = true;
      const query = new Moralis.Query(Subscription);
      query.equalTo("User", aUser);
      this.rawCount = await query.count();
      query.include("contractActivity");
      query.include("contract");
      query.include("GeneralSubType");
      query.include("Group");
      this.subscriptions = await query.find();
      this.subscribe(query);
      this.loading = false;
    },
    async subscribe(aQuery: any) {
      const subscription = await aQuery.subscribe();
      subscription.on("create", (sub: Subscription) => {
        this.subscriptions.push(sub);
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      subscription.on("update", (sub: Subscription) => {
        const index = this.subscriptions.findIndex((e) => e.id == sub.id);
        if (index > -1) {
          this.subscriptions.splice(index, 1, sub);
        }
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      subscription.on("enter", (sub: Subscription) => {
        // console.log("object entered");
        this.subscriptions.push(sub);
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      subscription.on("leave", (sub: Subscription) => {
        const index = this.subscriptions.findIndex((e) => e.id == sub.id);
        if (index > -1) {
          this.subscriptions.splice(index, 1);
        }
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      subscription.on("delete", (sub: Subscription) => {
        const index = this.subscriptions.findIndex((e) => e.id == sub.id);
        if (index > -1) {
          this.subscriptions.splice(index, 1);
        }
      });
      subscription.on("close", () => {
        console.log("Subscriptions subscription closed");
      });
    },
  },
});
