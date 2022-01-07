import Moralis from "moralis";

export interface AlertModel {
  id: number | string;
  type: string;
  content: string;
}

export class Alert extends Moralis.Object {
  public objectId: string | undefined;
  public timestamp: number;
  public type: string;
  public content: string;

  constructor() {
    // Pass the ClassName to the Moralis.Object constructor
    super("Alert");
    // All other initialization
    this.timestamp = Date.now();
    this.content = "";
    this.type = "General Update";
  }

  static spawn(type: string, content: string): Alert {
    const a = new Alert();
    a.set("type", type);
    a.set("content", content);
    return a;
  }
}

Moralis.Object.registerSubclass("Alert", Alert);
