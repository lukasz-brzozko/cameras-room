import os from "os";

export const getIpAddresses = () => {
  // reliable only if hostname === 0.0.0.0
  const interfaces = os.networkInterfaces();
  const ipv4Addresses: string[] = [];

  for (const iface in interfaces) {
    if (!interfaces[iface]) return;
    for (const alias of interfaces[iface]) {
      if (alias.family === "IPv4" && !alias.internal) {
        ipv4Addresses.push(alias.address);
      }
    }
  }

  return ipv4Addresses;
};

export const getServerUrls = (port: number) => {
  const ipv4Addresses = getIpAddresses();

  const serverUrls = ipv4Addresses?.map(
    (address) => `https://${address}:${port}`,
  );

  return serverUrls;
};
