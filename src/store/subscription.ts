import {
  Module,
  VuexModule,
  Mutation,
  getModule,
} from "vuex-module-decorators";
import { store } from ".";

import Moralis from "@/config/moralis";
import { Subscription } from "@/models/Subscription";
import { SubscriptionType } from "@/models/SubscriptionType";

@Module({
  dynamic: true,
  store: store,
  namespaced: true,
  name: "Subscriptions",
})
export class SubscriptionsModule extends VuexModule {
  SUBSCRIPTIONS: Array<Subscription> = [];
  SUBSCRIPTIONTYPES: Array<SubscriptionType> = [];

  get mySubscriptions(): Array<Subscription> {
    return this.SUBSCRIPTIONS;
  }

  @Mutation
  public AddSubscription(sub: Subscription): void {
    this.SUBSCRIPTIONS.push(sub);
    sub.initialize();
  }

  @Mutation
  public RemoveSubscription(sub: Subscription): void {
    sub.destroy();
  }

  @Mutation
  public SetMySubscriptions(subs: Subscription[]): void {
    this.SUBSCRIPTIONS = subs;
    subs.forEach((s: Subscription) => {
      s.initialize();
    });
  }
  @Mutation
  public SetMySubscriptionTypes(subs: SubscriptionType[]): void {
    this.SUBSCRIPTIONTYPES = subs;
  }
}

export const subscriptionsModule = getModule(SubscriptionsModule);

export const setupMySubscriptionsSub = async (): Promise<void> => {
  const query = new Moralis.Query(Subscription);
  query.include("contract");
  query.include("contractActivity");
  query.include("UserChannel");
  const subscription = await query.subscribe();
  
  const query2 = new Moralis.Query("GeneralSubscriptionTypes");
  subscriptionsModule.SetMySubscriptionTypes(await query2.find());

  const refresh = (): void => {
    query.find().then(async (results: Array<Subscription>) => {
      console.log("Initial Subscription objects created");
      subscriptionsModule.SetMySubscriptions(results);
    });
  };
  subscription.on("open", () => {
    query.find().then((results: Array<Subscription>) => {
      subscriptionsModule.SetMySubscriptions(results);
    });
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("create", (object: Subscription) => {
    //console.log("object created");
    //subscriptionsModule.AddSubscription(object);
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("update", (object: Subscription) => {
    // console.log("object updated");
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("enter", (object: Subscription) => {
    // console.log("object entered");
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("leave", (object: Subscription) => {
    // console.log("object left");
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("delete", (object: Subscription) => {
    // console.log("object deleted");
    refresh();
  });
  subscription.on("close", () => {
    console.log("Subscriptions subscription closed");
  });
};
setupMySubscriptionsSub();
