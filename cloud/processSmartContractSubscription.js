/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
async function processSmartContractSubscriptions(transaction, activityName) {
  const logger = Moralis.Cloud.getLogger();
  const addr = transaction.get("address").toLowerCase();
  logger.info(
    `[processSmartContractSubscriptions] Check for Smart Contract subs ${addr} - ${activityName}`
  );
  const addrQuery = new Moralis.Query("Subscription");
  addrQuery.include("contractActivity");
  addrQuery.include("contract");
  addrQuery.equalTo("contractAddress", addr);
  const subs = await addrQuery.find();
  for (let i = 0; i < subs.length; i++) {
    logger.info(
      `[processSmartContractSubscriptions] Smart Contract sub hit ${subs[i].id}`
    );
    let msg = `Smart Contract Subscription match on '${subs[i].get("name")}'`;
    data = {
      address: addr,
      subscriptionName: subs[i].get("name"),
      activityName: activityName,
    };
    logger.info(
      `[processSmartContractSubscriptions] Process hit on ${subs[i].id}`
    );
    processSmartContractHit(subs[i], transaction, activityName, msg, data);
  }
}

// eslint-disable-next-line prettier/prettier
async function processSmartContractHit(subscription, transaction, activityName, msg, data ) {
  const logger = Moralis.Cloud.getLogger();
  logger.info(
    `[processSmartContractHit] Start ${subscription.id} on TX "${transaction.id}" for "${activityName}"`
  );
  let hit = true;
  const subActivity = subscription.get("contractActivity");
  if (subActivity) {
    // This is an Event Subscription
    const contract = subscription.get("contract");
    const subName = subActivity.get("name");
    logger.info(`[processSmartContractHit] CA ${subActivity.id} - ${subName}`);
    logger.info(`[processSmartContractHit] Contract ${contract.id}`);
    hit = hit && subName.toLowerCase() == activityName.toLowerCase();
    msg = `${msg} for Event ${activityName}`;
    data.contractName = contract.get("name");
    data = getABIParameters(subActivity, data, transaction);
    logger.info(`[processSmartContractHit] Event Sub Hit= ${hit}`);
  } else {
    // This is a Tranasaction subscription
    // So we can also have value checks
    logger.info(`[processSmartContractHit] TX Sub Start`);
    const txVal = parseInt(transaction.get("value"));
    const subVal = parseInt(subscription.get("value"));
    const op = subscription.get("valueOperator");
    logger.info(`[processSmartContractHit] TX Sub ${txVal} ${op} ${subVal}`);
    data.transactionValue = txVal;
    data.subscriptionValue = subVal;
    switch (op) {
      case ">":
        hit = hit && txVal > subVal;
        msg = `${msg} Value exceeds threshold`;
        data.operation = "greater";
        break;
      case "<":
        hit = hit && txVal < subVal;
        msg = `${msg} Value is below threshold`;
        data.operation = "less";
        break;
      case "=":
        hit = hit && txVal == subVal;
        msg = `${msg} Value equals target`;
        data.operation = "equals";
        break;
    }
    logger.info(`[processSmartContractHit] TX Sub Hit= ${hit}`);
  }
  if (hit) {
    const content = { plain: msg, rich: msg };
    const template = subActivity.get("template");
    const richTemplate = subActivity.get("richTemplate");
    logger.info(
      `[processsmartContractHit] Template="${template}" richTemplate="${richTemplate}`
    );
    if (template) {
      const pTemplate = processTemplate(template, data);
      content.plain = `${pTemplate}`;
      content.rich = content.plain;
    }
    if (richTemplate) {
      const rTemplate = processTemplate(richTemplate, data);
      content.rich = `${rTemplate}`;
    }
    sendAlert(subscription, content, data);
  } else {
    logger.info(`[processSmartContractHit] No Hit`);
  }
}

function processTemplate(template, data) {
  return template.replace(
    /\{\{\s*([^}\s]+)\s*\}\}/g,
    (_, token) => data[token]
  );
}

function getABIParameters(contractActivity, data, tx) {
  const logger = Moralis.Cloud.getLogger();
  const abi = contractActivity.get("ABI");
  try {
    const raw = eval("(" + abi + ")");
    const inputs = raw.inputs;
    inputs.forEach((element) => {
      data[element.name] = tx.get(element.name);
    });
  } catch (error) {
    logger.info(`Failed to parse ABI for ${tx.id}`);
  }
  return data;
}
