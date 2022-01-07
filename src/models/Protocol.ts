import Moralis from "moralis";

export class Protocol extends Moralis.Object {
  public name!: string;
  public website!: string;
  public iconURL!: string;
  public chains!: string[];

  constructor() {
    // Pass the ClassName to the Moralis.Object constructor
    super("Protocol");
    // All other initialization
  }

  static spawn(name: string, website: string, iconURL: string): Protocol {
    const a = new Protocol();
    a.set("name", name);
    a.set("website", website);
    a.set("iconURL", iconURL);
    return a;
  }
}

Moralis.Object.registerSubclass("Protocol", Protocol);
