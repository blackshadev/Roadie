import { WebMethod, WebService } from "../../";

class WS extends WebService {

    @WebMethod("[GET]/ha/lo")
    halloWorld() {
        this.ctx.response.data("HalloWorld");
        this.ctx.response.send();
    }

}