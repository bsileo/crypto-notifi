import Moralis from "moralis";
import { Protocol } from "./Protocol";

export enum SubscriptionTypeStatus {
  "active" = "Active",
  "inactive" = "Inactive",
}
export class SubscriptionType extends Moralis.Object {
  get name(): string {
    return this.get("name");
  }
  set name(newVal: string) {
    this.set("name", newVal);
  }
  get status(): SubscriptionTypeStatus {
    return this.get("status");
  }
  get description(): string {
    return this.get("description");
  }
  set description(newVal: string) {
    this.set("description", newVal);
  }
  get level(): string {
    return this.get("level");
  }
  set level(newVal: string) {
    this.set("level", newVal);
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
    description: string
  ): Promise<SubscriptionType> {
    let s = new SubscriptionType();
    s.set("protocol", protocol);
    s.set("name", name);
    s.set("description", description);
    s.set("status", SubscriptionTypeStatus.active);
    s = await s.save();
    return s;
  }

  static async typesForProtocolID(id: string): Promise<SubscriptionType[]> {
    const q = new Moralis.Query(SubscriptionType);
    const p = new Protocol();
    p.id = id;
    q.equalTo("protocol", p);
    const res = await q.find();
    return res;
  }
}

Moralis.Object.registerSubclass("SubscriptionType", SubscriptionType);
