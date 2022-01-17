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
