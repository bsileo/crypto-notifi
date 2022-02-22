import {
  SubscriptionStatus,
  SubscriptionTypes,
  SubscriptionTypesName,
  UserFrequency,
} from "./../notifi_types";
import { ValueOperatorSymbol } from "@/notifi_types";
import { NotifiUser } from "@/models/NotifiUser";
import { SubscriptionType } from "@/models/SubscriptionType";
import { Chain } from "@/models/Contract";
import Moralis from "moralis";
import { UserChannel, UserChannelStatus } from "./Channel";
import { Contract } from "./Contract";
import { ContractActivity } from "./ContractActivity";
import { Protocol } from "./Protocol";
import { Position } from "./Position";
import { ChainEndpoint, TokenStatus } from "cookietrack-types";
import { prettyNumber } from "@/Utilities";


export class Subscription extends Moralis.Object {
  constructor() {
    super("Subscription");
  }

  static async fetch(id: string): Promise<Subscription> {
    const q = new Moralis.Query(Subscription);
    const s = await q.get(id);
    return s;
  }

  get protocol(): Protocol {
    return this.get("Protocol");
  }
  set protocol(p: Protocol) {
    this.set("Protocol", p);
  }

  get generalType(): SubscriptionType {
    return this.get("GeneralSubType");
  }
  get category(): SubscriptionType {
    return this.get("GeneralSubType");
  }
  set category(cat: SubscriptionType) {
    this.set("GeneralSubType", cat);
  }

  get frequency(): typeof UserFrequency {
    return this.get("userFrequency");
  }
  set frequency(f: typeof UserFrequency) {
    this.set("userFrequency", f);
  }

  // Return the name of the Subscription Type I am associated with.
  generalTypeName(): string {
    const ty = this.generalType;
    return ty?.get("name");
  }
  get name(): string {
    return this.get("name");
  }
  set name(val: string) {
    this.set("name", val);
  }

  get subscriptionType(): SubscriptionTypesName {
    return this.get("subscriptionType") as SubscriptionTypesName;
  }
  set subscriptionType(st: SubscriptionTypesName) {
    this.set("subscriptionType", st);
  }

  get userID(): string | undefined {
    return this.get("userID");
  }
  get user(): NotifiUser {
    return this.get("User");
  }
  set user(u: NotifiUser) {
    this.set("User", u);
    this.set("userID", u.id); // legacy code compatibility
  }

  get fromAddress(): string {
    return this.get("fromAddress");
  }
  get toAddress(): string {
    return this.get("toAddress");
  }
  get value(): number {
    return parseFloat(this.get("value"));
  }
  get valueOperator(): ValueOperatorSymbol {
    return this.get("valueOperator");
  }
  get description(): string {
    return this.get("description");
  }
  set description(val: string) {
    this.set("description", val);
  }
  get contract(): Contract {
    return this.get("contract");
  }
  get contractChain(): Chain {
    return this.get("contractChain");
  }

  get contractAddress(): string {
    return this.get("contractAddress");
  }



  internalShortContractAddress(): string {
    return (
      this.contractAddress.slice(1, 6) +
      "..." +
      this.contractAddress.substring(this.contractAddress.length - 4)
    );
  }

  internalContractURL(): string {
    const chain = this.contractChain;
    if (chain == "avalanche") {
      return `https://snowtrace.io/address/${this.contractAddress}`;
    } else if (chain == "eth") {
      return `https://etherscan.io/address/${this.contractAddress}`;
    } else {
      //throw `Chain not configured in contract.contractURL() for ${this.id} = ${chain}`;
      console.log(
        `Chain not configured in subscription.contractURL() for ${this.id} = ${chain}`
      );
    }
    return "";
  }

  get contractActivity(): ContractActivity {
    return this.get("contractActivity");
  }

  get status(): SubscriptionStatus {
    return this.get("status");
  }

