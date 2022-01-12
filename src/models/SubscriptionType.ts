import Moralis from "moralis";
import { Protocol } from "./Protocol";

export enum SubscriptionTypeStatus {
  "active" = "Active",
  "inactive" = "Inactive",
}
export class SubscriptionType extends Moralis.Object {
  get type(): string {
    return this.get("type");
  }
  get name(): string {
    return this.get("name");
  }
  get status(): SubscriptionTypeStatus {
    return this.get("status");
  }
  get description(): string {
    return this.get("description");
  }
  get protocol(): string {
    return this.get("protocol");
  }
  constructor() {
    // Pass the ClassName to the Moralis.Object constructor
    super("SubscriptionType");
  }
  static async spawn(
    protocol: Protocol,
    name: string,
    type: string,
    description: string
  ): Promise<SubscriptionType> {
    let s = new SubscriptionType();
    s.set("protocol", protocol);
    s.set("name", name);
    s.set("type", type);
    s.set("description", description);
    s.set("status", SubscriptionTypeStatus.active);
    s = await s.save();
    return s;
  }
}

Moralis.Object.registerSubclass("SubscriptionType", SubscriptionType);
