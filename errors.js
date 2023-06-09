// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.

class NotFound extends Error {
	constructor(msg) {
		super(msg);
		this.name = "NotFound";
	}
}

class PermissionDenied extends Error {
	constructor(msg) {
		super(msg);
		this.name = "PermissionDenied";
	}
}

class BadResource extends Error {
	constructor(msg) {
		super(msg);
		this.name = "BadResource";
	}
}

class Interrupted extends Error {
	constructor(msg) {
		super(msg);
		this.name = "Interrupted";
	}
}

class ConnectionRefused extends Error {
	constructor(msg) {
		super(msg);
		this.name = "ConnectionRefused";
	}
}

class ConnectionReset extends Error {
	constructor(msg) {
		super(msg);
		this.name = "ConnectionReset";
	}
}

class ConnectionAborted extends Error {
	constructor(msg) {
		super(msg);
		this.name = "ConnectionAborted";
	}
}

class NotConnected extends Error {
	constructor(msg) {
		super(msg);
		this.name = "NotConnected";
	}
}

class AddrInUse extends Error {
	constructor(msg) {
		super(msg);
		this.name = "AddrInUse";
	}
}

class AddrNotAvailable extends Error {
	constructor(msg) {
		super(msg);
		this.name = "AddrNotAvailable";
	}
}

class BrokenPipe extends Error {
	constructor(msg) {
		super(msg);
		this.name = "BrokenPipe";
	}
}

class AlreadyExists extends Error {
	constructor(msg) {
		super(msg);
		this.name = "AlreadyExists";
	}
}

class InvalidData extends Error {
	constructor(msg) {
		super(msg);
		this.name = "InvalidData";
	}
}

class TimedOut extends Error {
	constructor(msg) {
		super(msg);
		this.name = "TimedOut";
	}
}

class WriteZero extends Error {
	constructor(msg) {
		super(msg);
		this.name = "WriteZero";
	}
}

class WouldBlock extends Error {
	constructor(msg) {
		super(msg);
		this.name = "WouldBlock";
	}
}

class UnexpectedEof extends Error {
	constructor(msg) {
		super(msg);
		this.name = "UnexpectedEof";
	}
}

class Http extends Error {
	constructor(msg) {
		super(msg);
		this.name = "Http";
	}
}

class Busy extends Error {
	constructor(msg) {
		super(msg);
		this.name = "Busy";
	}
}

class NotSupported extends Error {
	constructor(msg) {
		super(msg);
		this.name = "NotSupported";
	}
}

const errors = {
	NotFound,
	PermissionDenied,
	ConnectionRefused,
	ConnectionReset,
	ConnectionAborted,
	NotConnected,
	AddrInUse,
	AddrNotAvailable,
	BrokenPipe,
	AlreadyExists,
	InvalidData,
	TimedOut,
	Interrupted,
	WriteZero,
	WouldBlock,
	UnexpectedEof,
	BadResource,
	Http,
	Busy,
	NotSupported,
};

export { errors };