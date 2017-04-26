import { RedisClient, createClient, ClientOpts } from "redis";
import { promisifyAll, PromisifyAllOptions } from "bluebird";
import { nbind } from "Q";

export module FMC_Redis {
    export class Redis {
        opt: ClientOpts;
        private rc: RedisClient;
        private rcPromise: any;

        private static _instance: Redis = null;
        public static current(_opt?: ClientOpts): Redis {

            if (!Redis._instance) {
                Redis._instance = new Redis(_opt);
                Redis._instance.redisConnect();
            }
            return Redis._instance;
        }

        public get client(): RedisClient {
            if (!this.rc.connected) throw new Error("There is no connection to Redis DB!");
            return this.rc;
        }

        /******* BLUEBIRD ********/
        public get clientAsync(): any {
            // promisifyAll functions of redisClient 
            // creating new redis client object which contains xxxAsync(..) functions.
            return this.rcPromise = promisifyAll(this.client);
        }

        private constructor(_opt?: ClientOpts) {
            if (Redis._instance) return;

            this.opt = _opt
                ? _opt
                : {
                    host: "127.0.0.1",
                    port: 6379,
                    db: "0"
                };
        }

        public redisConnect(): void {
            this.rc = createClient(this.opt);
            this.rc
                .on("ready", this.onReady)
                .on("end", this.onEnd)
                .on("error", this.onError);
        }

        private onReady(): void { console.log("Redis connection was successfully established." + arguments); }
        private onEnd(): void { console.warn("Redis connection was closed."); }
        private onError(err: any): void { console.error("There is an error: " + err); }


        /****** PROMISE *********/
        // promise redis test
        public getRegularPromise() {
            let rc = this.client;
            return new Promise(function (res, rej) {
                console.warn("> getKeyPromise() ::");
                rc.get("cem", function (err, val) {
                    console.log("DB Response OK.");
                    // if DB generated error:
                    if (err) rej(err);
                    // DB generated result:
                    else res(val);
                });
            });
        }


        /******* ASYNC - AWAIT *******/
        // async - await test function
        public delay(ms) {
            return new Promise<string>((fnResolve, fnReject) => {
                setTimeout(fnResolve("> delay(" + ms + ") > successfull result"), ms);
            });
        }

        public async delayTest() {
            console.log("\n****** delayTest ")
            let a = this.delay(500).then(a => console.log("\t" + a));

            let b: string = await this.delay(400);
            console.log("\tb::: " + b);
        }

        // async - await function
        public async getKey(key: string) {
            let reply = await this.clientAsync.getAsync("cem");
            return reply.toString();
        }

        Get: (...args: any[]) => Q.Promise<{}>;
        // Q
        public nbind() {
            this.Get = nbind(this.client.get, this.client);
        }

    }
}

let a = FMC_Redis.Redis.current();

// setTimeout(function () {
//     console.warn(a.client.set("cem", "naber"));
//     console.warn(a.client.get("cem"));
//     console.warn(a.client.keys("cem"));
// }, 1000);

/***** async await test client *****/
a.delayTest();


/** Standart Redis Client test client */
setTimeout(function () {
    a.client.get("cem", function (err, val) {
        console.log("\n****** Standart Redis Client")
        if (err) console.error("\tError: " + err);
        else console.log("\tValue ::" + val);
    });
}, 100)

/***** Using regular Promise with Redis Client > test client *****/
setTimeout(function () {
    a.getRegularPromise().then(function (v) {
        console.log("\n***** Regular Promise with Redis Client")
        console.log("\t> Then ::" + v);
    }).catch(function (e) {
        console.error("\t> Catch ::" + e);
    });
}, 100);

/***** Using bluebird promisify with Redis Client > test client *****/
setTimeout(function () {
    var header = "\n***** bluebird promisify with Redis Client";
    a.clientAsync.getAsync("cem").then(result => console.log(header + result)).catch(console.error);
}, 100);

// a.delay(2000).then((v) => {
//     console.error("then oldu");
//     a.promisify();
//     a.getKey("cem").then(console.log);
// });

    console.log("haydaaaa");

setTimeout(async function () {
    console.log("haydaaaa");
    a.nbind();
    let k = await a.Get("cem");
    console.log("K: " + k);
}, 100);