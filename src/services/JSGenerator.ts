import * as vscode from 'vscode';
import { GeneratorOptions } from '../types';

export class JSGenerator {
    generate(options: GeneratorOptions): string {
        const { className, properties, generateConstructor, generateGetters, generateSetters, generateInterface } = options;

        // JS não tem interface nativa
        if (generateInterface) {
            vscode.window.showWarningMessage(
                '⚠️ JavaScript não suporta interfaces nativamente. Use TypeScript para isso.'
            );
        }

        let code = `class ${className} {\n`;

        // Campos declarados no topo
        for (const prop of properties) {
            code += `    ${prop.name};\n`;
        }
        code += '\n';

        // Construtor vazio — para frameworks de reflexão
        if (generateConstructor === 'empty' || generateConstructor === 'both') {
            code += `    /**\n`;
            code += `     * Construtor padrão para reflexão.\n`;
            code += `     * Usado por frameworks que instanciam a classe antes de popular os campos.\n`;
            code += `     */\n`;
            code += `    constructor() {}\n\n`;
        }

        // Construtor completo — inicializa todos os campos
        if (generateConstructor === 'full' || generateConstructor === 'both') {
            code += `    /**\n`;
            code += `     * Construtor completo.\n`;
            code += `     * Use para criar instâncias com todos os campos já preenchidos.\n`;
            code += `     */\n`;
            const params = properties.map(p => `${p.name} = undefined`);
            code += `    constructor(${params.join(', ')}) {\n`;
            for (const prop of properties) {
                code += `        this.${prop.name} = ${prop.name};\n`;
            }
            code += `    }\n\n`;
        }

        if (generateGetters) {
            for (const prop of properties) {
                code += `    get${capitalize(prop.name)}() {\n`;
                code += `        return this.${prop.name};\n`;
                code += `    }\n\n`;
            }
        }

        if (generateSetters) {
            for (const prop of properties) {
                code += `    set${capitalize(prop.name)}(value) {\n`;
                code += `        this.${prop.name} = value;\n`;
                code += `    }\n\n`;
            }
        }

        code += `}\n`;
        return code;
    }
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}