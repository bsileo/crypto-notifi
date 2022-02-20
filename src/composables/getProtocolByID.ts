import { Protocol } from "@/models/Protocol";

export const fetchProtocol = async (id: string): Promise<Protocol> => {
  if (id) {
    const p = await Protocol.fetch(id);
    return p;
  }
  console.log("No ID");
  return new Protocol();
};

export const protocolUpdate = async (aProtocol: Protocol): Promise<void> => {
  if (aProtocol) {
    aProtocol.save();
  }
};
