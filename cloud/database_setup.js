/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
//
// URL to run this:
//  https://dfnrl9oy6cjp.usemoralis.com:2053/server/functions/databaseSetup?_ApplicationId=vNzZEcsSUFcPhfxYFqNbfMXVyfp2cNSX8tha5TwW
//
// Safe to run on an existing database to update/reset it to the starting state for all configurations
//
//

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Moralis.Cloud.define("databaseSetup", async (request) => {
  let res = {};

  res.protocols = await setupProtocols();
  res.contracts = await setupContracts();

  // *******************************************
  //
  // Setup Default Contract Watchers
  //
  // *******************************************
  // code example of creating a sync event from cloud code
  let options = {
    chainId: "0x1",
    address: "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f",
    topic: "PairCreated(address, address, address, uint)",
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "token0",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "token1",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "pair",
          type: "address",
        },
        { indexed: false, internalType: "uint256", name: "", type: "uint256" },
      ],
      name: "PairCreated",
      type: "event",
    },
    tableName: "UniswapPairCreated",
    sync_historical: false,
  };

  Moralis.Cloud.run("watchContractEvent", options, { useMasterKey: true });
  res.watchers = true;

  return res;
});
