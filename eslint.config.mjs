import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import eslint from "@eslint/js";
import prettier from "eslint-config-prettier/flat";
import n from "eslint-plugin-n";
import regexp from "eslint-plugin-regexp";
import security from "eslint-plugin-security";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

const codeFiles = ["**/*.{js,mjs,cjs}"];

export default defineConfig(
	globalIgnores(["node_modules/**"]),
	{
		files: codeFiles,
		extends: [
			eslint.configs.recommended,
			comments.recommended,
			n.configs["flat/recommended-module"],
			regexp.configs["flat/recommended"],
			unicorn.configs.unopinionated,
		],
		languageOptions: {
			globals: globals.node,
		},
		plugins: {
			security,
			sonarjs,
		},
		linterOptions: {
			reportUnusedDisableDirectives: "error",
			reportUnusedInlineConfigs: "error",
		},
		rules: {
			"@eslint-community/eslint-comments/require-description": "error",
			"array-callback-return": ["error", { checkForEach: true }],
			curly: ["error", "multi-line", "consistent"],
			"default-case-last": "error",
			eqeqeq: ["error", "always", { null: "ignore" }],
			"max-depth": ["error", 4],
			"max-lines": ["error", { max: 700, skipBlankLines: true, skipComments: true }],
			"max-lines-per-function": ["error", { max: 180, skipBlankLines: true, skipComments: true }],
			"max-params": ["error", 5],
			"n/no-extraneous-import": "off",
			"n/no-missing-import": "off",
			"n/no-process-exit": "off",
			"n/no-unpublished-import": "off",
			"no-alert": "error",
			"no-caller": "error",
			"no-constant-binary-expression": "error",
			"no-eval": "error",
			"no-extend-native": "error",
			"no-implicit-coercion": "error",
			"no-implied-eval": "error",
			"no-iterator": "error",
			"no-labels": "error",
			"no-lone-blocks": "error",
			"no-multi-str": "error",
			"no-new-func": "error",
			"no-new-wrappers": "error",
			"no-promise-executor-return": "error",
			"no-proto": "error",
			"no-return-assign": ["error", "always"],
			"no-script-url": "error",
			"no-self-compare": "error",
			"no-sequences": "error",
			"no-template-curly-in-string": "error",
			"no-unmodified-loop-condition": "error",
			"no-unreachable-loop": "error",
			"no-useless-call": "error",
			"no-useless-computed-key": "error",
			"no-useless-concat": "error",
			"no-useless-rename": "error",
			"no-with": "error",
			"prefer-object-has-own": "error",
			"prefer-promise-reject-errors": "error",
			radix: "error",
			"security/detect-bidi-characters": "error",
			"security/detect-eval-with-expression": "error",
			"sonarjs/cognitive-complexity": ["error", 30],
			"sonarjs/no-all-duplicated-branches": "error",
			"sonarjs/no-dead-store": "error",
			"sonarjs/no-duplicate-string": ["error", { threshold: 5 }],
			"sonarjs/no-duplicated-branches": "error",
			"sonarjs/no-element-overwrite": "error",
			"sonarjs/no-empty-collection": "error",
			"sonarjs/no-gratuitous-expressions": "error",
			"sonarjs/no-identical-conditions": "error",
			"sonarjs/no-identical-expressions": "error",
			"sonarjs/no-identical-functions": "error",
			"sonarjs/no-redundant-assignments": "error",
			"sonarjs/no-use-of-empty-return-value": "error",
			"sonarjs/no-useless-increment": "error",
			"unicorn/import-style": "off",
			"unicorn/no-process-exit": "off",
			yoda: "error",
		},
	},
	prettier,
);
