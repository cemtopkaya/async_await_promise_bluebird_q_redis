/// <reference types="q" />
import { RedisClient, ClientOpts } from "redis";
export declare module FMC_Redis {
    class Redis {
        opt: ClientOpts;
        private rc;
        private rcPromise;
        private static _instance;
        static current(_opt?: ClientOpts): Redis;
        readonly client: RedisClient;
        /******* BLUEBIRD ********/
        readonly clientAsync: any;
        private constructor(_opt?);
        redisConnect(): void;
        private onReady();
        private onEnd();
        private onError(err);
        /****** PROMISE *********/
        getRegularPromise(): Promise<{}>;
        /******* ASYNC - AWAIT *******/
        delay(ms: any): Promise<string>;
        delayTest(): Promise<void>;
        getKey(key: string): Promise<any>;
        Get: (...args: any[]) => Q.Promise<{}>;
        nbind(): void;
    }
}
