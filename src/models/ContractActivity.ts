import { ProtocolLevel } from '@/notifi_types';
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
  get contract(): Contract {
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
  get level(): ProtocolLevel {
    return this.get("level");
  }
  set level(newVal: ProtocolLevel) {
    this.set("level", newVal);
  }

  get nameAndLevel(): string {
    return `${this.name} (${this.level})`;
  }
  get template(): string {
    return this.get("template");
  }
  set template(newVal: string) {
    this.set("template", newVal);
  }

  get richTemplate(): string {
    return this.get("richTemplate");
  }
  set richTemplate(newVal: string) {
    this.set("richTemplate", newVal);
  }

  get dataParameters(): DataParameter[] {
    const params = this.getSystemDataParameters();
    params.push(...this.getABIParameters());
    return params;
  }

  getABIParameters(): DataParameter[] {
    const res: DataParameter[] = [];
    try {
      const raw = eval("(" + this.ABI + ")");
      const inputs = raw.inputs;
      inputs.forEach((element: DataParameter) => {
        res.push({
          name: element.name,
          type: element.type,
          source: "event",
        });
      });
    } catch (error) {
      console.log(`Failed to parse ABI for ${this.id}`);
    }
    return res;
  }
  getSystemDataParameters(): DataParameter[] {
    return [
      { name: "address", type: "string", source: "system" },
      { name: "activityName", type: "string", source: "system" },
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
