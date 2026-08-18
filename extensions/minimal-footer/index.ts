import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { installFooter, type FooterController } from "./footer.ts";

export default function minimalFooter(pi: ExtensionAPI): void {
	let modelId = "no-model";
	let thinkingLevel = "off";
	let footer: FooterController | undefined;

	pi.on("session_start", (_event, ctx) => {
		if (ctx.mode !== "tui") return;

		modelId = ctx.model?.id ?? "no-model";
		thinkingLevel = ctx.thinkingLevel ?? "off";
		footer = installFooter(ctx, () => ({
			modelId,
			thinkingLevel,
			contextPercent: ctx.getContextUsage()?.percent ?? null,
		}));
	});

	pi.on("agent_settled", () => footer?.requestRender());

	pi.on("model_select", (event) => {
		modelId = event.model.id;
		footer?.requestRender();
	});

	pi.on("thinking_level_select", (event) => {
		thinkingLevel = event.level;
		footer?.requestRender();
	});

	pi.on("session_shutdown", (_event, ctx) => {
		if (ctx.mode === "tui") ctx.ui.setFooter(undefined);
		footer = undefined;
	});
}
