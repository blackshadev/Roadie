import { WebService as ws } from "./webservice";
import { RoadieServer, WebMethod as decr } from "./http";


export const WebService = ws;
export const Server = RoadieServer;
export const WebMethod = decr;
export function setDefaultServer(serv: RoadieServer) { RoadieServer.Default = serv; }