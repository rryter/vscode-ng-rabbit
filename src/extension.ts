// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as childProcess from 'child_process';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log(
        'Congratulations, your extension "vscode-ng-rabbit" is now active!'
    );

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand(
        'extension.ngRabbitCreateComponent',
        () => {
            // The code you place here will be executed every time your command is executed
            let editor = <vscode.TextEditor>vscode.window.activeTextEditor;
            var selection = editor.selection;
            let content = editor.document.getText(selection);

            if (!content) {
                vscode.window.showErrorMessage(
                    'Please select some HTML before using ngRabbit.'
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
                .then(fileUri => {
                    if (!(fileUri && fileUri[0])) {
                        vscode.window.showErrorMessage(
                            'Please select a folder.'
                        );
                        return false;
                    }

                    vscode.window
                        .showInputBox({
                            prompt: 'Component Name',
                            placeHolder: 'component-name'
                        })
                        .then(componentName => {
                            if (vscode.workspace.rootPath) {
                                const result = childProcess.exec(
                                    `ng g component ${componentName}`,
                                    {
                                        cwd: fileUri[0].fsPath
                                    }
                                );

                                result.stdout.on('data', function(data) {
                                    console.log('stdout: ' + data);

                                    const fs = require('fs');
                                    const path = `${
                                        fileUri[0].fsPath
                                    }/${componentName}/${componentName}.component.html`;

                                    fs.writeFile(path, content, function(
                                        err: Error
                                    ) {
                                        if (err) {
                                            return console.log(err);
                                        }

                                        editor
                                            .edit(function(builder) {
                                                builder.replace(
                                                    selection,
                                                    `<app-${componentName}></app-${componentName}>`
                                                );
                                            })
                                            .then(() => {
                                                editor.document
                                                    .save()
                                                    .then(() => {
                                                        vscode.workspace
                                                            .openTextDocument(
                                                                path
                                                            )
                                                            .then(doc => {
                                                                vscode.window.showTextDocument(
                                                                    doc
                                                                );
                                                            });
                                                    });
                                            });

                                        vscode.window.showInformationMessage(
                                            `Component ${componentName} successfully created.`
                                        );
                                    });
                                });
                            }
                        });
                });
        }
    );

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
