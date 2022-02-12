import { Subscription, SubscriptionTypes } from "@/models/Subscription";
import { TokenType, TokenStatus, PricedToken, Chain } from "cookietrack-types";
import Moralis from "moralis";
import { Protocol } from "./Protocol";

export enum Operators {
  ">",
  "<",
  "Changed By",
}

type ValuePredicate = {
  operator: Operators;
  value: number;
};

export class Position extends Object {
  private _name: string;
  private _balance: number;
  private _price: number;
  private _symbol: string;
  private _address: string;
  private _type: TokenType;
  private _logo: string;
  private _data: Record<any, any>;
  private _subscription: Subscription | undefined;
  private _protocol: Protocol;
  private _chain: Chain;
  private valuePredicate?: ValuePredicate;

  constructor(jsonData: any, protocol: Protocol) {
    super();
    this._balance = jsonData.balance;
    this._price = jsonData.price;
    this._symbol = jsonData.symbol;
    this._address = jsonData.address;
    this._type = jsonData.type;
    this._logo = jsonData.logo;
    this._data = jsonData;
    this._protocol = protocol;
    this._chain = jsonData.chain;
    if (this._type == "lpToken") {
      const tok0 = jsonData.token0;
      const tok1 = jsonData.token1;
      this._name = `${tok0.symbol}-${tok1.symbol} (LP Position)`;
    } else {
      this._name = `${this._symbol} (Token)`;
    }
    this.fetchSubscription();
  }

  get name(): string {
    return this._name;
  }
  set name(val: string) {
    this._name = val;
  }

  get status(): TokenStatus {
    return this._data.status;
  }
  public get symbol(): string {
    return this._symbol;
  }
  public set symbol(value: string) {
    this._symbol = value;
  }

  public get price(): number {
    return this._price;
  }
  public set price(value: number) {
    this._price = value;
  }

  public get balance(): number {
    return this._balance;
  }
  public set balance(value: number) {
    this._balance = value;
  }

  public get value(): number {
    if (this._type == "lpToken") {
      if (this.token0 && this.token1) {
        const bal0 = this.token0.balance || 0;
        const price0 = this.token0.price || 0;
        const bal1 = this.token1.balance || 0;
        const price1 = this.token1.price || 0;
        return bal1 * price1 + bal0 * price0;
      }
      return 0;
    } else {
      return this.price * this.balance;
    }
    return 0;
  }
  public get chain(): Chain {
    return this._chain;
  }
  public get address(): string {
    return this._address;
  }
  public set address(value: string) {
    this._address = value;
  }

  public get type(): TokenType {
    return this._type;
  }
  public set type(value: TokenType) {
    this._type = value;
  }

  public get logo(): string {
    return this._logo;
  }
  public set logo(value: string) {
    this._logo = value;
  }

  public get token0(): PricedToken | undefined {
    if (this.type == "lpToken") {
      return this._data.token0;
    }
    return undefined;
  }
  public get token1(): PricedToken | undefined {
    if (this.type == "lpToken") {
      return this._data.token1;
    }
    return undefined;
  }

  public get protocol(): Protocol {
    return this._protocol;
  }
  public set protocol(value: Protocol) {
    this._protocol = value;
  }

  public get positionHigh(): number | undefined {
    if (this._subscription) {
      const val = this._subscription.get("positionHigh");
      if (val) {
        return parseFloat(val);
      }
    }
    return undefined;
  }
  public get positionLow(): number | undefined {
    if (this._subscription) {
      const val = this._subscription.get("positionLow");
      if (val) {
        return parseFloat(val);
      }
    }
    return undefined;
  }

  get subscription(): Subscription | undefined {
    return this._subscription;
  }

  async fetchSubscription(): Promise<Subscription | undefined> {
    const subs = new Moralis.Query("Subscription");
    subs.equalTo("subscriptionType", SubscriptionTypes.position);
    subs.equalTo("contractAddress", this._address);
    subs.equalTo("positionStatus", this.status);
    const sub = (await subs.first()) as unknown;
    this._subscription = sub as Subscription;
    return sub as Subscription | undefined;
  }

  async makeSubscription(): Promise<Subscription> {
    const sub = await Subscription.spawnPosition(
      this.name,
      Moralis.User.current(),
      this
    );
    this._subscription = await sub.save();
    return sub;
  }
}
