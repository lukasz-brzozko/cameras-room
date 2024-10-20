export type TPeerId = string;

export type TPeer = {
  id: TPeerId;
  isCameraEnabled: boolean;
};

export type TPeerMessages = {
  activePeers: TPeer[];
};
