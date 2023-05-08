import http from "http";
import net from "net";

class NetAddr {
	constructor(transport, hostname, port) {
		this.transport = transport;
		this.hostname = hostname;
		this.port = port;
	}
}

class UnixAddr {
	constructor(transport, path) {
		this.transport = transport;
		this.path = path;
	}
}

// Helper function to create an Addr object from Node.js address info
function createAddrFromNodeAddressInfo(addressInfo) {
	if (addressInfo.family === 'IPv4' || addressInfo.family === 'IPv6') {
		return new NetAddr('tcp', addressInfo.address, addressInfo.port);
	} else if (addressInfo.family === 'Unix') {
		return new UnixAddr('unix', addressInfo.path);
	} else {
		throw new Error(`Unsupported address family: ${addressInfo.family}`);
	}
}

export function listen(options) {
	const server = net.createServer();
	server.listen(options);

	return {
		addr: createAddrFromNodeAddressInfo(server.address()),
		rid: -1, // Set a placeholder `-1`, as Node.js doesn't provide an equivalent to Deno's resource ID.
		async accept() {
			return new Promise((resolve, reject) => {
				server.once("connection", (connection) => {
					resolve(connection);
				});
				server.once("close", () => {
					reject(new Error("Listener has been closed"));
				});
			});
		},
		close() {
			server.close();
		},
		ref() {
			server.ref();
		},
		unref() {
			server.unref();
		},
		[Symbol.asyncIterator]: function* () {
			return this;
		},
		next: async function () {
			return new Promise((resolve, reject) => {
				server.once("connection", (connection) => {
					resolve({value: connection, done: false});
				});
				server.once("close", () => {
					reject({done: true});
				});
			});
		},
	};
}

export function serveHttp(conn) {
	const httpServer = http.createServer();

	httpServer.emit("connection", conn);

	return {
		[Symbol.asyncIterator]: function* () {
			return this;
		},
		next: async function () {
			return new Promise((resolve) => {
				httpServer.once("request", (req, res) => {
					req = incomingMessageToRequest(req)
					const requestEvent = new RequestEvent(req, res);
					resolve({
						value: requestEvent,
						done: false,
					});
				});
			});
		},
		nextRequest: async function () {
			return new Promise((resolve) => {
				httpServer.once("request", (req, res) => {
					req = incomingMessageToRequest(req)
					const requestEvent = new RequestEvent(req, res);
					resolve(requestEvent);
				});
			});
		}
	};
}

function incomingMessageToRequest(incomingMessage) {
	const ctrl = new AbortController();
	const headers = new Headers(incomingMessage.headers);
	const url = `http://${headers.get('host')}${incomingMessage.url}`;
	console.log("ulr", url)
	incomingMessage.once('aborted', () => ctrl.abort());

	const requestOptions = {
		headers,
		method: incomingMessage.method,
		signal: ctrl.signal,
	};

	const referer = headers.get('Referer');
	if (referer) {
		requestOptions.referrer = referer;
	}

	if (incomingMessage.method !== 'GET' && incomingMessage.method !== 'HEAD') {
		requestOptions.body = incomingMessage;
	}

	const req = new Request(url, requestOptions);
	console.log("reqx", req)
	return req;
}

class RequestEvent {
	constructor(request, response) {
		this.request = request;
		this.response = response;
	}

	async respondWith(res) {
		res = await res;
		console.log('res', res);
		// `res` is a `Response` object, so the `body` property is a `ReadableStream`.
		this.response.writeHead(res.status, res.headers);
		const body = res.body.getReader();
		const { value } = await body.read();
		this.response.end(value);
	}
}