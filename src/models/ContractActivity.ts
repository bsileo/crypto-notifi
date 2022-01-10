import Moralis from "moralis";
import { Chain, Contract } from "./Contract";

export enum ActivityType {
  "other" = "other",
  "transaction" = "transaction",
  "event" = "Event",
}

export enum EventStatus {
  "active" = "Active",
  "requested" = "Requested",
  "none" = "None",
}

export class ContractActivity extends Moralis.Object {
  public status!: EventStatus;
  public name!: string;
  public chain!: Chain;
  public type!: ActivityType;
  public ABI!: string;
  public contracts!: Array<Contract>;

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
    c.set("status", EventStatus.requested);
    c.set("contracts", []);
    c.set("ABI", "");
    return c;
  }
}

Moralis.Object.registerSubclass("ContractActivity", ContractActivity);
