import { Property, GeneratorOptions } from '../types';

export class PhpGenerator {
    generate(options: GeneratorOptions): string {
        const { className, properties, generateConstructor, generateGetters, generateSetters, generateInterface } = options;

        const typedProperties = properties.map(prop => ({
            ...prop,
            type: this.inferirTipo(prop.name)
        }));

        let code = `class ${className} {\n`;

        for (const prop of typedProperties) {
            const type = this.mapType(prop.type);
            code += `    private ${type} $${prop.name};\n`;
        }
        code += '\n';

        // Construtor vazio — para frameworks de reflexão (Doctrine, Laravel Eloquent, etc.)
        if (generateConstructor === 'empty' || generateConstructor === 'both') {
            code += `    /**\n`;
            code += `     * Construtor padrão para reflexão.\n`;
            code += `     * Usado pelo Doctrine e outros ORMs para instanciar a entidade.\n`;
            code += `     */\n`;
            code += `    public function __construct() {}\n\n`;
        }

        // Construtor completo — inicializa todos os campos
        if (generateConstructor === 'full' || generateConstructor === 'both') {
            code += `    /**\n`;
            code += `     * Construtor completo.\n`;
            code += `     * Use para criar instâncias com todos os campos já preenchidos.\n`;
            code += `     */\n`;
            const params = typedProperties.map(p => `${this.mapType(p.type)} $${p.name}`);
            code += `    public function __construct(${params.join(', ')}) {\n`;
            for (const prop of typedProperties) {
                code += `        $this->${prop.name} = $${prop.name};\n`;
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

        if (generateInterface) {
            const interfaceCode = this.generateInterface(className, typedProperties);
            code = interfaceCode + '\n' + code;
        }

        code += `}\n`;
        return code;
    }

    private generateInterface(className: string, properties: Property[]): string {
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
        if (nome.includes('id'))                         return 'int';
        if (nome.includes('nome') || nome.includes('name'))    return 'string';
        if (nome.includes('email'))                      return 'string';
        if (nome.includes('senha') || nome.includes('password')) return 'string';
        if (nome.includes('ativo') || nome.includes('active'))  return 'bool';
        if (nome.includes('preco') || nome.includes('price'))   return 'float';
        if (nome.includes('data') || nome.includes('date'))     return 'string';
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