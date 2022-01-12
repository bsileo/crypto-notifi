import Moralis from "moralis";
import { Protocol } from "./Protocol";

export enum AlertTypes {
  protocol = "Protocol Alerts",
  wallet = "Smart Wallet Alerts",
  contract = "Smart Contracts",
}

export interface AlertModel {
  id: number | string;
  type: string;
  content: string;
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
  get type(): string {
    return this.get("type");
  }

  get content(): string {
    return this.get("content");
  }

  constructor() {
    // Pass the ClassName to the Moralis.Object constructor
    super("Alert");
    // All other initialization
  }

  static spawn(
    type: string,
    content: string,
    protocol?: Protocol | undefined
  ): Alert {
    const a = new Alert();
    a.set("type", type);
    a.set("content", content);
    if (protocol) {
      a.set("protocol", protocol);
    }
    return a;
  }
}

Moralis.Object.registerSubclass("Alert", Alert);
