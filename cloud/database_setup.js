/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
//
// URL to run this:
//  https://dfnrl9oy6cjp.usemoralis.com:2053/server/functions/databaseSetup?_ApplicationId=vNzZEcsSUFcPhfxYFqNbfMXVyfp2cNSX8tha5TwW
//
// Safe to run on an existing database to update/reset it to the starting state for all configurations
//
// Show server logs
//  moralis-admin-cli get-logs --moralisApiKey XXXXXXXXXXXX --moralisApiSecret XXXXXXXXXXXXXXX
//
// 
//

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Moralis.Cloud.define("databaseSetup", async (request) => {
  let res = {};

  res.protocols = await setupProtocols();
  res.contracts = await setupContracts();

  return res;
});
