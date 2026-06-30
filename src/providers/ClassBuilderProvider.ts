import * as vscode from 'vscode';
import { ClassInfo, Property, GeneratorOptions } from '../types';
import { PhpGenerator } from '../services/PhpGenerator';
import { TSGenerator } from '../services/TSGenerator';
import { JSGenerator } from '../services/JSGenerator';
import { CsharpGenerator } from '../services/CsharpGenerator';
import { PYGenerator } from '../services/PYGenerator';

export class ClassBuilderProvider {
    private generators = {
        php:        new PhpGenerator(),
        typescript: new TSGenerator(),
        javascript: new JSGenerator(),
        csharp:     new CsharpGenerator(),
        python:     new PYGenerator()
    };

    async build(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Nenhum arquivo aberto!');
            return;
        }

        const document = editor.document;
        const fileName = document.fileName;
        const language = this.detectLanguage(fileName);

        if (!language || !this.generators[language as keyof typeof this.generators]) {
            vscode.window.showErrorMessage(`Linguagem não suportada: ${language}`);
            return;
        }

        const text = document.getText();
        const classInfo = this.extractClassInfo(text, language);

        if (!classInfo) {
            vscode.window.showErrorMessage('Nenhuma classe encontrada!');
            return;
        }

        if (classInfo.properties.length === 0) {
            vscode.window.showWarningMessage(
                '⚠️ Nenhuma propriedade encontrada. Declare os campos na classe antes de gerar.'
            );
            return;
        }

        const options = await this.showOptions(classInfo);
        if (!options) return;

        const generator = this.generators[language as keyof typeof this.generators];
        const code = generator.generate(options);
        if (!code) return;

