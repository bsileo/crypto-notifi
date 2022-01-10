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
async function setupContracts() {
  const logger = Moralis.Cloud.getLogger();
  const protocol = Moralis.Object.extend("Protocol");

  const contracts = [
    {
      protocolName: "Uniswap-V2",
      contractName: "Uniswap Pair Tester",
      address: "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f",
      chain: "eth",
      activities: [{ name: "PairCreated", chain: "eth", type: "event" }],
    },
    {
      protocolName: "Snowball",
      contractName: "Compounding-Benqi/QI",
      address: "0x124f5991e1ead696d3082139154db787e52f4c87",
      chain: "avalanche",
      activities: [
        { name: "Transfer", chain: "avalanche", type: "event" },
        { name: "Approval", chain: "avalanche", type: "event" },
      ],
    },
    {
      protocolName: "Snowball",
      contractName: "Compounding-Benqi/Dai.e",
      address: "0x7b2525a502800e496d2e656e5b1188723e547012",
      chain: "avalanche",
      activities: [
        { name: "Transfer", chain: "avalanche", type: "event" },
        { name: "Approval", chain: "avalanche", type: "event" },
      ],
    },
  ];
  let c = null;
  for (let j = 0; j < contracts.length; j++) {
    contractInfo = contracts[j];
    let pQuery = new Moralis.Query(protocol);
    pQuery.equalTo("name", contractInfo.protocolName);
    pRes = await pQuery.find();
    if (pRes.length > 0) {
      p = pRes[0];
    } else {
      p = new protocol();
    }
    logger.info(`Processing ${contractInfo.contractName}`);
    contract = Moralis.Object.extend("Contract");
    query = new Moralis.Query(contract);
    query.equalTo("address", contractInfo.address);
    let results = await query.find();
    if (results.length > 0) {
      c = results[0];
    } else {
      c = new contract();
    }
    c.set("address", contractInfo.address);
    c.set("name", contractInfo.contractName);
    c.set("chain", contractInfo.chain);
    c.set("status", "Requested");
    c.set("protocol", p);
    contractInfo.contract = await c.save();
  }
  CAct = Moralis.Object.extend("ContractActivity");
  for (let k = 0; k < contracts.length; k++) {
    acts = [];
    let ev = null;
    contractInfo = contracts[k];
    for (let i = 0; i < contractInfo.activities.length; i++) {
      act = contractInfo.activities[i];
      ev = new CAct();
      ev.set("name", act.name);
      ev.set("type", act.type);
      ev.set("status", "Requested");
      ev.set("chain", act.chain);
      ev.set("ABI", "");
      ev.set("contract", c);
      ev = await ev.save();
      acts.push(ev);
    }
    relation = await contractInfo.contract.relation("ContractActivities");
    relation.add(acts);
    contractInfo.contract.save();
  }
  return true;
}
