import assert from "node:assert/strict";
import test from "node:test";
import { visibleWidth } from "@earendil-works/pi-tui";
import { compactToolLine, isPrivateAddress, parseSearchResults } from "./index.ts";

test("parses DuckDuckGo results and unwraps target URLs", () => {
	const html = `
		<a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2Fdocs&amp;rut=x">Example &amp; Docs</a>
		<a class="result__snippet" href="#"><b>Primary</b> documentation.</a>
	`;
	assert.equal(
		parseSearchResults(html, 1),
		"1. Example & Docs\nhttps://example.com/docs\nPrimary documentation.",
	);
});

test("single-line tool rows truncate instead of wrapping", () => {
	const lines = compactToolLine("A researcher prompt that is too long", (line) => line).render(18);
	assert.equal(lines.length, 1);
	assert.equal(visibleWidth(lines[0]!), 18);
	assert.ok(lines[0]!.includes("…"));
	assert.ok(!lines[0]!.includes("\x1b[0m"));
});

test("identifies private and non-routable addresses", () => {
	for (const address of ["127.0.0.1", "10.1.2.3", "192.168.1.1", "169.254.1.1", "::1", "::ffff:127.0.0.1", "fd00::1"]) {
		assert.equal(isPrivateAddress(address), true, address);
	}
	for (const address of ["1.1.1.1", "8.8.8.8", "2606:4700:4700::1111"]) {
		assert.equal(isPrivateAddress(address), false, address);
	}
});
