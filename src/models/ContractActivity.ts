import Moralis from "moralis";
import { Chain, Contract } from "./Contract";

export enum ActivityType {
  "other" = "Other",
  "transaction" = "Transaction",
  "event" = "Event",
}

export enum ActivityStatus {
  "active" = "Active",
  "requested" = "Requested",
  "none" = "None",
}

export interface DataParameter {
  name: string;
  type: string;
  source: "system" | "event";
}
export class ContractActivity extends Moralis.Object {
  get status(): ActivityStatus {
    return this.get("status");
  }
  get name(): string {
    return this.get("name");
  }
  set name(val: string) {
    this.set("name", val);
  }

  get chain(): Chain {
    return this.get("chain");
  }
  get type(): ActivityType {
    return this.get("type");
  }
  get ABI(): string {
    return this.get("ABI");
  }
  set ABI(newVal: string) {
    this.set("ABI", newVal);
  }
  get contract(): Array<Contract> {
    return this.get("contract");
  }
  get topic(): string {
    return this.get("topic");
  }
  set topic(newVal: string) {
    this.set("topic", newVal);
  }
  get description(): string {
    return this.get("description");
  }
  set description(newVal: string) {
    this.set("description", newVal);
  }

  get template(): string {
    return this.get("template");
  }
  set template(newVal: string) {
    this.set("template", newVal);
  }

  get dataParameters(): DataParameter[] {
    const params = this.getSystemDataParameters();
    return params;
  }

  getSystemDataParameters(): DataParameter[] {
    return [
      { name: "username", type: "string", source: "system" },
      { name: "contractName", type: "string", source: "system" },
      { name: "subscriptionName", type: "string", source: "system" },
      { name: "transactionValue", type: "number", source: "system" },
      { name: "subscriptionValue", type: "string", source: "system" },
    ];
  }

  constructor() {
    // Pass the ClassName to the Moralis.Object constructor
    super("ContractActivity");
  }

  static spawn(chain: Chain, name: string): ContractActivity {
    const c = new ContractActivity();
    c.set("chain", chain);
    c.set("name", name);
    // Defaults
    c.set("type", ActivityType.other);
    c.set("status", ActivityStatus.requested);
    c.set("contracts", []);
    c.set("ABI", "");
    return c;
  }
}

Moralis.Object.registerSubclass("ContractActivity", ContractActivity);
