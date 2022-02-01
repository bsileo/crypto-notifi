import { NotifiUser } from "@/models/NotifiUser";
import { SubscriptionType } from "@/models/SubscriptionType";
import { Chain } from "@/models/Contract";
import Moralis from "moralis";
import { UserChannel } from "./Channel";
import { Contract } from "./Contract";
import { ContractActivity } from "./ContractActivity";
import { Protocol } from "./Protocol";

export enum SubscriptionStatus {
  "active" = "active",
  "paused" = "paused",
}
export enum SubscriptionTypes {
  protocol = "Protocol Alerts",
  contract = "Smart Contracts",
  wallet = "My Wallet",
}

export class Subscription extends Moralis.Object {
  get protocol(): Protocol {
    return this.get("Protocol");
  }
  set protocol(p: Protocol) {
    this.set("Protocol", p);
  }

  get generalType(): SubscriptionType {
    return this.get("GeneralSubType");
  }
  // Return the name of the Subscription Type I am associated with.
  generalTypeName(): string {
    const ty = this.generalType;
    return ty?.get("name");
  }
  get name(): string {
    return this.get("name");
  }
  set name(val: string) {
    this.set("name", val);
  }

  get subscriptionType(): SubscriptionTypes {
    return this.get("subscriptionType") as SubscriptionTypes;
  }

  get userID(): string | undefined {
    return this.get("userID");
  }
  get fromAddress(): string {
    return this.get("fromAddress");
  }
  get toAddress(): string {
    return this.get("toAddress");
  }
  get value(): number {
    return this.get("value");
  }
  get valueOperator(): string {
    return this.get("valueOperator");
  }
  get description(): string {
    return this.get("description");
  }
  set description(val: string) {
    this.set("description", val);
  }
  get contract(): Contract {
    return this.get("contract");
  }
  get contractChain(): Chain {
    return this.get("contractChain");
  }

  get contractAddress(): string {
    return this.get("contractAddress");
  }

  get contractActivity(): ContractActivity {
    return this.get("contractActivity");
  }

  get status(): SubscriptionStatus {
    return this.get("status");
  }

  async channelCount(): Promise<number> {
    return await this.get("UserChannel").query().count();
  }
  async channels(): Promise<UserChannel[]> {
    const r = this.relation("UserChannel");
    const q = r.query();
    return await q.find();
  }
  async channelsDescription(): Promise<string> {
    const c = await this.channels();
    const names = c.map((elem) => elem.name);
    return names.toString();
  }

  constructor() {
    // Pass the ClassName to the Moralis.Object constructor
    super("Subscription");
    // All other initialization
  }

  static getACL(user: NotifiUser): any {
    const acl = new Moralis.ACL();
    acl.setReadAccess(user.id, true);
    acl.setWriteAccess(user.id, true);
    acl.setRoleWriteAccess("admins", true);
    acl.setRoleReadAccess("admins", true);
    acl.setRoleReadAccess("protocolManagers", true);
    return acl;
  }

  static async spawn(
    name: string,
    userID: string,
    subType: SubscriptionTypes,
    protocol?: Protocol
  ): Promise<Subscription> {
    const s = new Subscription();
    if (protocol) {
      s.set("Protocol", protocol);
    }
    s.set("name", name);
    s.set("userID", userID);
    s.set("subscriptionType", subType);
    s.set("status", SubscriptionStatus.active);
    //s = await s.save();
    return s;
  }

  static async widgetSpawn(
    protocol: Protocol,
    name: string,
    user: NotifiUser,
    subType: SubscriptionType
  ): Promise<boolean> {
    const sub = new Subscription();
    sub.set("protocol", this.protocol.name);
    sub.set("Protocol", this.protocol);
    sub.set("description", "Widget Subscription");
    sub.set("subscriptionType", SubscriptionTypes.protocol);
    sub.set("GeneralSubType", subType);

    sub.setACL(this.getACL(user));

    sub.save().then(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (uc: Subscription) => {
        // Execute any logic that should take place after the object is saved.
        //uc.setUserChannels(userChans);
        return true;
      },
      (error: { message: string }) => {
        // Execute any logic that should take place if the save fails.
        // error is a Moralis.Error with an error code and message.
        alert("Failed to save object, with error code: " + error.message);
      }
    );
    return true;
  }

  public async setUserChannels(channels: UserChannel[]): Promise<void> {
    const myChans = this.relation("UserChannel");
    channels.forEach(async (chan: UserChannel) => {
      console.log(chan);
      if (chan) {
        myChans.add(chan);
        chan.relation("subscriptions").add(this);
        await chan.save();
        await this.save();
      }
    });
  }
}

Moralis.Object.registerSubclass("Subscription", Subscription);
