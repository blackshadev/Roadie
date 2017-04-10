import { RoadieServer } from "./http";
export { WebService } from "./webservice";
export { RoadieServer as Server, WebMethod, HttpContext, HttpRequest, HttpResponse, HttpError, HttpVerb } from "./http";
export { StaticRouter } from "./routing/static/routemap";
export { AsyncRouter } from "./routing/async/asyncRouter";
export { AsyncRouteNode } from "./routing/async/asyncRouteNode";
export { IRouter, RouteType } from "./routing/router";
export { Endpoint } from "./endpoints";
export declare function setDefaultServer(serv: RoadieServer): void;
