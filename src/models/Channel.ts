import { NotifiUser } from "@/models/NotifiUser";
import { channelsModule } from "@/store/channels";
import Moralis from "moralis";
import { Subscription } from "./Subscription";

export interface ChannelModel {
  id: number | string;
  name: string;
  provider?: string;
  multiple: boolean;
}

export enum UserChannelStatus {
  "pending" = "Pending Verification",
  "pendingSent" = "Verification Sent",
  "active" = "Active",
  "optout" = "Opted Out",
}

export class UserChannel extends Moralis.Object {
  subscriptionCounter: undefined | number = undefined;
  _statusPlus: UserChannelStatus | undefined = undefined;
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

  get user(): NotifiUser {
    const u = this.get("User");
    return u;
  }

  get providerData(): Record<string | number, unknown> {
    return this.get("providerData");
  }
  set providerdata(data: Record<string | number, unknown>) {
    this.set("providerData", data);
  }

  get status(): UserChannelStatus {
    const stat = this.get("status") as UserChannelStatus;
    if (stat == UserChannelStatus.pending) {
      const code = this.get("verificationCode");
      if (code == "system") {
        const u = Moralis.User.current();
        const val = u.get("emailVerified");
        if (val) return UserChannelStatus.active;
        else return UserChannelStatus.pendingSent;
      }
    }
    return stat;
  }
  set status(status: UserChannelStatus) {
    this.set("status", status);
  }

  get statusPlus(): UserChannelStatus | undefined {
    if (this._statusPlus == undefined) {
      this.getStatusPlus().then((val) => {
        this._statusPlus = val;
      });
    }
    return this._statusPlus;
  }

  public async getStatusPlus(): Promise<UserChannelStatus> {
    const stat = this.get("status") as UserChannelStatus;
    if (stat == UserChannelStatus.pending) {
      const code = this.get("verificationCode");
      if (code == "system") {
        const val = await this.emailVerified();
        if (val) return UserChannelStatus.active;
        else return UserChannelStatus.pendingSent;
      }
    }
    return stat;
  }

  public async emailVerified(): Promise<any> {
    const val: any = await Moralis.Cloud.run("emailVerified");
    return val;
  }

  get providerName(): string | null {
    const res = channelsModule.channels.find((e) => e.id == this.providerID);
    if (res) {
      return res.name;
    } else {
      return null;
    }
  }

  get providerIcon(): string {
    const pid = this.providerID;
    switch (pid) {
      case "twilio":
        return "sms";
      case "email":
        return "email";
      case "telegram":
        return "telegram";
    }
    return "email";
  }

  static spawn(
    name: string,
    userID: string | undefined,
    providerID: string
  ): UserChannel {
    const us = new UserChannel();
    us.set("userID", userID);
    us.set("User", Moralis.User.current());
    us.set("providerID", providerID);
    us.set("name", name);
    us.set("status", UserChannelStatus.pending);
    return us;
  }

  public async initialize(): Promise<void> {
    //await this.fetchSubscriptionCount();
  }

  public setProviderData(providerData: Record<string | number, unknown>): void {
    this.set("providerData", providerData);
    if (providerData.status) {
      this.status = providerData.status as UserChannelStatus;
    }
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
