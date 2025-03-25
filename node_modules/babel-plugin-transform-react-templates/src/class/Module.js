'use strict'

const PathHelpers = require('./PathHelpers');

const getImportDeclaration = require('./getImportDeclaration');
const { codeFrameColumns } = require("@babel/code-frame");

class Module extends PathHelpers {

  constructor (path, file, code) {
    super(path);
    this.file = file;
    this.code = code;
  }

  error(message, node) {
    const loc = node.loc;
    message += '\n' + codeFrameColumns(this.code, {
      start: {
        line: loc.start.line,
        column: loc.start.column + 1
      },
      end: loc.end && loc.start.line === loc.end.line ? {
        line: loc.end.line,
        column: loc.end.column + 1
      } : undefined
    }, {
      highlightCode: true
    });
    const err = new Error(message);
    err.loc = {
      line: loc.start.line,
      column: loc.start.column,
    }
    throw err;
  }

  convertReactTemplate(options = {}) {
    const node = this.first('ExportDefaultDeclaration');
    if (!node) return; // Must export a template function as default
    const isExportingStringLiteral = (node.declaration.type === "StringLiteral");
    if (isExportingStringLiteral) {
      return; // Rollup preflight checks
    }
    const isDefaultExportAFunction = (node.declaration.type === "ArrowFunctionExpression" || node.declaration.type == "FunctionDeclaration") &&
      (node.declaration.body.type === "BlockStatement");
    if (!isDefaultExportAFunction) {
      this.error(`React template file must: export default function() { return /* JSXElement or similar */; }`, node);
    }
    const returnStatement = node.declaration.body.body.find(node => node.type === "ReturnStatement");
    if (!returnStatement) {
      this.error(`React template file must: export default function() { return /* JSXElement or similar */; }`, node.declaration.body);
    }
    const registerFunctionName = options.registerFunctionName || 'register';
    if (options.importRegisterFunctionFromModule) {
      const directive = getImportDeclaration(options.importRegisterFunctionFromModule, registerFunctionName);
      this.path.node.body.unshift(directive);
    }
    const arg = { ...node.declaration };
    if (arg.type === "ClassDeclaration") {
      // We're going to be wrapping it with a function call
      arg.type = "ClassExpression";
    }
    const registerTemplateName = typeof options.registerTemplateName === "function" ?
      options.registerTemplateName(this.file.filename) :
      this.file.filename;
    node.declaration = {
      arguments: [{ type: "StringLiteral", value: registerTemplateName }, arg],
      callee: { name: registerFunctionName, type: "Identifier" },
      type: "CallExpression"
    };
    return true;
  }

}

module.exports = Module
