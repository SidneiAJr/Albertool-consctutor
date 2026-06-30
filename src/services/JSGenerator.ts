import * as vscode from 'vscode';
import { GeneratorOptions } from '../types';

export class JSGenerator {
    generate(options: GeneratorOptions): string {
        const { className, properties, generateConstructor, generateGetters, generateSetters, generateInterface } = options;

        if (generateInterface) {
            vscode.window.showWarningMessage(
                '⚠️ JavaScript não suporta interfaces nativamente. Use TypeScript para isso.'
            );
        }

        const validProperties = properties.filter(p =>
            p.name && p.name.length > 1 && !p.name.startsWith('_')
        );

        let code = `class ${className} {\n`;

        for (const prop of validProperties) {
            code += `    ${prop.name};\n`;
        }
        code += '\n';

        // Construtor vazio
        if (generateConstructor === 'empty') {
            code += `    /**\n`;
            code += `     * Construtor padrão para reflexão.\n`;
            code += `     */\n`;
            code += `    constructor() {}\n\n`;
        }

        // Construtor completo
        if (generateConstructor === 'full') {
            const params = validProperties.map(p => `${p.name} = undefined`).join(', ');
            code += `    /**\n`;
            code += `     * Construtor completo.\n`;
            code += `     */\n`;
            code += `    constructor(${params}) {\n`;
            for (const prop of validProperties) {
                code += `        this.${prop.name} = ${prop.name};\n`;
            }
            code += `    }\n\n`;
        }

        // Ambos — JS não tem overload, usa params opcionais com undefined
        if (generateConstructor === 'both') {
            const params = validProperties.map(p => `${p.name} = undefined`).join(', ');
            code += `    /**\n`;
            code += `     * Construtor unificado (vazio ou completo via params opcionais).\n`;
            code += `     * JS não suporta sobrecarga — use sem args para construtor vazio.\n`;
            code += `     */\n`;
            code += `    constructor(${params}) {\n`;
            for (const prop of validProperties) {
                code += `        if (${prop.name} !== undefined) this.${prop.name} = ${prop.name};\n`;
            }
            code += `    }\n\n`;
        }

        if (generateGetters) {
            for (const prop of validProperties) {
                code += `    get${capitalize(prop.name)}() {\n`;
                code += `        return this.${prop.name};\n`;
                code += `    }\n\n`;
            }
        }

        if (generateSetters) {
            for (const prop of validProperties) {
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