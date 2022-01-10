import { Chain } from '@/models/Contract';
import { AlertTypes } from "./Alert";
import Moralis from "moralis";
import { UserChannel } from "./Channel";
import { Contract } from "./Contract";
import { ContractActivity } from "./ContractActivity";
import { Protocol } from "./Protocol";

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
export class Subscription extends Moralis.Object {
  public protocol?: Protocol;
  public name = "";
  public subscriptionType = "";
  public userID: string | undefined = "";
  public channels: UserChannel[] = [];
  public fromAddress?: string;
  public toAddress?: string;
  public value?: number;
  public valueOperator?: string;
  public description?: string;
  public contract?: Contract;
  public contractChain?: Chain;
  public contractAddress?: string;
  public contractActivity?: ContractActivity;

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
    subType: AlertTypes
  ): Subscription {
    const s = new Subscription();
    s.set("protocol", protocol);
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
