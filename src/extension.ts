import * as vscode from 'vscode';
import { ClassBuilderProvider } from './providers/ClassBuilderProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('🏗️ Albertool Class Builder ativado!');

    const provider = new ClassBuilderProvider();

    const buildCmd = vscode.commands.registerCommand('albertool-class-builder.build', () => {
        provider.build();
    });

    context.subscriptions.push(buildCmd);
    vscode.window.showInformationMessage('🏗️ Albertool Class Builder ativado! Use Alt+Insert para PHP.');
}

export function deactivate() {}