import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as path from 'path';

const fs = require('fs');
const fsPromises = fs.promises;

export function extractComponent() {
    // The code you place here will be executed every time your command is executed
    let editor = <vscode.TextEditor>vscode.window.activeTextEditor;
    var selection = editor.selection;
    let content = editor.document.getText(selection);

    let currentFolderPath = path.dirname(editor.document.uri.path)
    let selectedFolder: vscode.Uri[];

    if (!content) {
        vscode.window.showErrorMessage(
            'ng-rabbit: Please select some HTML before performing the refactoring.'
        );

        return false;
    }

    vscode.window
        .showOpenDialog({
            defaultUri: vscode.Uri.file(currentFolderPath),
            openLabel: 'Select folder',
            canSelectFiles: false,
            canSelectFolders: true
        })
        .then(
            (fileUri): any => {
                if (!(fileUri && fileUri[0])) {
                    vscode.window.showErrorMessage('Please select a folder.');
                    return false;
                }

                selectedFolder = fileUri;
                return vscode.window.showInputBox({
                    prompt: 'Select the home of your new component',
                    placeHolder: 'component-name'
                });
            }
        )
        .then((componentName: string) => {
            const result = childProcess.exec(
                `ng g component ${componentName}`,
                {
                    cwd: selectedFolder[0].fsPath
                }
            );

            result.stdout.on('data', function(data) {
                const path = `${
                    selectedFolder[0].fsPath
                }/${componentName}/${componentName}.component.html`;

                fsPromises
                    .writeFile(path, content)
                    .then(() => {
                        return editor.edit(function(builder) {
                            builder.replace(
                                selection,
                                `<app-${componentName}></app-${componentName}>`
                            );
                        });
                    })
                    .then(editor.document.save)
                    .then(() => {
                        return vscode.workspace.openTextDocument(path);
                    })
                    .then((doc: vscode.TextDocument) => {
                        return vscode.window.showTextDocument(doc);
                    })
                    .then(() => {
                        vscode.window.showInformationMessage(
                            `ng-rabbit: Component ${componentName} successfully created.`
                        );
                    });
            });
        });
}
