import { SubscriptionType } from "@/models/SubscriptionType";
import { SubscriptionTypes } from "./Subscription";
import Moralis from "moralis";
import { Protocol } from "./Protocol";

export interface AlertModel {
  id: number | string;
  type: string;
  content: string;
}

export interface AlertContent {
  plain: string;
  rich: string;
}

export class Alert extends Moralis.Object {
  get createdAt(): string {
    return this.get("createdAt");
  }
  get shortDateTime(): string {
    const d = new Date(this.createdAt);
    //console.log(this.createdAt);
    //console.log(d);
    return d.toLocaleDateString("en-us", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }
  get type(): SubscriptionTypes {
    return this.get("type");
  }

  get content(): string {
    return this.get("content");
  }

  get richContent(): string {
    let con: null | string = this.get("richContent");
    if (!con) {
      con = this.content;
    }
    return con;
  }

  constructor() {
    // Pass the ClassName to the Moralis.Object constructor
    super("Alert");
    // All other initialization
  }

  static spawn(
    subType: SubscriptionType,
    content: AlertContent,
    protocol?: Protocol | undefined
  ): Alert {
    const a = new Alert();
    a.set("type", subType.get("type"));
    a.set("Type", subType);
    a.set("content", content.plain);
    a.set("richContent", content.rich);
    if (protocol) {
      a.set("protocol", protocol);
      a.set("protocolID", protocol.id);
    }
    return a;
  }
}

Moralis.Object.registerSubclass("Alert", Alert);
