import { WebMethod, WebService } from "../../";

class WS extends WebService {

    @WebMethod("[GET]/ha/lo")
    halloWorld() {
        this.ctx.response.data("HalloWorld");
        this.ctx.response.send();
    }

    @WebMethod("[GET]/i/promise")
    async prom() : Promise<string> {
        return new Promise<string>(
            (resolve, reject) => {
                setTimeout(() => {
                    resolve("Told Ya");
                }, 500);
            }
        );
    }

    @WebMethod("[GET]/i/promise/judas")
    async judas() : Promise<string> {
        return new Promise<string>(
            (resolve, reject) => {
                setTimeout(() => {
                    reject(new Error("Backstab"));
                }, 500);
            }
        );
    }

}