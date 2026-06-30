import { Property, GeneratorOptions } from '../types';

export class PhpGenerator {
    generate(options: GeneratorOptions): string {
        const { className, properties, generateConstructor, generateGetters, generateSetters, generateInterface } = options;

        const typedProperties = properties.map(prop => ({
            ...prop,
            type: this.inferirTipo(prop.name)
        }));

        let code = `<?php\n\nclass ${className} {\n`;

        for (const prop of typedProperties) {
            const type = this.mapType(prop.type);
            code += `    private ${type} $${prop.name};\n`;
        }
        code += '\n';

        // Construtor vazio
        if (generateConstructor === 'empty') {
            code += `    /**\n`;
            code += `     * Construtor padrão para reflexão.\n`;
            code += `     * Usado pelo Doctrine e outros ORMs para instanciar a entidade.\n`;
            code += `     */\n`;
            code += `    public function __construct() {}\n\n`;
        }

        // Construtor completo
        if (generateConstructor === 'full') {
            const params = typedProperties
                .map(p => `${this.mapType(p.type)} $${p.name}`)
                .join(', ');
            code += `    /**\n`;
            code += `     * Construtor completo.\n`;
            code += `     */\n`;
            code += `    public function __construct(${params}) {\n`;
            for (const prop of typedProperties) {
                code += `        $this->${prop.name} = $${prop.name};\n`;
            }
            code += `    }\n\n`;
        }

        // Ambos — PHP não suporta overload, usa params com null default
        if (generateConstructor === 'both') {
            const params = typedProperties
                .map(p => `?${this.mapType(p.type)} $${p.name} = null`)
                .join(', ');
            code += `    /**\n`;
            code += `     * Construtor unificado (vazio ou completo via params opcionais).\n`;
            code += `     * PHP não suporta sobrecarga — use sem args para construtor vazio.\n`;
            code += `     */\n`;
            code += `    public function __construct(${params}) {\n`;
            for (const prop of typedProperties) {
                code += `        if ($${prop.name} !== null) $this->${prop.name} = $${prop.name};\n`;
            }
            code += `    }\n\n`;
        }

        if (generateGetters) {
            for (const prop of typedProperties) {
                const type = this.mapType(prop.type);
                code += `    public function get${capitalize(prop.name)}(): ${type} {\n`;
                code += `        return $this->${prop.name};\n`;
                code += `    }\n\n`;
            }
        }

        if (generateSetters) {
            for (const prop of typedProperties) {
                const type = this.mapType(prop.type);
                code += `    public function set${capitalize(prop.name)}(${type} $${prop.name}): void {\n`;
                code += `        $this->${prop.name} = $${prop.name};\n`;
                code += `    }\n\n`;
            }
        }

        code += `}\n`;

        // Interface no final — evita duplicar <?php
        if (generateInterface) {
            code += '\n' + this.generateInterface(className, typedProperties);
        }

        return code;
    }

    private generateInterface(className: string, properties: any[]): string {
        let code = `interface ${className}Interface {\n`;
        for (const prop of properties) {
            const type = this.mapType(prop.type);
            code += `    public function get${capitalize(prop.name)}(): ${type};\n`;
            code += `    public function set${capitalize(prop.name)}(${type} $${prop.name}): void;\n`;
        }
        code += `}\n`;
        return code;
    }

    private inferirTipo(nome: string): string {
        if (nome.includes('id'))                               return 'int';
        if (nome.includes('nome') || nome.includes('name'))   return 'string';
        if (nome.includes('email'))                           return 'string';
        if (nome.includes('senha') || nome.includes('password')) return 'string';
        if (nome.includes('ativo') || nome.includes('active')) return 'bool';
        if (nome.includes('preco') || nome.includes('price')) return 'float';
        if (nome.includes('data') || nome.includes('date'))   return 'string';
        return 'mixed';
    }

    private mapType(type: string): string {
        const types: { [key: string]: string } = {
            'int': 'int', 'string': 'string', 'bool': 'bool',
            'float': 'float', 'array': 'array', 'object': 'object',
            'mixed': 'mixed', 'any': 'mixed', 'number': 'int',
            'null': 'null', 'void': 'void', 'undefined': 'null'
        };
        return types[type] || 'mixed';
    }
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}