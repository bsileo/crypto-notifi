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

export class ContractActivity extends Moralis.Object {
  get status(): ActivityStatus {
    return this.get("status");
  }
  get name(): string {
    return this.get("name");
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
  get contract(): Array<Contract> {
    return this.get("contract");
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
