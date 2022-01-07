/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
//
// URL to run this:
//  https://dfnrl9oy6cjp.usemoralis.com:2053/server/functions/databaseSetup?_ApplicationId=vNzZEcsSUFcPhfxYFqNbfMXVyfp2cNSX8tha5TwW
//
Moralis.Cloud.define("databaseSetup", async (request) => {
  // PROTOCOL
  const protocol = Moralis.Object.extend("Protocol");
  let p = new protocol();
  p.set("name", "Snowball");
  p.set("website","https://app.snowball.network/" )
  p.set(
    "iconURL",
    "https://app.snowball.network/_next/image?url=%2Fassets%2Fimages%2Flogo-dark-label.svg&w=640&q=75"
  );
  p.set("chains", ["avalanche"]);
  p.save();
  p = new protocol();
  p.set("name", "Axial");
  p.set("website","https://www.axial.exchange/" )
  p.set("iconURL", "https://app.axial.exchange/static/media/logo.6a08160b.svg");
  p.set("chains", ["avalanche"]);
  p.save();

  return true;
});