  get positionLow(): number | undefined {
    return this.get("positionLow");
  }
  set positionLow(val: number | undefined) {
    if (val) this.set("positionLow", parseFloat(val.toString()));
    else this.unset("positionLow");
  }
  get positionHigh(): number | undefined {
    return this.get("positionHigh");
  }
  set positionHigh(val: number | undefined) {
    if (val) this.set("positionHigh", parseFloat(val.toString()));
    else this.unset("positionHigh");
  }
  get positionBaseline(): number | undefined {
    return this.get("positionBaseline");
  }
  set positionBaseline(val: number | undefined) {
    if (val) this.set("positionBaseline", parseFloat(val.toString()));
    else this.unset("positionBaseline");
  }

  get positionStatus(): TokenStatus {
    return this.get("positionStatus");
  }
  set positionStatus(s: TokenStatus) {
    this.set("positioonStatus", s);
  }

  positionDescription(): string {
    if (this.subscriptionType == SubscriptionTypes.position)
      if (this.positionLow && this.positionHigh) {
        return `Below $${prettyNumber(
          this.positionLow
        )} / Above $${prettyNumber(this.positionHigh)}`;
      }
    if (this.positionLow) return `less than $${prettyNumber(this.positionLow)}`;
    if (this.positionHigh)
      return `greater than $${prettyNumber(this.positionHigh)}`;
    return "";
  }

  async channelCount(): Promise<number> {
    return await this.get("UserChannel").query().count();
  }
  async channels(): Promise<UserChannel[]> {
    const r = this.relation("UserChannel");
    const q = r.query();
    return await q.find();
  }
  async channelsDescription(): Promise<string> {
    const c = await this.channels();
    const names = c.map((elem) => elem.name);
    return names.toString();
  }

  static getACL(user: NotifiUser): any {
    const acl = new Moralis.ACL();
    acl.setReadAccess(user.id, true);
    acl.setWriteAccess(user.id, true);
    acl.setRoleWriteAccess("admins", true);
    acl.setRoleReadAccess("admins", true);
    acl.setRoleReadAccess("protocolManagers", true);
    return acl;
  }

  static async spawnPosition(
    name: string,
    user: any,
    position: Position
  ): Promise<Subscription> {
    const sub = await Subscription.spawn(
      name,
      user.id,
      SubscriptionTypes.position,
      position.protocol
    );
    sub.set("contractAddress", position.address);
    sub.set("contractChain", ChainEndpoint[position.chain]);
    sub.set("positionStatus", position.status);
    sub.setACL(this.getACL(user));
    return sub;
  }

  static async spawn(
    name: string,
    userID: string,
    subType: SubscriptionTypesName,
    protocol?: Protocol
  ): Promise<Subscription> {
    const s = new Subscription();
    if (protocol) {
      s.set("Protocol", protocol);
    }
    s.set("name", name);
    s.set("userID", userID);
    s.set("User", Moralis.User.current());
    s.set("subscriptionType", subType);
    s.set("status", SubscriptionStatus.active);
    //s = await s.save();
    return s;
  }

  static async widgetSpawn(
    protocol: Protocol,
    name: string,
    user: NotifiUser,
    subType: SubscriptionType
  ): Promise<boolean> {
    const sub = new Subscription();
    sub.set("protocol", this.protocol.name);
    sub.set("Protocol", this.protocol);
    sub.set("description", "Widget Subscription");
    sub.set("subscriptionType", SubscriptionTypes.protocol);
    sub.set("GeneralSubType", subType);

    sub.setACL(this.getACL(user));

    sub.save().then(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (uc: Subscription) => {
        // Execute any logic that should take place after the object is saved.
        //uc.setUserChannels(userChans);
        return true;
      },
      (error: { message: string }) => {
        // Execute any logic that should take place if the save fails.
        // error is a Moralis.Error with an error code and message.
        alert("Failed to save object, with error code: " + error.message);
      }
    );
    return true;
  }

  public async setUserChannels(channels: UserChannel[]): Promise<void> {
    const myChans = this.relation("UserChannel");
    myChans.add(channels);
    const q = myChans.query();
    const current = await q.find();
    current.forEach((curChan: UserChannel) => {
      const idx = channels.findIndex(
        (newChan: UserChannel) => newChan.id == curChan.id
      );
      if (idx == -1) {
        myChans.remove(curChan);
      }
    });
    await this.save();
  }
}

Moralis.Object.registerSubclass("Subscription", Subscription);
