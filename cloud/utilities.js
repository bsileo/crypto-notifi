/* eslint-disable no-undef */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getAPIKey(name) {
  // const logger = Moralis.Cloud.getLogger();
  const config = await Moralis.Config.get({ useMasterKey: true });
  const privateParam = config.get(name);
  return privateParam;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getLogger() {
  const mlogger = Moralis.Cloud.getLogger();
  return {
    info: (msg) => {
      mlogger.info(msg);
    },
    error: (msg) => {
      mlogger.error(msg);
      const errorLog = Moralis.Object.extend("ErrorLogs");
      errorLog.set("message", msg);
      errorLog.set("user", "cloud");
      errorLog.set("level", "error");
      errorLog.save({ useMasterKey: true });
    },
  };
}
