import { channelsModule } from "@/store/channels";
import Moralis from "moralis";
import { Subscription } from "./Subscription";

export interface ChannelModel {
  id: number | string;
  name: string;
  provider?: string;
  multiple: boolean;
}

export class UserChannel extends Moralis.Object {
  subscriptionCounter: undefined | number = undefined;

  constructor() {
    // Pass the ClassName to the Moralis.Object constructor
    super("UserChannel");
    // All other initialization
  }

  get name(): string {
    return this.get("name");
  }

  get providerID(): string {
    return this.get("providerID");
  }

  get subscriptionCount(): number | undefined {
    if (this.subscriptionCounter == undefined) {
      this.fetchSubscriptionCount();
    }
    return this.subscriptionCounter;
  }

  get userID(): string {
    return this.get("userID");
  }

  get providerData(): Record<string | number, unknown> {
    return this.get("providerData");
  }

  get providerName(): string | null {
    const res = channelsModule.channels.find((e) => e.id == this.providerID);
    if (res) {
      return res.name;
    } else {
      return null;
    }
  }

  static spawn(
    name: string,
    userID: string | undefined,
    providerID: string
  ): UserChannel {
    const us = new UserChannel();
    us.set("userID", userID);
    us.set("providerID", providerID);
    us.set("name", name);
    return us;
  }

  public async initialize(): Promise<void> {
    //await this.fetchSubscriptionCount();
  }

  public setProviderData(providerData: Record<string | number, unknown>): void {
    this.set("providerData", providerData);
  }

  public async getSubscriptionCount(): Promise<number> {
    const q = this.relation("subscriptions").query();
    const count = await q.count();
    console.log(`${this.name} SUB Count ${count}`);
    return count;
  }

  public fetchSubscriptionCount(): void {
    this.getSubscriptionCount().then((count) => {
      this.subscriptionCounter = count;
    });
  }

  public async removeSubscription(sub: Subscription): Promise<boolean> {
    const subs = this.relation("subscriptions");
    subs.remove(sub);
    const chans = sub.relation("UserChannel");
    chans.remove(this);
    await this.save();
    await sub.save();
    return true;
  }
  public async addSubscription(sub: Subscription): Promise<boolean> {
    const subs = this.relation("subscriptions");
    subs.add(sub);
    const chans = sub.relation("UserChannel");
    chans.add(this);
    await this.save();
    await sub.save();
    return true;
  }
}

Moralis.Object.registerSubclass("UserChannel", UserChannel);
