import Moralis from "moralis";
import { Protocol } from "./Protocol";
import { SubscriptionTypes, AlertHistoryStatus, SubscriptionTypesName } from "@/notifi_types";

export class AlertHistory extends Moralis.Object {
  constructor() {
    super("AlertHistory");
  }

  get createdAt(): string {
    return this.get("createdAt");
  }
  get shortDateTime(): string {
    const d = new Date(this.createdAt);
    return d.toLocaleDateString("en-us", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }
  get subscriptionTypeName(): SubscriptionTypesName {
    return this.get("SubscriptionType");
  }

  get status(): AlertHistoryStatus {
    return this.get("status");
  }

  get content(): string {
    return this.get("content").plain;
  }

  get richContent(): string {
    return this.get("content").rich;
  }

  get protocol(): Protocol {
    return this.get("Protocol");
  }
}

Moralis.Object.registerSubclass("AlertHistory", AlertHistory);
