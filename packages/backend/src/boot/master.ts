import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import * as os from 'node:os';
import cluster from 'node:cluster';
import chalk from 'chalk';
import chalkTemplate from 'chalk-template';
import semver from 'semver';
import { NestFactory } from '@nestjs/core';
import Logger from '@/logger.js';
import { loadConfig } from '@/config.js';
import type { Config } from '@/config.js';
import { lessThan } from '@/misc/prelude/array.js';
import { showMachineInfo } from '@/misc/show-machine-info.js';
import { DaemonModule } from '@/daemons/DaemonModule.js';
import { JanitorService } from '@/daemons/JanitorService.js';
import { QueueStatsService } from '@/daemons/QueueStatsService.js';
import { ServerStatsService } from '@/daemons/ServerStatsService.js';
import { NestLogger } from '@/NestLogger.js';
import { ChartManagementService } from '@/core/chart/ChartManagementService.js';
import { ServerService } from '@/server/ServerService.js';
import { MainModule } from '@/MainModule.js';
import { envOption } from '../env.js';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const meta = JSON.parse(fs.readFileSync(`${_dirname}/../../../../built/meta.json`, 'utf-8'));

const logger = new Logger('core', 'cyan');
const bootLogger = logger.createSubLogger('boot', 'magenta', false);

const themeColor = chalk.hex('#86b300');

function greet() {
	if (!envOption.quiet) {
		//#region Misskey logo
		const v = `v${meta.version}`;
		console.log(themeColor('  _____ _         _           '));
		console.log(themeColor(' |     |_|___ ___| |_ ___ _ _ '));
		console.log(themeColor(' | | | | |_ -|_ -| \'_| -_| | |'));
		console.log(themeColor(' |_|_|_|_|___|___|_,_|___|_  |'));
		console.log(' ' + chalk.gray(v) + themeColor('                        |___|\n'.substr(v.length)));
		//#endregion

		console.log(' Misskey is an open-source decentralized microblogging platform.');
		console.log(chalk.rgb(255, 136, 0)(' If you like Misskey, please donate to support development. https://www.patreon.com/syuilo'));

		console.log('');
		console.log(chalkTemplate`--- ${os.hostname()} {gray (PID: ${process.pid.toString()})} ---`);
	}

	bootLogger.info('Welcome to Misskey!');
	bootLogger.info(`Misskey v${meta.version}`, null, true);
}

/**
 * Init master process
 */
export async function masterMain() {
	let config!: Config;

	// initialize app
	try {
		greet();
		showEnvironment();
		await showMachineInfo(bootLogger);
		showNodejsVersion();
		config = loadConfigBoot();
		//await connectDb();
	} catch (e) {
		bootLogger.error('Fatal error occurred during initialization', null, true);
		process.exit(1);
	}

	const app = await NestFactory.createApplicationContext(MainModule, {
		logger: new NestLogger(),
	});
	app.enableShutdownHooks();

	// start server
	const serverService = app.get(ServerService);
	serverService.launch();

	bootLogger.succ('Misskey initialized');

	if (!envOption.disableClustering) {
		await spawnWorkers(config.clusterLimit);
	}

	bootLogger.succ(`Now listening on port ${config.port} on ${config.url}`, null, true);

	app.get(ChartManagementService).start();
	app.get(JanitorService).start();
	app.get(QueueStatsService).start();
	app.get(ServerStatsService).start();
}

function showEnvironment(): void {
	const env = process.env.NODE_ENV;
	const logger = bootLogger.createSubLogger('env');
	logger.info(typeof env === 'undefined' ? 'NODE_ENV is not set' : `NODE_ENV: ${env}`);

	if (env !== 'production') {
		logger.warn('The environment is not in production mode.');
		logger.warn('DO NOT USE FOR PRODUCTION PURPOSE!', null, true);
	}
}

function showNodejsVersion(): void {
	const nodejsLogger = bootLogger.createSubLogger('nodejs');

	nodejsLogger.info(`Version ${process.version} detected.`);

	const minVersion = fs.readFileSync(`${_dirname}/../../../../.node-version`, 'utf-8').trim();
	if (semver.lt(process.version, minVersion)) {
		nodejsLogger.error(`At least Node.js ${minVersion} required!`);
		process.exit(1);
	}
}

function loadConfigBoot(): Config {
	const configLogger = bootLogger.createSubLogger('config');
	let config;

	try {
		config = loadConfig();
	} catch (exception) {
		if (typeof exception === 'string') {
			configLogger.error(exception);
			process.exit(1);
		} else if ((exception as any).code === 'ENOENT') {
			configLogger.error('Configuration file not found', null, true);
			process.exit(1);
		}
		throw exception;
	}

	configLogger.succ('Loaded');

	return config;
}

/*
async function connectDb(): Promise<void> {
	const dbLogger = bootLogger.createSubLogger('db');

	// Try to connect to DB
	try {
		dbLogger.info('Connecting...');
		await initDb();
		const v = await db.query('SHOW server_version').then(x => x[0].server_version);
		dbLogger.succ(`Connected: v${v}`);
	} catch (err) {
		dbLogger.error('Cannot connect', null, true);
		dbLogger.error(err);
		process.exit(1);
	}
}
*/

async function spawnWorkers(limit = 1) {
	const workers = Math.min(limit, os.cpus().length);
	bootLogger.info(`Starting ${workers} worker${workers === 1 ? '' : 's'}...`);
	await Promise.all([...Array(workers)].map(spawnWorker));
	bootLogger.succ('All workers started');
}

function spawnWorker(): Promise<void> {
	return new Promise(res => {
		const worker = cluster.fork();
		worker.on('message', message => {
			if (message === 'listenFailed') {
				bootLogger.error('The server Listen failed due to the previous error.');
				process.exit(1);
			}
			if (message !== 'ready') return;
			res();
		});
	});
}
