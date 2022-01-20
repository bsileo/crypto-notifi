/* eslint-disable no-undef */
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
      chainID: "0x1",
      activities: [
        {
          name: "PairCreated",
          chain: "eth",
          type: "Event",
          topic: "PairCreated(address, address, address, uint)",
          tableName: "UniswapV2PairCreated",
          abi: {
            anonymous: false,
            type: "event",
            inputs: [
              {indexed: true, internalType: "address", name: "token0", type: "address"},
              {indexed: true, internalType: "address", name: "token1", type: "address"},
              { indexed: false, internalType: "address", name: "pair", type: "address"},
              { indexed: false, internalType: "uint256", name: "", type: "uint256" },
            ],
          },
    }],
    },
    {
      protocolName: "Snowball",
      contractName: "Compounding-Benqi/QI",
      address: "0x124f5991e1ead696d3082139154db787e52f4c87",
      chain: "avalanche",
      activities: [
        { name: "Transfer",
        chain: "avalanche",
        chainID: "0xa86a",
        type: "Event",
        topic: "Transfer(address, address, uint)",
        tableName: "SnowCompBenqiQITransfer",
        abi: {
          anonymous: false,
          type: "event",
          inputs: [
            { indexed: true, internalType: "address", name: "from", type: "address"},
            { indexed: true, internalType: "address", name: "to", type: "address"},
            { indexed: false, internalType: "uint256", name: "value", type: "uint256" },
          ],
          },
        },
        { name: "Approval",
        chain: "avalanche",
        chainID: "0xa86a",
        type: "Event",
        topic: "Approval(address, address, uint)",
        tableName: "SnowCompBenqiQIApproval",
        abi: {
          anonymous: false,
          type: "event",
          inputs: [
            { indexed: true, internalType: "address", name: "owner", type: "address"},
            { indexed: true, internalType: "address", name: "spender", type: "address"},
            { indexed: false, internalType: "uint256", name: "value", type: "uint256" },
          ],
          },
        },
      ],
    },
    {
      protocolName: "Snowball",
      contractName: "Compounding-Benqi/Dai.e",
      address: "0x7b2525a502800e496d2e656e5b1188723e547012",
      chain: "avalanche",
      chainID: "0xa86a",
      activities: [
        { name: "Transfer",
        chain: "avalanche",
        chainID: "0xa86a",
        topic: "Transfer(address, address, uint)",
        type: "Event",
        tableName: "SnowCompBenqiDAITransfer",
        abi: {
          anonymous: false,
          type: "event",
          inputs: [
            { indexed: true, internalType: "address", name: "from", type: "address"},
            { indexed: true, internalType: "address", name: "to", type: "address"},
            { indexed: false, internalType: "uint256", name: "value", type: "uint256" },
          ],
          },
        },
        { name: "Approval",
        chain: "avalanche",
        chainID: "0xa86a",
        topic: "Approval(address, address, uint)",
        type: "Event",
        tableName: "SnowCompBenqiDAIApproval",
        abi: {
          anonymous: false,
          type: "event",
          inputs: [
            { indexed: true, internalType: "address", name: "owner", type: "address"},
            { indexed: true, internalType: "address", name: "spender", type: "address"},
            { indexed: false, internalType: "uint256", name: "value", type: "uint256" },
          ],
          },
        },
      ],
    },
    {
      protocolName: "Snowball",
      contractName: "SNOB Token",
      address: "0xC38f41A296A4493Ff429F1238e030924A1542e50",
      chain: "avalanche",
      chainID: "0xa86a",
      activities: [
        { name: "Transfer",
          chain: "avalanche",
          chainID: "0xa86a",
          topic: "Transfer(address, address, uint256)",
          type: "Event",
          tableName: "SnowTokenSNOBTransfer",
          abi: {
            anonymous: false,
            type: "event",
            inputs: [
            { indexed: true, internalType: "address", name: "from", type: "address"},
            { indexed: true, internalType: "address", name: "to", type: "address"},
            { indexed: false, internalType: "uint256", name: "value", type: "uint256" },
            ],
          },
        },
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
    logger.info(`[DB Contract] Processing ${contractInfo.contractName}`);
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
      logger.info(`[DB Contract] Activity ${act.name}`);
      ev = new CAct();
      ev.set("name", act.name);
      ev.set("type", act.type);
      ev.set("status", "Requested");
      ev.set("chain", contractInfo.chain);
      ev.set("abi", act.ABI);
      ev.set("contract", c);
      ev = await ev.save();
      acts.push(ev);
      options = {
        tableName: act.tableName,
        chainID: contractInfo.chainID,
        address: contractInfo.address,
        topic: act.topic,
        abi: act.abi,
        sync_historical: false,
      };
      logger.info("[databaseContracts] Options:");
      logger.info(options);
      let unwatchOptions = { tableName: options.tableName };
      await Moralis.Cloud.run("unwatchContractEvent", unwatchOptions, { useMasterKey: true });
      const wceResult = await Moralis.Cloud.run("watchContractEvent", options, { useMasterKey: true });
      logger.info(`[databaseContract] run watchContractEvent--${wceResult}`);
      Moralis.Cloud.beforeConsume(options.tableName, (event) => {
        return event && event.confirmed;
      });
      Moralis.Cloud.afterSave(options.tableName, async (request) => {
        const logger = Moralis.Cloud.getLogger();
        logger.info(`[afterSave:${request.object}] Event Received`);
        const confirmed = request.object.get("confirmed");
        if (confirmed) {
          logger.info(`[afterSave:${request.object}] Confirmed Event Received`);
          processSmartContractSubscriptions(request.object, act.name);
        } else {
          // handle unconfirmed case
        }
      });
      logger.info("[databaseContracts] Actvity Finished");
    }
    relation = await contractInfo.contract.relation("ContractActivities");
    relation.add(acts);
    contractInfo.contract.save();
    logger.info("[databaseContracts] ContractInfo saved");

  }
  return true;
}



/*  New contract descriptor template
{
      protocolName: "Snowball",
      contractName: "Compounding-Benqi/Dai.e",
      address: "0x7b2525a502800e496d2e656e5b1188723e547012",
      chain: "avalanche",
      chainID: "0xa86a",
      activities: [
        { name: "Transfer",
        chain: "avalanche",
        chainID: "0xa86a",
        topic: "Transfer(address, address, uint)",
        type: "Event",
        tableName: "SnowCompBenqiDAITransfer",
        abi: {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "address", name: "from", type: "address"},
            { indexed: true, internalType: "address", name: "to", type: "address"},
            { indexed: false, internalType: "uint256", name: "value", type: "uint256" },
          ],
          },
        },
        { name: "Approval",
        chain: "avalanche",
        chainID: "0xa86a",
        topic: "Approval(address, address, uint)",
        type: "Event",
        tableName: "SnowCompBenqiDAIApproval",
        abi: {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "address", name: "owner", type: "address"},
            { indexed: true, internalType: "address", name: "spender", type: "address"},
            { indexed: false, internalType: "uint256", name: "value", type: "uint256" },
          ],
          },
        },
      ],
    },

    */
