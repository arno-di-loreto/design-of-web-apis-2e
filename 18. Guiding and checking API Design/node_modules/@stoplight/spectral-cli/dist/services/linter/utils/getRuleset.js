"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRuleset = void 0;
const tslib_1 = require("tslib");
const spectral_core_1 = require("@stoplight/spectral-core");
const fs = (0, tslib_1.__importStar)(require("fs"));
const path = (0, tslib_1.__importStar)(require("@stoplight/path"));
const process = (0, tslib_1.__importStar)(require("process"));
const module_1 = require("module");
const spectral_runtime_1 = require("@stoplight/spectral-runtime");
const spectral_ruleset_migrator_1 = require("@stoplight/spectral-ruleset-migrator");
const spectral_ruleset_bundler_1 = require("@stoplight/spectral-ruleset-bundler");
const node_1 = require("@stoplight/spectral-ruleset-bundler/presets/node");
const commonjs_1 = require("@stoplight/spectral-ruleset-bundler/plugins/commonjs");
const stdin_1 = require("@stoplight/spectral-ruleset-bundler/plugins/stdin");
const builtins_1 = require("@stoplight/spectral-ruleset-bundler/plugins/builtins");
const lodash_1 = require("lodash");
const errors_1 = require("../../../errors");
async function getDefaultRulesetFile() {
    const cwd = process.cwd();
    for (const filename of await fs.promises.readdir(cwd)) {
        if (spectral_core_1.Ruleset.isDefaultRulesetFile(filename)) {
            return path.join(cwd, filename);
        }
    }
    return;
}
function isErrorWithCode(error) {
    return 'code' in error && typeof error.code === 'string';
}
async function getRuleset(rulesetFile) {
    if (rulesetFile === void 0) {
        rulesetFile = await getDefaultRulesetFile();
    }
    else if (!path.isAbsolute(rulesetFile)) {
        rulesetFile = path.join(process.cwd(), rulesetFile);
    }
    if (rulesetFile === void 0) {
        throw new errors_1.CLIError('No ruleset has been found. Please provide a ruleset using the --ruleset CLI argument, or make sure your ruleset file matches .?spectral.(js|ya?ml|json)');
    }
    let ruleset;
    try {
        if (await (0, spectral_ruleset_migrator_1.isBasicRuleset)(rulesetFile)) {
            const migratedRuleset = await (0, spectral_ruleset_migrator_1.migrateRuleset)(rulesetFile, {
                format: 'esm',
                fs,
            });
            rulesetFile = path.join(path.dirname(rulesetFile), '.spectral.js');
            ruleset = await (0, spectral_ruleset_bundler_1.bundleRuleset)(rulesetFile, {
                target: 'node',
                format: 'commonjs',
                plugins: [(0, stdin_1.stdin)(migratedRuleset, rulesetFile), (0, builtins_1.builtins)(), (0, commonjs_1.commonjs)(), ...(0, node_1.node)({ fs, fetch: spectral_runtime_1.fetch })],
            });
        }
        else {
            ruleset = await (0, spectral_ruleset_bundler_1.bundleRuleset)(rulesetFile, {
                target: 'node',
                format: 'commonjs',
                plugins: [(0, builtins_1.builtins)(), (0, commonjs_1.commonjs)(), ...(0, node_1.node)({ fs, fetch: spectral_runtime_1.fetch })],
            });
        }
    }
    catch (e) {
        if (!(0, lodash_1.isError)(e) || !isErrorWithCode(e) || e.code !== 'UNRESOLVED_ENTRY') {
            throw e;
        }
        throw new errors_1.CLIError(`Could not read ruleset at ${rulesetFile}.`);
    }
    return new spectral_core_1.Ruleset(load(ruleset, rulesetFile), {
        severity: 'recommended',
        source: rulesetFile,
    });
}
exports.getRuleset = getRuleset;
function load(source, uri) {
    const actualUri = path.isURL(uri) ? uri.replace(/^https?:\//, '') : uri;
    const req = (0, module_1.createRequire)(actualUri);
    const m = {};
    const paths = [path.dirname(uri), __dirname];
    const _require = (id) => req(req.resolve(id, { paths }));
    Function('module, require', source)(m, _require);
    if (!(0, lodash_1.isObject)(m.exports)) {
        throw new errors_1.CLIError('No valid export found');
    }
    return m.exports;
}
//# sourceMappingURL=getRuleset.js.map