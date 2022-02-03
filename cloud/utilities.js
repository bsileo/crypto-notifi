/* eslint-disable no-undef */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getAPIKey(name) {
  // const logger = Moralis.Cloud.getLogger();
  const config = await Moralis.Config.get({ useMasterKey: true });
  const privateParam = config.get(name);
  return privateParam;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getLogger() {
  const mlogger = Moralis.Cloud.getLogger();
  const config = await Moralis.Config.get({ useMasterKey: true });
  const debug = config.get("debug");
  return {
    debug: (msg) => {
      if (debug) {
        mlogger.debug(msg);
      }
    },
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

// import data from other server
Moralis.Cloud.job("importData", async (request) => {
  const userSecret = request.params.input.secret;
  const clear = request.params.input.clear;
  const objectClass = request.params.input.objectClass;
  logger.info(`importData ${objectClass} with clear=${clear}`);
  const config = await Moralis.Config.get({ useMasterKey: true });
  const ApplicationId =
    config.get("import_app_id") || "vNzZEcsSUFcPhfxYFqNbfMXVyfp2cNSX8tha5TwW";
  const ServerUrl =
    config.get("import_server_url") ||
    "https://dfnrl9oy6cjp.usemoralis.com:2053/server";
  const url = `${ServerUrl}/functions/exportData`;
  logger.info(`import from ${url}`);
  const result = await Moralis.Cloud.httpRequest({
    url: url,
    params: {
      _ApplicationId: ApplicationId,
      objectClass: objectClass,
      secret: userSecret,
    },
  });
  if (clear) {
    const qu = new Moralis.Query(objectClass);
    const oldRecs = await qu.find();
    for (let i = 0; i < oldRecs.length; ++i) {
      const rec = oldRecs[i];
      await rec.destroy();
    }
  }
  if (result.data && result.data.result) {
    for (let i = 0; i < result.data.result.length; ++i) {
      const objClass = Moralis.Object.extend(objectClass);
      const obj = new objClass();
      // strip things we dont want
      delete result.data.result[i].createdAt;
      delete result.data.result[i].updatedAt;
      delete result.data.result[i].objectId;
      delete result.data.result[i].__type;
      delete result.data.result[i].className;
      // set each field
      for (const key in result.data.result[i]) {
        obj.set(key, result.data.result[i][key]);
      }
      obj.save({ useMasterKey: true });
      // logger.info(JSON.stringify(obj))
    }
  } else {
    logger.info("could not import data from " + url);
  }
});

// export data to other server
Moralis.Cloud.define(
  "exportData",
  async (request) => {
    const userSecret = request.params.secret;
    const dataSecret = await getImportExportSecret();
    logger.info(`exportData request for ${request.params.objectClass}`);
    if (userSecret !== dataSecret) throw "Incorrect password";
    const draftQuery = new Moralis.Query(request.params.objectClass);
    const exportData = draftQuery.find({ useMasterKey: true });
    return exportData;
  },
  {
    fields: ["objectClass", "secret"],
  }
);

async function getImportExportSecret() {
  const config = await Moralis.Config.get({ useMasterKey: true });
  return config.get("import_export_secret");
}
