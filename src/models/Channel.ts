import { NotifiUser } from "@/models/NotifiUser";
import { useUserChannelsStore } from "@/store/pinia_userChannel";
import Moralis from "moralis";
import { Subscription } from "@/models/Subscription";
import {
  ChannelNames,
  ProviderIDSymbols,
  UserChannelStatus,
} from "@/notifi_types";
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

  get providerID(): ProviderIDSymbols {
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

  public async statusIconInfo(): Promise<Record<"name" | "color", string>> {
    const status = await this.getStatusPlus();
    switch (status) {
      case UserChannelStatus.active:
        return { name: "done", color: "success" };
      case UserChannelStatus.pending:
        return { name: "pending", color: "warning" };
      case UserChannelStatus.pendingSent:
        return { name: "pending", color: "warning" };
    }
    return { name: "report_off", color: "danger" };
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

  public async sendVerification(): Promise<boolean> {
    const params = { userChannelID: this.id };
    const val: boolean = await Moralis.Cloud.run(
      "resendVerificationMessage",
      params
    );

    return val;
  }

  get providerName(): ChannelNames {
    const ucStore = useUserChannelsStore();
    const chans = ucStore.definedChannels
    const res = chans.find((e) => e.id == this.providerID);
    if (res) {
      return res.name;
    }
    throw (
      "UserChannel.providernName - Mismatched Channel ProviderID not found for " +
      this.id
    );
  }

  get providerIcon(): string {
    const pid = this.providerID;
    switch (pid) {
      case ProviderIDSymbols.twilio:
        return "sms";
      case ProviderIDSymbols.email:
        return "email";
      case ProviderIDSymbols.telegram:
        return "telegram";
    }
    return "email";
  }

  get channelDescription(): string {
    const pid = this.providerID;
    switch (pid) {
      case ProviderIDSymbols.twilio:
        return `${this.providerData.to}`;
      case ProviderIDSymbols.email:
        return `${this.providerData.email}`;
      case ProviderIDSymbols.telegram:
        return `${this.providerData.to}`;
    }
    return "email";
  }

  get url(): string {
    return `/my_channels/${this.id}`;
  }

  get tokenCost(): number {
    const pid = this.providerID;
    switch (pid) {
      case "twilio":
        return 500;
      case "email":
        return 100;
      case "telegram":
        return 0;
    }
    return 0;
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
