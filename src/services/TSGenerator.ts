import { Property, GeneratorOptions } from '../types';

export class TSGenerator {
    generate(options: GeneratorOptions): string {
        const { className, properties, generateConstructor, generateGetters, generateSetters, generateInterface } = options;

        const validProperties = this.filterProperties(properties);

        let code = `export class ${className} {\n`;

        for (const prop of validProperties) {
            const type = this.inferirTipo(prop.name);
            code += `    private ${prop.name}: ${type};\n`;
        }
        code += '\n';

        // Construtor vazio — para frameworks de reflexão (TypeORM, etc.)
        if (generateConstructor === 'empty' || generateConstructor === 'both') {
            code += `    /**\n`;
            code += `     * Construtor padrão para reflexão.\n`;
            code += `     * Usado pelo TypeORM e outros frameworks para instanciar a entidade.\n`;
            code += `     */\n`;
            code += `    constructor() {}\n\n`;
        }

        // Construtor completo — inicializa todos os campos
        if (generateConstructor === 'full' || generateConstructor === 'both') {
            code += `    /**\n`;
            code += `     * Construtor completo.\n`;
            code += `     * Use para criar instâncias com todos os campos já preenchidos.\n`;
            code += `     */\n`;

            // TS não suporta dois construtores — usa overload com params opcionais
            const params = validProperties.map(p => `${p.name}?: ${this.inferirTipo(p.name)}`);
            code += `    constructor(${params.join(', ')});\n`;
            code += `    constructor(${validProperties.map(p => `${p.name}?: ${this.inferirTipo(p.name)}`).join(', ')}) {\n`;
            for (const prop of validProperties) {
                code += `        if (${prop.name} !== undefined) this.${prop.name} = ${prop.name};\n`;
            }
            code += `    }\n\n`;
        }

        if (generateGetters) {
            for (const prop of validProperties) {
                const type = this.inferirTipo(prop.name);
                code += `    get${capitalize(prop.name)}(): ${type} {\n`;
                code += `        return this.${prop.name};\n`;
                code += `    }\n\n`;
            }
        }

        if (generateSetters) {
            for (const prop of validProperties) {
                const type = this.inferirTipo(prop.name);
                code += `    set${capitalize(prop.name)}(value: ${type}): void {\n`;
                code += `        this.${prop.name} = value;\n`;
                code += `    }\n\n`;
            }
        }

        if (generateInterface) {
            const interfaceCode = this.generateInterface(className, validProperties);
            code = interfaceCode + '\n' + code;
        }

        code += `}\n`;
        return code;
    }

    private filterProperties(properties: Property[]): Property[] {
        const INVALID_NAMES = new Set([
            'private', 'public', 'protected', 'readonly', 'static', 'abstract',
            'constructor', 'get', 'set', 'return', 'class', 'extends', 'implements',
            'number', 'string', 'boolean', 'any', 'void', 'null', 'undefined', 'never',
            'object', 'symbol', 'bigint',
            'numbe', 'strin', 'boolea',
        ]);
        return properties.filter(p =>
            p.name &&
            p.name.length > 1 &&
            !INVALID_NAMES.has(p.name) &&
            !p.name.startsWith('_')
        );
    }

    private generateInterface(className: string, properties: Property[]): string {
        let code = `export interface I${className} {\n`;
        for (const prop of properties) {
            const type = this.inferirTipo(prop.name);
            code += `    ${prop.name}: ${type};\n`;
        }
        code += `}\n`;
        return code;
    }

    private inferirTipo(name: string): string {
        if (name.toLowerCase().includes('id'))       return 'number';
        if (name.toLowerCase().includes('nome'))     return 'string';
        if (name.toLowerCase().includes('name'))     return 'string';
        if (name.toLowerCase().includes('email'))    return 'string';
        if (name.toLowerCase().includes('senha'))    return 'string';
        if (name.toLowerCase().includes('password')) return 'string';
        if (name.toLowerCase().includes('ativo'))    return 'boolean';
        if (name.toLowerCase().includes('active'))   return 'boolean';
        if (name.toLowerCase().includes('preco'))    return 'number';
        if (name.toLowerCase().includes('price'))    return 'number';
        if (name.toLowerCase().includes('data'))     return 'Date';
        if (name.toLowerCase().includes('date'))     return 'Date';
        return 'any';
    }
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}