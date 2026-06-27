export interface Property {
    name: string;
    type: string;
    isNullable?: boolean;
    isPrivate?: boolean;
    defaultValue?: string;
}

export interface ClassInfo {
    name: string;
    properties: Property[];
    extends?: string;
    implements?: string[];
}

export interface GeneratorOptions {
    className: string;
    properties: Property[];
    generateConstructor: 'none' | 'empty' | 'full' | 'both';
    generateGetters: boolean;
    generateSetters: boolean;
    generateToString: boolean;
    generateInterface: boolean;
    generateRepository: boolean;
}