import * as Moralis from "moralis";
import { AppConfig } from "./index";

Moralis.start({
  serverUrl: AppConfig.MORALIS_SERVER_URL,
  appId: AppConfig.MORALIS_APPID,
});

const MoralisConfig = Moralis;

export default MoralisConfig;

/*Moralis.onAccountChanged( async (account: any) => {
  const confirmed = confirm("Link this address to your Notifi account?");
  if (confirmed) {
    await Moralis.link(account);
  }
});
*/