import { visibleWidth } from "@earendil-works/pi-tui";
import { describe, expect, it } from "vitest";
import { compactToolLine, isPrivateAddress, parseSearchResults } from "./index.ts";

describe("parseSearchResults", () => {
	it("parses DuckDuckGo results and unwraps target URLs", () => {
		const html = `
			<a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2Fdocs&amp;rut=x">Example &amp; Docs</a>
			<a class="result__snippet" href="#"><b>Primary</b> documentation.</a>
		`;

		expect(parseSearchResults(html, 1)).toBe("1. Example & Docs\nhttps://example.com/docs\nPrimary documentation.");
	});

	it("keeps direct URLs and omits missing snippets", () => {
		const html = `
			<a class="result__a" href="https://example.com/one">First</a>
			<a class="result__a" href="https://example.com/two">Second</a>
			<a class="result__snippet">Only first snippet</a>
		`;

		expect(parseSearchResults(html, 2)).toBe(
			"1. First\nhttps://example.com/one\nOnly first snippet\n\n2. Second\nhttps://example.com/two",
		);
	});

	it("honors the result limit", () => {
		const html = `
			<a class="result__a" href="https://example.com/one">First</a>
			<a class="result__a" href="https://example.com/two">Second</a>
		`;

		expect(parseSearchResults(html, 1)).toBe("1. First\nhttps://example.com/one");
		expect(parseSearchResults(html, 0)).toBe("");
	});

	it("returns an empty string when the page has no results", () => {
		expect(parseSearchResults("<html>No results</html>", 10)).toBe("");
	});
});

describe("compactToolLine", () => {
	it("truncates a tool row instead of wrapping it", () => {
		const [line] = compactToolLine("A researcher prompt that is too long", (value) => value).render(18);

		expect(visibleWidth(line)).toBe(18);
		expect(line).toContain("…");
		expect(line).not.toContain("\u{1B}[0m");
	});

	it.each([
		{ width: 1, expected: "…" },
		{ width: 2, expected: "a…" },
		{ width: 3, expected: " … " },
	])("renders narrow rows at exactly $width columns", ({ width, expected }) => {
		const lines = compactToolLine("abc", (value) => value).render(width);

		expect(lines).toEqual([expected]);
		expect(visibleWidth(lines[0])).toBe(width);
	});

	it("does not render at non-positive widths", () => {
		expect(compactToolLine("text", (value) => value).render(0)).toEqual([]);
	});
});

describe("isPrivateAddress", () => {
	it.each([
		"0.0.0.0",
		"10.1.2.3",
		"100.64.0.1",
		"127.0.0.1",
		"169.254.1.1",
		"172.16.0.1",
		"192.0.2.1",
		"192.168.1.1",
		"198.18.0.1",
		"198.51.100.1",
		"203.0.113.1",
		"224.0.0.1",
		"::",
		"::1",
		"::ffff:127.0.0.1",
		"2001:db8::1",
		"fd00::1",
		"fe80::1",
		"ff02::1",
	])("identifies %s as private or non-routable", (address) => {
		expect(isPrivateAddress(address)).toBe(true);
	});

	it.each([
		"1.1.1.1",
		"8.8.8.8",
		"100.63.255.255",
		"100.128.0.1",
		"172.15.255.255",
		"172.32.0.1",
		"192.169.0.1",
		"2606:4700:4700::1111",
	])("identifies %s as public", (address) => {
		expect(isPrivateAddress(address)).toBe(false);
	});
});
