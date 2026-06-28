# Albertool Constructor

Generates constructors, getters, setters and interfaces directly in VSCode — no more typing boilerplate by hand.

Inspired by the NetBeans/IntelliJ Alt+Insert flow: you declare the fields, the extension does the rest.

---

## Supported languages

| Language | Extension |
|---|---|
| TypeScript | `.ts` |
| JavaScript | `.js` |
| PHP | `.php` |
| C# | `.cs` |
| Python | `.py` |

---

## How to use

1. Open a file with a class that already has its fields declared
2. Run the command `Albertool: Build Class` (`Ctrl+Shift+P` → search for "Albertool")
3. Select what you want to generate and confirm

```
🏗️ Empty constructor     → for reflection (TypeORM, Doctrine, EF, SQLAlchemy...)
🏗️ Full constructor      → initializes all fields
🔧 Getters
🔧 Setters
📦 Interface
```

---

## Example

**Input — declare the fields before running:**

```typescript
export class User {
    private id: number;
    private nome: string;
    private email: string;
    private ativo: boolean;
}
```

**Output — select all options:**

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
     * Default constructor for reflection.
     * Used by TypeORM and other frameworks to instantiate the entity.
     */
    constructor() {}

    /**
     * Full constructor.
     * Use to create instances with all fields already populated.
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

## Constructors and reflection

When selecting **both constructors**, each language follows the standard of its ecosystem:

| Language | Strategy |
|---|---|
| TypeScript | Overload with optional parameters |
| JavaScript | Parameters with `= undefined` |
| PHP | Two `__construct` — empty one for Doctrine, full one for manual use |
| C# | Two separate constructors — native C# pattern |
| Python | Empty `__init__` + `@classmethod create()` as factory method |

---

## Type inference

The extension infers the type from the field name automatically:

| Name contains | Inferred type |
|---|---|
| `id` | `int` / `number` |
| `nome`, `name` | `string` / `str` |
| `email`, `senha`, `password` | `string` / `str` |
| `ativo`, `active` | `bool` / `boolean` |
| `preco`, `price` | `float` / `number` / `double` |
| `data`, `date` | `Date` / `DateTime` |
| others | `any` / `mixed` / `object` |

---

## Important notice

> ⚠️ **JavaScript does not support interfaces natively.**
> If you select Interface on a `.js` file, the extension will warn you and ignore that option.
> Use TypeScript for interface generation.

---

## Philosophy

Built by devs, for devs. No configuration, no wizard, no opinion about your architecture — just structure, the logic is yours.

---

## Part of the Albertool ecosystem

- [Albertool DocGen](https://github.com/SidneiAJr/albertool-docgen) — automatic documentation generator for backend projects

---

## License

MIT