import { RoadieServer } from "./http";
export { WebService } from "./webservice";
export { RoadieServer as Server, WebMethod, HttpError, HttpVerb } from "./http";
export { IRouter, StaticRouter } from "./routing/routemap";
export declare function setDefaultServer(serv: RoadieServer): void;
