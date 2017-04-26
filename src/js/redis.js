"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const bluebird_1 = require("bluebird");
const Q_1 = require("Q");
var FMC_Redis;
(function (FMC_Redis) {
    class Redis {
        constructor(_opt) {
            if (Redis._instance)
                return;
            this.opt = _opt
                ? _opt
                : {
                    host: "127.0.0.1",
                    port: 6379,
                    db: "0"
                };
        }
        static current(_opt) {
            if (!Redis._instance) {
                Redis._instance = new Redis(_opt);
                Redis._instance.redisConnect();
            }
            return Redis._instance;
        }
        get client() {
            if (!this.rc.connected)
                throw new Error("There is no connection to Redis DB!");
            return this.rc;
        }
        /******* BLUEBIRD ********/
        get clientAsync() {
            // promisifyAll functions of redisClient 
            // creating new redis client object which contains xxxAsync(..) functions.
            return this.rcPromise = bluebird_1.promisifyAll(this.client);
        }
        redisConnect() {
            this.rc = redis_1.createClient(this.opt);
            this.rc
                .on("ready", this.onReady)
                .on("end", this.onEnd)
                .on("error", this.onError);
        }
        onReady() { console.log("Redis connection was successfully established." + arguments); }
        onEnd() { console.warn("Redis connection was closed."); }
        onError(err) { console.error("There is an error: " + err); }
        /****** PROMISE *********/
        // promise redis test
        getRegularPromise() {
            let rc = this.client;
            return new Promise(function (res, rej) {
                console.warn("> getKeyPromise() ::");
                rc.get("cem", function (err, val) {
                    console.log("DB Response OK.");
                    // if DB generated error:
                    if (err)
                        rej(err);
                    else
                        res(val);
                });
            });
        }
        /******* ASYNC - AWAIT *******/
        // async - await test function
        delay(ms) {
            return new Promise((fnResolve, fnReject) => {
                setTimeout(fnResolve("> delay(" + ms + ") > successfull result"), ms);
            });
        }
        delayTest() {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("\n****** delayTest ");
                let a = this.delay(500).then(a => console.log("\t" + a));
                let b = yield this.delay(400);
                console.log("\tb::: " + b);
            });
        }
        // async - await function
        getKey(key) {
            return __awaiter(this, void 0, void 0, function* () {
                let reply = yield this.clientAsync.getAsync("cem");
                return reply.toString();
            });
        }
        // Q
        nbind() {
            this.Get = Q_1.nbind(this.client.get, this.client);
        }
    }
    Redis._instance = null;
    FMC_Redis.Redis = Redis;
})(FMC_Redis = exports.FMC_Redis || (exports.FMC_Redis = {}));
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
        console.log("\n****** Standart Redis Client");
        if (err)
            console.error("\tError: " + err);
        else
            console.log("\tValue ::" + val);
    });
}, 100);
/***** Using regular Promise with Redis Client > test client *****/
setTimeout(function () {
    a.getRegularPromise().then(function (v) {
        console.log("\n***** Regular Promise with Redis Client");
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
setTimeout(function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("haydaaaa");
        a.nbind();
        let k = yield a.Get("cem");
        console.log("K: " + k);
    });
}, 100);
