import { Chain } from "@/models/Contract";
import { AlertTypes } from "./Alert";
import Moralis from "moralis";
import { UserChannel } from "./Channel";
import { Contract } from "./Contract";
import { ContractActivity } from "./ContractActivity";
import { Protocol } from "./Protocol";

export class Subscription extends Moralis.Object {
  get protocol(): Protocol {
    return this.get("protocol");
  }
  get generalType(): string {
    return this.get("generalType");
  }
  get name(): string {
    return this.get("name");
  }
  get subscriptionType(): string {
    return this.get("subscriptionType");
  }
  get subscriptionDescriptor(): string {
    const typ = this.subscriptionType;
    if (typ === "General") {
      return `${typ} (${this.generalType})`;
    }
    return typ;
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
    return this.get("contractActvity");
  }

  myChannelNames = "";
  get channels(): UserChannel[] {
    return [];
  }
  get channelNames(): string {
    return "";
  }

  constructor() {
    // Pass the ClassName to the Moralis.Object constructor
    super("Subscription");
    // All other initialization
  }

  static async spawn(
    protocol: string,
    name: string,
    userID: string,
    subType: AlertTypes
  ): Promise<Subscription> {
    let s = new Subscription();
    s.set("protocol", protocol);
    s.set("name", name);
    s.set("userID", userID);
    s.set("subscriptionType", subType);
    s = await s.save();
    s.setChannelNames();
    return s;
  }

  public async initialize(): Promise<void> {
    //await this.setChannelNames();
  }

  public async setChannelNames(): Promise<string | undefined> {
    const rel = this.relation("UserChannel");
    const q = rel.query();
    let names = "";
    q.find().then((myChans: UserChannel[]) => {
      myChans.forEach((chan: UserChannel) => {
        names = `${names}, ${chan.get("name")}`;
      });
      console.log("Names" + names);
      this.myChannelNames = names.slice(2, names.length);
    });
    return this.channelNames;
  }

  public async setUserChannels(channels: UserChannel[]): Promise<void> {
    const myChans = this.relation("UserChannel");
    channels.forEach(async (chan: UserChannel) => {
      if (chan) {
        myChans.add(chan);
        chan.relation("subscriptions").add(this);
        chan.increment("SubscriptionCount");
        await chan.save();
        await this.save();
        this.setChannelNames();
      }
    });
  }
}

Moralis.Object.registerSubclass("Subscription", Subscription);
