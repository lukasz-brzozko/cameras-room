export type TPeerId = string;

export type TPeer = {
  id: TPeerId;
  isCameraEnabled: boolean;
  hasFocus: boolean;
};

export type TPeerMessages = {
  activePeers: TPeer[];
};
