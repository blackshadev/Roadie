import { RoadieServer } from "./http";
export { WebService } from "./webservice";
export { RoadieServer as Server, WebMethod, HttpError, HttpVerb } from "./http";
export { StaticRouter } from "./routing/static/routemap";
export { IRouter } from "./routing/router";
export declare function setDefaultServer(serv: RoadieServer): void;
