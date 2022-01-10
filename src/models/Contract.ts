import Moralis from "moralis";
import { ContractActivity } from "./ContractActivity";
import { Protocol } from "./Protocol";

export enum ContractType {
  "token" = "Token",
  "other" = "other",
}

export enum ContractStatus {
  "active" = "Active",
  "requested" = "Requested",
}

// Borrow from Moralis Types since not exported
type EthChain = "eth" | "mainnet" | "0x1";
type RopstenChain = "testnet" | "ropsten" | "0x3";
type RinkebyChain = "rinkeby" | "0x4";
type GoerliChain = "goerli" | "0x5";
type KovanChain = "kovan" | "0x2a";
type BscChain = "bsc" | "binance" | "binance smart chain" | "0x38";
type BscTestChain =
  | "bsc testnet"
  | "binance testnet"
  | "binance smart chain testnet"
  | " 0x61";
type PolygonChain = "matic" | "polygon" | "0x89";
type MumbaiChain = "mumbai" | "matic testnet" | "polygon testnet" | "0x13881";
type FantomChain = "fantom" | "ftm" | "0xfa";
type AvalancheChain = "avalanche" | "avax" | "0xa86a";
type AvalancheTestChain =
  | "avalanche testnet"
  | "avax testnet"
  | "0xa869"
  | "fuji";
type LocalDevChain =
  | "ganache"
  | "hardhat"
  | "localdevchain"
  | "local devchain"
  | "dev"
  | "0x539";

export type Chain =
  | EthChain
  | RopstenChain
  | RinkebyChain
  | GoerliChain
  | KovanChain
  | BscChain
  | BscTestChain
  | PolygonChain
  | MumbaiChain
  | FantomChain
  | AvalancheChain
  | AvalancheTestChain
  | LocalDevChain;

export class Contract extends Moralis.Object {
  public status!: ContractStatus;
  public name!: string;
  public address!: number;
  public chain!: Chain;
  public protocol?: Protocol | undefined;
  public type!: ContractType;
  public events!: Array<ContractActivity>;

  constructor() {
    // Pass the ClassName to the Moralis.Object constructor
    super("Contract");
  }

  static spawn(chain: Chain, address: string): Contract {
    const c = new Contract();
    c.set("chain", chain);
    c.set("address", address);
    // Defaults
    c.set("type", ContractType.other);
    c.set("status", ContractStatus.requested);
    c.set("events", []);
    c.set("name", "");
    return c;
  }

  // Add the new event to my events set. If it is already there based on name we do nothing.
  public addEvent(ev: ContractActivity): boolean {
    if (this.events.find((e) => e.name === ev.name)) {
      return false;
    }
    this.events.push(ev);
    return true;
  }
}

Moralis.Object.registerSubclass("Contract", Contract);
