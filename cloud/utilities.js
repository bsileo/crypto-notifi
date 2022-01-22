/* eslint-disable no-undef */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getAPIKey(name) {
  // const logger = Moralis.Cloud.getLogger();
  const query = new Moralis.Query("API_Keys");
  query.equalTo("keyName", name);
  const res = await query.find();
  for (let i = 0; i < res.length; i++) {
    return await res[i].get("keyValue");
  }
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
      errorLog.save();
    },
  };
}
