import * as vscode from 'vscode';
import * as childProcess from 'child_process';

const fs = require('fs');
const fsPromises = fs.promises;

export function ngRabbit() {
    // The code you place here will be executed every time your command is executed
    let editor = <vscode.TextEditor>vscode.window.activeTextEditor;
    var selection = editor.selection;
    let content = editor.document.getText(selection);

    let selectedFolder: vscode.Uri[];

    if (!content) {
        vscode.window.showErrorMessage(
            'Please select some HTML before using vscode-ng-rabbit.'
        );

        return false;
    }

    // Display a message box to the user
    vscode.window
        .showOpenDialog({
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
                    prompt: 'Component Name',
                    placeHolder: 'component-name'
                });
            }
        )
        .then(componentName => {
            if (vscode.workspace.rootPath) {
                const result = childProcess.exec(
                    `ng g component ${componentName}`,
                    {
                        cwd: selectedFolder[0].fsPath
                    }
                );

                result.stdout.on('data', function(data) {
                    console.log('stdout: ' + data);

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
                                `Component ${componentName} successfully created.`
                            );
                        });
                });
            }
        });
}
