"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const lodash_1 = require("lodash");
const schematics_1 = require("@angular-devkit/schematics");
const ast_utils_1 = require("../utils/angular/ast-utils");
const change_1 = require("../utils/angular/change");
const find_module_1 = require("../utils/angular/find-module");
function addDeclarationToNgModule(options) {
    const { module } = options;
    if (!module) {
        throw new schematics_1.SchematicsException('module option is required.');
    }
    return host => {
        const text = host.read(module);
        if (!text) {
            throw new schematics_1.SchematicsException(`File ${module} does not exist.`);
        }
        const sourceText = text.toString('utf8');
        const source = ts.createSourceFile(module, sourceText, ts.ScriptTarget.Latest, true);
        const pagePath = (`/${options.sourceDir}/${options.path}/` +
            (options.flat ? '' : `${lodash_1.kebabCase(options.name)}/`) +
            `${lodash_1.kebabCase(options.name)}.page`);
        const relativePath = find_module_1.buildRelativePath(module, pagePath);
        const classifiedName = `${lodash_1.upperFirst(lodash_1.camelCase(options.name))}Page`;
        const declarationChanges = ast_utils_1.addDeclarationToModule(source, module, classifiedName, relativePath);
        const declarationRecorder = host.beginUpdate(module);
        for (const change of declarationChanges) {
            if (change instanceof change_1.InsertChange) {
                declarationRecorder.insertLeft(change.pos, change.toAdd);
            }
        }
        host.commitUpdate(declarationRecorder);
        return host;
    };
}
function default_1(options) {
    const { sourceDir } = options;
    if (!sourceDir) {
        throw new schematics_1.SchematicsException('sourceDir option is required.');
    }
    if (!options.path) {
        throw new schematics_1.SchematicsException('path option is required.');
    }
    return (host, context) => {
        options.module = find_module_1.findModuleFromOptions(host, options);
        const templateSource = schematics_1.apply(schematics_1.url('./files'), [
            options.spec ? schematics_1.noop() : schematics_1.filter(p => !p.endsWith('.spec.ts')),
            schematics_1.template(Object.assign({ camelCase: lodash_1.camelCase,
                kebabCase: lodash_1.kebabCase,
                upperFirst: lodash_1.upperFirst, 'if-flat': (s) => options.flat ? '' : s }, options)),
            schematics_1.move(sourceDir),
        ]);
        return schematics_1.chain([
            schematics_1.branchAndMerge(schematics_1.chain([
                addDeclarationToNgModule(options),
                schematics_1.mergeWith(templateSource),
            ])),
        ])(host, context);
    };
}
exports.default = default_1;
