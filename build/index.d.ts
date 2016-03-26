import { WebService as ws } from "./webservice";
import { RoadieServer, WebMethod as decr } from "./http";
export declare const WebService: typeof ws;
export declare const Server: typeof RoadieServer;
export declare const WebMethod: typeof decr;
export declare function setDefaultServer(serv: RoadieServer): void;
