import Moralis from "moralis";
import { Protocol } from "./Protocol";
import { SubscriptionTypes, AlertHistoryStatus, SubscriptionTypesName } from "@/notifi_types";

export class AlertHistory extends Moralis.Object {
  constructor() {
    super("AlertHistory");
  }

  static async fetchByAlertID(id: string): Promise<AlertHistory> {
    const query = new Moralis.Query("AlertHistory");
    query.equalTo("AlertID", id);
    let res = await query.first();
    if (!res) {
      // Check if we have an AlertHistory ID instead
      const query2 = new Moralis.Query("AlertHistory");
      res = await query2.get(id);
    }
    return res;
  };


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
