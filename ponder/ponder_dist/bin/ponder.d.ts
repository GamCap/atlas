#!/usr/bin/env node
import { P as Prettify } from '../utils-0kAkCPl6.js';
import { Command } from '@commander-js/extra-typings';

declare const ponder: Command<[], {
    root?: string | undefined;
    config: string;
    debug?: true | undefined;
    trace?: true | undefined;
}>;
type GlobalOptions = {
    command: "dev" | "start" | "serve" | "codegen";
} & ReturnType<typeof ponder.opts>;
declare const devCommand: Command<[], {
    port: number;
    hostname: string;
}>;
declare const startCommand: Command<[], {
    port: number;
    hostname: string;
}>;
declare const serveCommand: Command<[], {
    port: number;
    hostname: string;
}>;
declare const codegenCommand: Command<[], {}>;
type CliOptions = Prettify<GlobalOptions & Partial<ReturnType<typeof devCommand.opts> & ReturnType<typeof startCommand.opts> & ReturnType<typeof serveCommand.opts> & ReturnType<typeof codegenCommand.opts>>>;

export type { CliOptions };
