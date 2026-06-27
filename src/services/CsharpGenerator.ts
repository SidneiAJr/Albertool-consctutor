import { Property, GeneratorOptions } from '../types';

export class CsharpGenerator {
    generate(options: GeneratorOptions): string {
        const { className, properties, generateConstructor, generateGetters, generateSetters, generateInterface } = options;

        let code = `public class ${className} {\n`;

        for (const prop of properties) {
            const type = this.inferirTipo(prop.name);
            code += `    private ${type} _${prop.name};\n`;
        }
        code += '\n';

        // Construtor vazio — para frameworks de reflexão (Entity Framework, etc.)
        if (generateConstructor === 'empty' || generateConstructor === 'both') {
            code += `    /// <summary>\n`;
            code += `    /// Construtor padrão para reflexão.\n`;
            code += `    /// Usado pelo Entity Framework e outros ORMs para instanciar a entidade.\n`;
            code += `    /// </summary>\n`;
            code += `    public ${className}() {}\n\n`;
        }

        // Construtor completo — inicializa todos os campos
        if (generateConstructor === 'full' || generateConstructor === 'both') {
            code += `    /// <summary>\n`;
            code += `    /// Construtor completo.\n`;
            code += `    /// Use para criar instâncias com todos os campos já preenchidos.\n`;
            code += `    /// </summary>\n`;
            const params = properties.map(p => `${this.inferirTipo(p.name)} ${p.name}`);
            code += `    public ${className}(${params.join(', ')}) {\n`;
            for (const prop of properties) {
                code += `        _${prop.name} = ${prop.name};\n`;
            }
            code += `    }\n\n`;
        }

        if (generateGetters) {
            for (const prop of properties) {
                const type = this.inferirTipo(prop.name);
                code += `    public ${type} Get${capitalize(prop.name)}() {\n`;
                code += `        return _${prop.name};\n`;
                code += `    }\n\n`;
            }
        }

        if (generateSetters) {
            for (const prop of properties) {
                const type = this.inferirTipo(prop.name);
                code += `    public void Set${capitalize(prop.name)}(${type} value) {\n`;
                code += `        _${prop.name} = value;\n`;
                code += `    }\n\n`;
            }
        }

        if (generateInterface) {
            const interfaceCode = this.generateInterface(className, properties);
            code = interfaceCode + '\n' + code;
        }

        code += `}\n`;
        return code;
    }

    private generateInterface(className: string, properties: Property[]): string {
        let code = `public interface I${className} {\n`;
        for (const prop of properties) {
            const type = this.inferirTipo(prop.name);
            code += `    ${type} Get${capitalize(prop.name)}();\n`;
            code += `    void Set${capitalize(prop.name)}(${type} value);\n`;
        }
        code += `}\n`;
        return code;
    }

    private inferirTipo(name: string): string {
        if (name.toLowerCase().includes('id'))       return 'int';
        if (name.toLowerCase().includes('nome'))     return 'string';
        if (name.toLowerCase().includes('name'))     return 'string';
        if (name.toLowerCase().includes('email'))    return 'string';
        if (name.toLowerCase().includes('senha'))    return 'string';
        if (name.toLowerCase().includes('password')) return 'string';
        if (name.toLowerCase().includes('ativo'))    return 'bool';
        if (name.toLowerCase().includes('active'))   return 'bool';
        if (name.toLowerCase().includes('preco'))    return 'double';
        if (name.toLowerCase().includes('price'))    return 'double';
        if (name.toLowerCase().includes('data'))     return 'DateTime';
        if (name.toLowerCase().includes('date'))     return 'DateTime';
        return 'object';
    }
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}