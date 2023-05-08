import http from "http";
import net from "net";

function listen(options) {
    const server = net.createServer();
    server.listen(options);

    return {
        [Symbol.asyncIterator]: function* () {
            return this;
        },
        next: async function () {
            return new Promise((resolve) => {
                server.once("connection", (connection) => {
                    resolve({ value: connection, done: false });
                });
            });
        },
    };
}

function serveHttp(conn) {
    const httpServer = http.createServer();

    httpServer.emit("connection", conn);

    return {
        [Symbol.asyncIterator]: function* () {
            return this;
        },
        next: async function () {
            return new Promise((resolve) => {
                httpServer.once("request", (req, res) => {
                    resolve({
                        value: new RequestEvent(req, res),
                        done: false,
                    });
                });
            });
        },
    };
}

class RequestEvent {
    constructor(request, response) {
        this.request = request;
        this.response = response;
    }

    async respondWith(res) {
        this.response.writeHead(res.status, res.headers);
        this.response.end(res.body);
    }
}

// Usage example:
async function handleHttp(conn) {
    for await (const e of serveHttp(conn)) {
        e.respondWith(new Response("Hello World"));
    }
}

(async () => {
    for await (const conn of listen({ port: 80 })) {
        handleHttp(conn);
    }
})();