//import { userModule } from "./../store/user";
import Moralis from "moralis";
import { UserChannel } from "./Channel";

export class SubscriptionType extends Moralis.Object {
  public type = "";
  public name = "";
}

export interface SubscriptionModel {
  id: number | string;
  name: string;
  protocol: string;
  provider?: string;
}

export interface Chain {
  name: string;
}

export class Subscription extends Moralis.Object {
  public protocol = "";
  public name = "";
  public subscriptionType = "";
  public userID: string | undefined = "";
  public channels: UserChannel[] = [];
  public fromAddress: string | undefined;
  public toAddress: string | undefined;
  public value: number | undefined;
  public valueOperator: string | undefined;

  constructor() {
    // Pass the ClassName to the Moralis.Object constructor
    super("Subscription");
    // All other initialization
  }

  static spawn(
    protocol: string,
    name: string,
    userID: string,
    userChannels: UserChannel[],
    subType: string
  ): Subscription {
    const s = new Subscription();
    s.set("protocol",protocol);
    s.set("name", name);
    s.set("userID", userID);
    s.set("subscriptionType", subType);
    const channels = s.relation("UserChannel");
    userChannels.forEach((chan: UserChannel) => {
      if (chan) {
        channels.add(chan);
      }
    });
    return s;
  }
}

Moralis.Object.registerSubclass("Subscription", Subscription);
