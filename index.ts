import { WebService as ws } from "./webservice";
import { RoadieServer, WebMethod as decr } from "./http";

export {
    WebService
} from "./webservice"
export {
    RoadieServer as Server , WebMethod, HttpError
} from "./http"

export function setDefaultServer(serv: RoadieServer) { RoadieServer.Default = serv; }