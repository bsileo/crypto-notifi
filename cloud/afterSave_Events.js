/* eslint-disable no-undef */
Moralis.Cloud.afterSave("UniswapPairCreated", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  logger.info("UniswapPairCreated Event");
  const confirmed = request.object.get("confirmed");
  if (confirmed) {
    processSmartContractSubscriptions(request.object, "PairCreated");
  } else {
    // handle unconfirmed case
  }
});

Moralis.Cloud.beforeConsume("UniswapPairCreated", (event) => {
  return event && event.confirmed;
});

Moralis.Cloud.afterSave("SnowTokenSNOB", (event) => {
  const logger = Moralis.Cloud.getLogger();
  logger.info("SnowTokenSNOB Event");
  const confirmed = request.object.get("confirmed");
  if (confirmed) {
    processSmartContractSubscriptions(request.object, "Transfer");
  }
});

Moralis.Cloud.afterSave("SnowballTransfer", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  logger.info("SnowballTransfer Event");
  const confirmed = request.object.get("confirmed");
  if (confirmed) {
    processSmartContractSubscriptions(request.object, "Transfer");
  } else {
    // handle unconfirmed case
  }
});
