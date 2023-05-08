import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import vm from "vm";
import fs from "fs";
const ts = require('typescript');
import url from "url";
import { default as DOMEvents } from "missing-dom-events";
import { serveHttp, listen } from "./http.js";
import os from "os";
import crypto from "crypto";
import path from "path";

export class DenoRunner {
	#module
	#moduleCache = new Map();
	constructor(source, location) {
		location = url.pathToFileURL(location);
		const buildInfo = {
			arch: os.arch(),
			os: os.platform(),
			vendor: 'Node.js',
			env: process.env.NODE_ENV,
		};


		const Deno = {
			lstatSync: fs.lstatSync,
			errors: {
				NotFound: Error,
			},
			mkdirSync: fs.mkdirSync,
			readTextFileSync: (path) => fs.readFileSync(path, 'utf8'),
			writeTextFileSync: fs.writeFileSync,
			writeTextFile: fs.promises.writeFile,
			rename: fs.promises.rename,
			serveHttp: serveHttp,
			listen: listen,
			build: {
				target: `${buildInfo.arch}-${buildInfo.os}-${buildInfo.vendor}`,
				os: buildInfo.os,
				arch: buildInfo.arch,
				vendor: buildInfo.vendor,
				env: buildInfo.env,
			}
		}

		const contextifiedObject = vm.createContext({
			console,
			// Print all gets
			Deno: new Proxy(Deno, {
				get(target, prop) {
					console.log(`Deno.${prop}`);
					return target[prop];
				}
			}),
			// Encoding API
			TextEncoder: TextEncoder,
			TextDecoder: TextDecoder,
			TextEncoderStream: TextEncoderStream,
			TextDecoderStream: TextDecoderStream,
			// Event API
			Event: Event,
			EventTarget: EventTarget,
			// Streams API
			ReadableStream: ReadableStream,
			ReadableStreamDefaultReader: ReadableStreamDefaultReader,
			ReadableStreamDefaultController: ReadableStreamDefaultController,
			WritableStream: WritableStream,
			WritableStreamDefaultWriter: WritableStreamDefaultWriter,
			WritableStreamDefaultController: WritableStreamDefaultController,
			TransformStream: TransformStream,
			TransformStreamDefaultController: TransformStreamDefaultController,
			ByteLengthQueuingStrategy: ByteLengthQueuingStrategy,
			CountQueuingStrategy: CountQueuingStrategy,
			// DOM Events
			CloseEvent: DOMEvents.CloseEvent,
			CustomEvent: DOMEvents.CustomEvent,
			ErrorEvent: DOMEvents.ErrorEvent,
			MessageEvent: DOMEvents.MessageEvent,
			ProgressEvent: DOMEvents.ProgressEvent,
			PromiseRejectionEvent: DOMEvents.PromiseRejectionEvent,
			// Fetch API
			fetch: fetch,
			Headers: Headers,
			Request: Request,
			Response: Response,
			URL: URL,
			// Web Crypto API
			crypto: crypto,
			// Web Workers API
			// Worker: Worker,
			// WebSockets API
			// WebSocket: WebSocket,
			// File System API
			File: File,
			// FileList: FileList,
			Blob: Blob,
			// FileReader: FileReader,
			// WebAssembly API
			WebAssembly: WebAssembly,
			// Web Storage API
			// localStorage: localStorage,

		});

		this.#module = new vm.SourceTextModule(source, {
			context: contextifiedObject,
			initializeImportMeta(meta) {
				// Implement Deno's import.meta API
				meta.url = location;
				meta.main = true;
				meta.resolve = specifier => new URL(specifier, meta.url).href;
			},
			identifier: url.pathToFileURL(import.meta.url).href,
		});
	}

	static #createCachePath(specifier) {
		const cacheDir = `./.cache/deno/`;
		return `${cacheDir}/${encodeURIComponent(specifier)}`;
	}

	static async #fetchAndCache(specifier) {
		const response = await fetch(specifier);
		const source = await response.text();

		const cachePath = DenoRunner.#createCachePath(specifier);
		await fs.promises.mkdir(path.dirname(cachePath), { recursive: true });
		await fs.promises.writeFile(cachePath, source, 'utf8');

		return source;
	}

	async #linker(specifier, referencingModule) {
		const referencingModuleURL = referencingModule.identifier;
		specifier = new URL(specifier, referencingModuleURL).href;

		if (moduleCache.has(specifier)) {
			return moduleCache.get(specifier);
		}

		let source;
		if (specifier.startsWith('https://') || specifier.startsWith('http://')) {
			const cachePath = createCachePath(specifier);
			const cacheExists = await fs.promises.access(cachePath).then(() => true).catch(() => false);

			if (cacheExists) {
				source = await fs.promises.readFile(cachePath, 'utf8');
			} else {
				source = await DenoRunner.#fetchAndCache(specifier);
			}
		} else {
			source = await fs.promises.readFile(url.fileURLToPath(specifier), 'utf8');
		}

		// Check if the file is a TypeScript file and catch any errors
		if (specifier.endsWith('.ts')) {
			const { outputText } = ts.transpileModule(source, {
				compilerOptions: {
					module: 99,
					target: 99,
				},
			});
			source = outputText;
		}

		// Create a new SourceTextModule and cache it along with the last modified timestamp
		const module = new vm.SourceTextModule(source, {
			context: referencingModule.context,
			identifier: specifier,
			initializeImportMeta(meta) {
				// Implement Deno's import.meta API
				meta.url = specifier;
				meta.main = false;
				meta.resolve = specifier => new URL(specifier, meta.url).href;
			}
		});

		moduleCache.set(specifier, module);

		return module;
	}

	async #link() {
		await this.#module.link(this.#linker);
	}

	async run() {
		await this.#link();
		await this.#module.evaluate();
	}
}