        await this.replaceClass(editor, text, classInfo, code);
    }

    private detectLanguage(fileName: string): string | null {
        const ext = fileName.split('.').pop();
        switch (ext) {
            case 'php': return 'php';
            case 'ts':  return 'typescript';
            case 'js':  return 'javascript';
            case 'cs':  return 'csharp';
            case 'py':  return 'python';
            default:    return null;
        }
    }

    private extractClassInfo(text: string, language: string): ClassInfo | null {
        let regex: RegExp;
        switch (language) {
            case 'php':
                regex = /class\s+(\w+)\s*\{([\s\S]*?)\n\}/;
                break;
            case 'typescript':
            case 'javascript':
                regex = /(?:export\s+)?(?:abstract\s+)?class\s+(\w+)\s*\{([\s\S]*?)\n\}/;
                break;
            case 'csharp':
                regex = /(?:public|private|protected|internal)?\s*(?:abstract\s+)?class\s+(\w+)\s*\{([\s\S]*?)\n\}/;
                break;
            case 'python':
                regex = /class\s+(\w+)\s*:([\s\S]*?)(?=\n\S|$)/;
                break;
            default:
                return null;
        }

        const match = text.match(regex);
        if (!match) return null;

        const className = match[1];
        const body = match[2] || '';
        const properties = this.extractProperties(body, language);
        return { name: className, properties };
    }

    private extractProperties(body: string, language: string): Property[] {
        const properties: Property[] = [];

        switch (language) {
            case 'typescript': {
                const tsRegex = /(?:private|public|protected|readonly)(?:\s+(?:private|public|protected|readonly))*\s+(\w+)\s*[?!]?\s*:\s*([\w<>[\]|]+)/g;
                let match;
                while ((match = tsRegex.exec(body)) !== null) {
                    const name = match[1];
                    const type = match[2];
                    if (this.isInvalidPropertyName(name)) continue;
                    properties.push({ name, type, isPrivate: true, isNullable: false });
                }
                break;
            }

            case 'javascript': {
                const jsRegex = /^\s{2,4}#?(\w+)\s*[=;]/gm;
                let match;
                while ((match = jsRegex.exec(body)) !== null) {
                    const name = match[1];
                    if (this.isInvalidPropertyName(name)) continue;
                    properties.push({ name, type: 'any', isPrivate: false, isNullable: false });
                }
                break;
            }

            case 'php': {
                const phpRegex = /\$(\w+)/g;
                let match;
                while ((match = phpRegex.exec(body)) !== null) {
                    const name = match[1];
                    const line = body.substring(
                        body.lastIndexOf('\n', match.index),
                        body.indexOf('\n', match.index)
                    );
                    let type = 'mixed';
                    if (line.includes('int'))         type = 'int';
                    else if (line.includes('string')) type = 'string';
                    else if (line.includes('bool'))   type = 'bool';
                    else if (line.includes('float'))  type = 'float';
                    else if (line.includes('array'))  type = 'array';

                    if (this.isInvalidPropertyName(name)) continue;
                    properties.push({ name, type, isPrivate: true, isNullable: false });
                }
                break;
            }

            case 'csharp': {
                const csRegex = /private\s+(\w+)\s+(\w+)/g;
                let match;
                while ((match = csRegex.exec(body)) !== null) {
                    const type = match[1];
                    const name = match[2];
                    if (this.isInvalidPropertyName(name)) continue;
                    properties.push({ name, type, isPrivate: true, isNullable: false });
                }
                break;
            }

            case 'python': {
                const pyRegex = /self\._?(\w+)\s*[:=]\s*(\w+)/g;
                let match;
                while ((match = pyRegex.exec(body)) !== null) {
                    const name = match[1];
                    const type = match[2] || 'any';
                    if (this.isInvalidPropertyName(name)) continue;
                    properties.push({ name, type, isPrivate: true, isNullable: false });
                }
                break;
            }
        }

        return properties;
    }

    private isInvalidPropertyName(name: string): boolean {
        const RESERVED = new Set([
            'private', 'public', 'protected', 'readonly', 'static', 'abstract',
            'constructor', 'get', 'set', 'return', 'new', 'this', 'super',
            'class', 'extends', 'implements', 'interface', 'type', 'enum',
            'import', 'export', 'from', 'const', 'let', 'var', 'function',
            'number', 'string', 'boolean', 'any', 'void', 'null', 'undefined',
            'never', 'object', 'symbol', 'bigint',
            'numbe', 'strin', 'boolea',
        ]);
        return !name || name.length <= 1 || name.startsWith('_') || RESERVED.has(name);
    }

    private async showOptions(classInfo: ClassInfo): Promise<GeneratorOptions | null> {
        const items = [
            { label: '🏗️ Construtor vazio',    description: 'Para reflexão (TypeORM, Doctrine, EF...)', value: 'constructor-empty' },
            { label: '🏗️ Construtor completo', description: 'Inicializa todos os campos',               value: 'constructor-full' },
            { label: '🔧 Getters',              description: '',                                          value: 'getters' },
            { label: '🔧 Setters',              description: '',                                          value: 'setters' },
            { label: '📦 Interface',            description: '',                                          value: 'interface' },
        ];

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Selecione o que deseja gerar',
            canPickMany: true
        });

        if (!selected || selected.length === 0) return null;

        const wantsEmpty = selected.some(s => s.value === 'constructor-empty');
        const wantsFull  = selected.some(s => s.value === 'constructor-full');

        return {
            className:          classInfo.name,
            properties:         classInfo.properties,
            generateConstructor: wantsEmpty && wantsFull ? 'both'
                               : wantsEmpty              ? 'empty'
                               : wantsFull               ? 'full'
                               : 'none',
            generateGetters:    selected.some(s => s.value === 'getters'),
            generateSetters:    selected.some(s => s.value === 'setters'),
            generateInterface:  selected.some(s => s.value === 'interface'),
            generateToString:   false,
            generateRepository: false
        };
    }

    private async replaceClass(
        editor: vscode.TextEditor,
        text: string,
        classInfo: ClassInfo,
        newCode: string
    ): Promise<void> {
        // ← export\s+ adicionado — captura tanto class quanto export class
        const regex = new RegExp(
            `(?:export\\s+)?(?:(?:public|private|protected|internal)\\s+)*(?:abstract\\s+)?class\\s+${classInfo.name}\\s*\\{([\\s\\S]*?)\\n\\}`,
            'g'
        );
        const match = regex.exec(text);

        if (!match) {
            await this.insertAtEnd(editor, text, newCode);
            return;
        }

        const startPos = match.index;
        const endPos   = startPos + match[0].length;
        const start    = editor.document.positionAt(startPos);
        const end      = editor.document.positionAt(endPos);

        await editor.edit(editBuilder => {
            editBuilder.replace(new vscode.Range(start, end), newCode);
        });
    }

    private async insertAtEnd(editor: vscode.TextEditor, text: string, code: string): Promise<void> {
        const position = new vscode.Position(text.split('\n').length, 0);
        await editor.edit(editBuilder => {
            editBuilder.insert(position, '\n' + code);
        });
    }
}