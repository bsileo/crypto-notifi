import Moralis from "moralis";
import { Protocol } from "./Protocol";

export class ProtocolStatus extends Moralis.Object {
  constructor() {
    super("ProtocolStatus");
  }

  static spawn(p: Protocol): ProtocolStatus {
    const ps = new ProtocolStatus();
    ps.set("sitePendingVotes", 0);
    ps.set("Protocol", p);
    return ps;
  }

  set claimName(e: string) {
    this.set("claimName", e);
  }

  set claimEmail(e: string) {
    this.set("claimEmail", e);
  }

  set discordServer(s: string) {
    this.set("discordServer", s);
  }

  set discordUser(s: string) {
    this.set("discordUser", s);
  }

  set claimStarted(started: boolean) {
    this.set("claimStarted", started);
  }
}

Moralis.Object.registerSubclass("ProtocolStatus", ProtocolStatus);
