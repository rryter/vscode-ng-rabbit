import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function inlineTemplate() {
    let editor = <vscode.TextEditor>vscode.window.activeTextEditor;
    const tsFile = path.parse(editor.document.fileName).name + '.ts';
    fs.exists(tsFile, exist => {
        if (exist) {
            console.log('I got your file');
        } else {
            vscode.window.showErrorMessage(
                'ng-rabbit: Could not find corresponding Typescript file.'
            );
        }
    });
}
