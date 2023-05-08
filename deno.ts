import { errors } from './errors.js';
const os = require('os');

class Deno {
	static errors = errors;
	static pid = process.pid;
	static ppid = process.ppid;
	memoryUsage() {
		return process.memoryUsage();
	}
	hostname() {
		return os.hostname();
	}
	loadavg() {
		return os.loadavg();
	}
	networkInterfaces() {
		return os.networkInterfaces();
	}
	static systemMemoryInfo() {
		return os.sysmem();
	}
	static memoryUsage() {
		return process.memoryUsage();
	}
}