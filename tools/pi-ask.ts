import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { CustomToolFactory } from "@oh-my-pi/pi-coding-agent";

interface PiAskParams {
	model?: string;
	prompt?: string;
	contextFile?: string;
	probe?: boolean;
	listModels?: boolean;
}

const factory: CustomToolFactory = pi => {
	const { Type } = pi.typebox;

	const Params = Type.Object({
		model: Type.Optional(Type.String({ description: "Model alias/name for pi-ask (for example: opus, codex, sonnet)." })),
		prompt: Type.Optional(Type.String({ description: "Context text to send to pi-ask. Ignored when contextFile is set." })),
		contextFile: Type.Optional(Type.String({ description: "Path to context file. Relative paths resolve from current project cwd." })),
		probe: Type.Optional(Type.Boolean({ default: false, description: "Only probe model availability (no context required)." })),
		listModels: Type.Optional(Type.Boolean({ default: false, description: "List supported model aliases and canonical names." })),
	});

	return {
		name: "pi_ask",
		label: "Pi Ask",
		description: "Run cross-model consultation through the pi-ask wrapper.",
		parameters: Params,

		async execute(_toolCallId, paramsRaw, onUpdate, ctx, signal) {
			const params = paramsRaw as PiAskParams;
			const scriptPath = path.resolve(import.meta.dir, "../scripts/pi-ask");
			if (!fs.existsSync(scriptPath)) {
				return {
					isError: true,
					content: [{ type: "text", text: `pi-ask script not found: ${scriptPath}` }],
					details: { scriptPath, phase: "validate" },
				};
			}

			const listModels = params.listModels === true;
			const probe = params.probe === true;
			const args: string[] = [];

			if (listModels) {
				args.push("--list");
			} else {
				if (!params.model || params.model.trim().length === 0) {
					return {
						isError: true,
						content: [{ type: "text", text: "model is required unless listModels=true" }],
						details: { phase: "validate" },
					};
				}
				args.push(params.model.trim());
				if (probe) args.push("--probe");
			}

			let tempContextFile: string | null = null;

			try {
				if (!listModels && !probe) {
					if (params.contextFile && params.contextFile.trim().length > 0) {
						const resolved = path.isAbsolute(params.contextFile)
							? params.contextFile
							: path.resolve(ctx.cwd, params.contextFile);
						if (!fs.existsSync(resolved)) {
							return {
								isError: true,
								content: [{ type: "text", text: `contextFile not found: ${resolved}` }],
								details: { phase: "validate", contextFile: resolved },
							};
						}
						args.push("-f", resolved);
					} else if (params.prompt && params.prompt.trim().length > 0) {
						tempContextFile = path.join(os.tmpdir(), `pi-ask-${Date.now()}-${Math.random().toString(36).slice(2)}.md`);
						await Bun.write(tempContextFile, params.prompt);
						args.push("-f", tempContextFile);
					} else {
						return {
							isError: true,
							content: [{ type: "text", text: "provide prompt or contextFile unless probe=true" }],
							details: { phase: "validate" },
						};
					}
				}

				onUpdate?.({
					content: [{ type: "text", text: `Running: ${scriptPath} ${args.join(" ")}` }],
					details: { phase: "execute", args },
				});

				const result = await pi.exec(scriptPath, args, {
					cwd: ctx.cwd,
					signal,
				});

				const stdout = result.stdout?.trim() ?? "";
				const stderr = result.stderr?.trim() ?? "";
				const output = [stdout, stderr].filter(Boolean).join("\n").trim();

				if (result.killed) {
					return {
						isError: true,
						content: [{ type: "text", text: "pi-ask process was cancelled" }],
						details: { phase: "execute", code: result.code, killed: true },
					};
				}

				if (result.code !== 0) {
					return {
						isError: true,
						content: [{ type: "text", text: output || `pi-ask failed with exit code ${result.code}` }],
						details: { phase: "execute", code: result.code, args },
					};
				}

				return {
					content: [{ type: "text", text: output || "pi-ask completed with no output" }],
					details: { phase: "execute", code: result.code, args },
				};
			} finally {
				if (tempContextFile) {
					await fs.promises.unlink(tempContextFile).catch(() => undefined);
				}
			}
		},
	};
};

export default factory;
