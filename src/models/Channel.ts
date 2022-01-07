import Moralis from "moralis";

export interface ChannelModel {
  id: number | string;
  name: string;
  provider?: string;
  multiple: boolean;
}

export class UserChannel extends Moralis.Object {
  public userID!: string | undefined;
  public providerID!: string;
  public providerData!: Record<string | number, unknown>;
  public name!: string;

  constructor() {
    // Pass the ClassName to the Moralis.Object constructor
    super("UserChannel");
    // All other initialization
  }

  static spawn(
    name: string,
    userID: string | undefined,
    providerID: string
  ): UserChannel {
    const us = new UserChannel();
    us.set("userID", userID);
    us.set("providerID", providerID);
    us.set("name", name);
    return us;
  }

  public setProviderData(providerData: Record<string | number, unknown>): void {
    this.set("providerData", providerData);
  }
}

Moralis.Object.registerSubclass("UserChannel", UserChannel);
