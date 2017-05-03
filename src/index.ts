import { RoadieServer } from "./http";
import { WebService as ws } from "./webservice";

export {
    WebService,
} from "./webservice";

export {
    RoadieServer as Server,
    WebMethod,
    HttpContext,
    HttpRequest,
    HttpResponse,
    HttpError,
    HttpVerb,
} from "./http";

export {
    StaticRouter,
    Route,
    ParameterRoute,
    StaticRoute,
    WildcardRoute,
} from "./routing/static/routemap";

export {
    AsyncRouter,
} from "./routing/async/asyncRouter";

export {
    AsyncRouteNode,
    AsyncParameterNode,
    AsyncRootNode,
    AsyncStaticNode,
    AsyncWildcardNode,
} from "./routing/async/asyncRouteNode";

export {
    AsyncRoutingState
} from "./routing/async/search";

export {
    IRouter,
    RouteType,
} from "./routing/router";

export {
    Endpoint
} from "./endpoints";

export {
    IMockContextParams,
    createMockContext
} from "./mock/http";

export function setDefaultServer(serv: RoadieServer) { RoadieServer.default = serv; }
