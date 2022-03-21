declare module "moralis";
declare module "crypto-notifi" {
  import { Protocol } from "./src/models/Protocol";
  import { SubscriptionType } from "@/models/SubscriptionType";
  import { NotifiUser } from "@/models/NotifiUser";
  export { Protocol, SubscriptionType, NotifiUser };
}
