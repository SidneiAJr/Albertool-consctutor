# Albertool Constructor

Gera construtores, getters, setters e interfaces direto no VSCode — sem digitar na raça.

Inspirado no fluxo do NetBeans/IntelliJ: você declara os campos, a extensão faz o resto.

---

## Linguagens suportadas

| Linguagem | Extensão |
|---|---|
| TypeScript | `.ts` |
| JavaScript | `.js` |
| PHP | `.php` |
| C# | `.cs` |
| Python | `.py` |

---

## Como usar

1. Abra um arquivo com uma classe que já tenha os campos declarados
2. Rode o comando `Albertool: Build Class` (`Ctrl+Shift+P` → buscar por "Albertool")
3. Selecione o que deseja gerar e confirme

```
🏗️ Construtor vazio      → para reflexão (TypeORM, Doctrine, EF, SQLAlchemy...)
🏗️ Construtor completo   → inicializa todos os campos
🔧 Getters
🔧 Setters
📦 Interface
```

---

## Exemplo

**Entrada — declare os campos antes de rodar:**

```typescript
export class User {
    private id: number;
    private nome: string;
    private email: string;
    private ativo: boolean;
}
```

**Saída — selecione tudo:**

```typescript
export interface IUser {
    id: number;
    nome: string;
    email: string;
    ativo: boolean;
}

export class User {
    private id: number;
    private nome: string;
    private email: string;
    private ativo: boolean;

    /**
     * Construtor padrão para reflexão.
     * Usado pelo TypeORM e outros frameworks para instanciar a entidade.
     */
    constructor() {}

    /**
     * Construtor completo.
     * Use para criar instâncias com todos os campos já preenchidos.
     */
    constructor(id?: number, nome?: string, email?: string, ativo?: boolean) {
        if (id !== undefined) this.id = id;
        if (nome !== undefined) this.nome = nome;
        if (email !== undefined) this.email = email;
        if (ativo !== undefined) this.ativo = ativo;
    }

    getId(): number { return this.id; }
    getNome(): string { return this.nome; }
    getEmail(): string { return this.email; }
    getAtivo(): boolean { return this.ativo; }

    setId(value: number): void { this.id = value; }
    setNome(value: string): void { this.nome = value; }
    setEmail(value: string): void { this.email = value; }
    setAtivo(value: boolean): void { this.ativo = value; }
}
```

---

## Construtores e reflexão

Ao selecionar **ambos os construtores**, cada linguagem segue o padrão do seu ecossistema:

| Linguagem | Estratégia |
|---|---|
| TypeScript | Overload com parâmetros opcionais |
| JavaScript | Parâmetros com `= undefined` |
| PHP | Dois `__construct` — o vazio para o Doctrine, o cheio para uso manual |
| C# | Dois construtores separados — padrão nativo do C# |
| Python | `__init__` vazio + `@classmethod create()` como factory method |

---

## Inferência de tipos

A extensão infere o tipo pelo nome do campo automaticamente:

| Nome contém | Tipo inferido |
|---|---|
| `id` | `int` / `number` |
| `nome`, `name` | `string` / `str` |
| `email`, `senha`, `password` | `string` / `str` |
| `ativo`, `active` | `bool` / `boolean` |
| `preco`, `price` | `float` / `number` / `double` |
| `data`, `date` | `Date` / `DateTime` |
| outros | `any` / `mixed` / `object` |

---

## Aviso importante

> ⚠️ **JavaScript não suporta interfaces nativamente.**
> Se selecionar Interface em um arquivo `.js`, a extensão vai avisar e ignorar essa opção.
> Use TypeScript para geração de interfaces.

---

## Filosofia

Feito de dev pra dev. Sem configuração, sem wizard, sem opinião sobre sua arquitetura — só estrutura, a lógica é sua.

---

## Parte do ecossistema Albertool

- [Albertool DevKit](https://github.com/seu-usuario/albertool-devkit) — boilerplate de projetos

---

## Licença

MIT
