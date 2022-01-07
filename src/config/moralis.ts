import * as Moralis from "moralis";
import { AppConfig } from "./index";

Moralis.start({
  serverUrl: AppConfig.MORALIS_SERVER_URL,
  appId: AppConfig.MORALIS_APPID,
});

const MoralisConfig = Moralis;

export default MoralisConfig;
