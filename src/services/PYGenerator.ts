import { Property, GeneratorOptions } from '../types';

export class PYGenerator {
    generate(options: GeneratorOptions): string {
        const { className, properties, generateConstructor, generateGetters, generateSetters, generateInterface } = options;

        let code = '';

        // Interface simulada com ABC
        if (generateInterface) {
            code += `from abc import ABC, abstractmethod\n\n`;
            code += `class I${className}(ABC):\n`;
            for (const prop of properties) {
                const type = this.inferirTipo(prop.name);
                code += `    @abstractmethod\n`;
                code += `    def get${capitalize(prop.name)}(self) -> ${type}: pass\n`;
                code += `    @abstractmethod\n`;
                code += `    def set${capitalize(prop.name)}(self, value: ${type}) -> None: pass\n`;
            }
            code += `\n`;
        }

        code += `class ${className}`;
        if (generateInterface) {
            code += `(I${className})`;
        }
        code += `:\n`;

        // Construtor vazio — para frameworks de reflexão (SQLAlchemy, Django ORM, etc.)
        if (generateConstructor === 'empty' || generateConstructor === 'both') {
            code += `    # Construtor padrão para reflexão.\n`;
            code += `    # Usado pelo SQLAlchemy e outros ORMs para instanciar a entidade.\n`;
            code += `    def __init__(self):\n`;
            for (const prop of properties) {
                code += `        self._${prop.name} = None\n`;
            }
            code += '\n';
        }

        // Construtor completo — inicializa todos os campos
        if (generateConstructor === 'full' || generateConstructor === 'both') {
            if (generateConstructor === 'both') {
                code += `    # Construtor completo.\n`;
                code += `    # Use para criar instâncias com todos os campos já preenchidos.\n`;
                // Python não suporta dois __init__ — usa @classmethod como factory
                code += `    @classmethod\n`;
                const params = properties.map(p => `${p.name}: ${this.inferirTipo(p.name)}`);
                code += `    def create(cls, ${params.join(', ')}) -> '${className}':\n`;
                code += `        instance = cls()\n`;
                for (const prop of properties) {
                    code += `        instance._${prop.name} = ${prop.name}\n`;
                }
                code += `        return instance\n\n`;
            } else {
                code += `    # Construtor completo.\n`;
                code += `    # Use para criar instâncias com todos os campos já preenchidos.\n`;
                const params = properties.map(p => `${p.name}: ${this.inferirTipo(p.name)}`);
                code += `    def __init__(self, ${params.join(', ')}):\n`;
                for (const prop of properties) {
                    code += `        self._${prop.name} = ${prop.name}\n`;
                }
                code += '\n';
            }
        }

        if (generateGetters) {
            for (const prop of properties) {
                const type = this.inferirTipo(prop.name);
                code += `    @property\n`;
                code += `    def ${prop.name}(self) -> ${type}:\n`;
                code += `        return self._${prop.name}\n\n`;
            }
        }

        if (generateSetters) {
            for (const prop of properties) {
                const type = this.inferirTipo(prop.name);
                code += `    @${prop.name}.setter\n`;
                code += `    def ${prop.name}(self, value: ${type}) -> None:\n`;
                code += `        self._${prop.name} = value\n\n`;
            }
        }

        return code;
    }

    private inferirTipo(name: string): string {
        if (name.toLowerCase().includes('id'))       return 'int';
        if (name.toLowerCase().includes('nome'))     return 'str';
        if (name.toLowerCase().includes('name'))     return 'str';
        if (name.toLowerCase().includes('email'))    return 'str';
        if (name.toLowerCase().includes('senha'))    return 'str';
        if (name.toLowerCase().includes('password')) return 'str';
        if (name.toLowerCase().includes('ativo'))    return 'bool';
        if (name.toLowerCase().includes('active'))   return 'bool';
        if (name.toLowerCase().includes('preco'))    return 'float';
        if (name.toLowerCase().includes('price'))    return 'float';
        return 'Any';
    }
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}