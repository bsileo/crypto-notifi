/* eslint-disable no-undef */
// eslint-disable-next-line no-undef
Moralis.Cloud.beforeSave("ContractActivity", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  const { object: act, context } = request;
  logger.info(`[contractActivity.beforeSave()] TODO-Validation no duplicate Names on contract`);
  //let contract = act.get("contract");
  //if (contract) {
  //  contract = await contract.fetch({ useMasterKey: true });
  //  rel = contract.get("ContractActivities");
  // }
});
