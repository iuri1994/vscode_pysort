// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('sortpythonlib.helloWorld', () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            const document = editor.document;
            const text = document.getText();

            const sortedText = sortPythonImports(text);

            editor.edit(editBuilder => {
                const start = new vscode.Position(0, 0);
                const end = new vscode.Position(document.lineCount + 1, 0);
                editBuilder.replace(new vscode.Range(start, end), sortedText);
            });
        }
    });

    context.subscriptions.push(disposable);
}

function sortPythonImports(text: string): string {
    const pythonCode = text.split('\n');

    // const categories = ['core/logic_flow', 'core/crud', 'SEC.sec_core', 'SEC.sec_admin', 'SEC.sec_client_manager', 'SEC.sec_end_user'];
    const categories = vscode.workspace.getConfiguration().get('sortpythonlib.categories', []);

    const importLines: string[] = [];
    const nonImportLines: string[] = [];
    const encoding_line: string[] = [];

    let currentImportBlock: string[] = [];
    let inImportBlock = false;

    for (const line of pythonCode) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('# -*- coding:')) {
            encoding_line.push(trimmedLine);
        } else {
            if ((trimmedLine.startsWith('from ') || trimmedLine.startsWith('import ') || trimmedLine.startsWith('#from ') || trimmedLine.startsWith('#import ')) && !inImportBlock) {
                inImportBlock = true;
            }
    
            if (inImportBlock) {
                currentImportBlock.push(line);
    
                if (!trimmedLine.endsWith('\\')) {
                    inImportBlock = false;
                    importLines.push(currentImportBlock.join('\n'));
                    currentImportBlock = [];
                }
            } else {
                nonImportLines.push(line);
            }
        }

    }

    const sortedImports = sortImports(importLines, categories);

    let index_non_import_line = 0;
    for (index_non_import_line = 0; index_non_import_line < nonImportLines.length; index_non_import_line++) {
        if (nonImportLines[index_non_import_line] !== '\r') {
            break;
        }
    }

    let nonImportLines_formated = nonImportLines.splice(index_non_import_line);

    return `${encoding_line}\n${sortedImports}\n\n\n${nonImportLines_formated.join('\n')}`;
}

function splitCodeLines(code: string, maxLength: number): string {
    // Remove all newline characters (\n and \r)
    const codeWithoutNewlines = code.replace(/[\n\r]+/g, '');

    // Remove existing continuation characters (\)
    const codeWithoutContinuations = codeWithoutNewlines.replace(/\\+/g, ' ');

    // Remove all extra spaces
    const codeWithoutExtraSpaces = codeWithoutContinuations.replace(/\s+/g, ' ');

    // Split the code into words
    const words = codeWithoutExtraSpaces.split(/\s+/);

    let modified_array = [];
    let line = '';

    for (let i=0; i < words.length; i++ ) {
        let word = words[i];
        if (line === '' || line === '\t') {
            line += word;
        } else {
            line = line + ' ' + word;
        }

        let next_word = '';
        if (i + 1 < words.length ) {
            next_word = ' ' + words[i+1];
        }

        let new_line = line + next_word;

        if ((new_line.startsWith('\t') && new_line.length >= maxLength - 2) || new_line.length >= maxLength) {
            modified_array.push(line);
            line = '\t'; // Start a new line with a tab character
        }
    }

    if (line !== '\t') {
        modified_array.push(line);
    }

    // Join the lines with a continuation character (\)
    const modifiedCode = modified_array.join('\\\n');
    return modifiedCode;
}

function sortImports(importLines: string[], categories: string[]): string {
    const sortedArrays: string[][] = categories.map(() => []);
    sortedArrays.push([]); // Add an empty array as the default entry

    for (const importLine of importLines) {
        const categoryIndex = getCategoryIndex(importLine, categories);
        let import_line_formated = splitCodeLines(importLine, 100);
        sortedArrays[categoryIndex].push(import_line_formated);
    }

    for (const array of sortedArrays) {
        array.sort();
        array.sort((a, b) => {
            const isImportA = a.trim().startsWith('import');
            const isImportB = b.trim().startsWith('import');

            if (isImportA && !isImportB) {
                return -1; // 'import' comes before 'from'
            } else if (!isImportA && isImportB) {
                return 1; // 'from' comes after 'import'
            } else {
                // Keep the original order for 'import' or 'from'
                return 0;
            }
        });
    }

    const nonEmptyArrays = sortedArrays.filter(array => array.length > 0);
    let sortedImports = nonEmptyArrays.map(array => array.join('\n')).join('\n\n');

    if (sortedImports.endsWith('\n')) {
        sortedImports = sortedImports.slice(0, -1);
    }

    return sortedImports;
}

function getCategoryIndex(importStatement: string, categories: string[]): number {
    const lowerImport = importStatement.toLowerCase();
    for (let i = 0; i < categories.length; i++) {
        if (typeof categories[i] === 'string') {
            if (lowerImport.includes(categories[i].toLowerCase())) {
                return i + 1;
            }
        } else {
            for (let categorie of categories[i]) {
                if (lowerImport.includes(categorie.toLowerCase())) {
                    return i + 1;
                }
            }
        }
    }
    return 0; // Default position if not found in any category
}
// This method is called when your extension is deactivated
export function deactivate() {}
