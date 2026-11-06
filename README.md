#  CRUD de Marcas e Modelos de Veículos

Sistema completo para cadastro e gerenciamento de **Marcas de Veículos** e **Modelos de Veículos**, desenvolvido como solução para teste técnico de contratação. 

---

## Tecnologias Utilizadas

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide React, Axios.
- **Backend:** PHP 8.5+, Laravel 13 (API RESTful, Form Requests, Eloquent ORM).
- **Banco de Dados:** PostgreSQL 18 com suporte a chaves estrangeiras (`RESTRICT`) e índices únicos funcionais.
- **Testes Automatizados:** PHPUnit / Laravel Testing Suite (17 testes de integração, 72 asserções).

---

## Estrutura do Banco de Dados & Relacionamentos

O sistema implementa um relacionamento **1:N (Um para Muitos)** entre Marcas e Modelos:
- Uma marca pode possuir múltiplos modelos.
- Cada modelo pertence obrigatoriamente a uma única marca.


### 1. Tabela `vehicle_brands`
| Campo | Tipo | Descrição | Restrições |
|---|---|---|---|
| `id` | `BIGINT` | Identificador único autoincremental | Primary Key |
| `name` | `VARCHAR(255)` | Nome da marca | Not Null, Índice Único Funcional `LOWER(TRIM(name))` |
| `created_at` | `TIMESTAMP` | Data de criação | Preenchimento automático |
| `updated_at` | `TIMESTAMP` | Data da última atualização | Preenchimento automático |

### 2. Tabela `vehicle_models`
| Campo | Tipo | Descrição | Restrições |
|---|---|---|---|
| `id` | `BIGINT` | Identificador único autoincremental | Primary Key |
| `brand_id` | `BIGINT` | ID da marca vinculada | Not Null, Foreign Key referenciando `vehicle_brands(id)` com `ON DELETE RESTRICT` |
| `name` | `VARCHAR(255)` | Nome do modelo | Not Null, Índice Único Composto `(brand_id, LOWER(TRIM(name)))` |
| `created_at` | `TIMESTAMP` | Data de criação | Preenchimento automático |
| `updated_at` | `TIMESTAMP` | Data da última atualização | Preenchimento automático |

---

## Regras de Negócio e Implementação Técnica

Todas as regras de negócio especificadas no edital foram blindadas em múltiplas camadas (Interface, Backend e Banco de Dados):

| Código | Regra de Negócio | Implementação Técnica |
|---|---|---|
| **RN01 / RN07** | **Bloqueio de exclusão de marca com modelos vinculados** | **1. Banco:** FK configurada com `ON DELETE RESTRICT`.<br>**2. Backend:** Checagem em `VehicleBrandController::destroy()` via `$brand->models_count > 0` retornando HTTP 422 com a mensagem exata requerida: *"Não é possível excluir esta marca, pois existem modelos de veículos vinculados a ela. Exclua ou desvincule os modelos antes de continuar."*<br>**3. Frontend:** Indicador visual e alerta preventivo na interface antes de permitir requisições indevidas. |
| **RN02** | **Exclusão de modelos** | Implementada no endpoint `DELETE /api/models/{id}`, removendo o modelo com confirmação prévia via modal na interface. |
| **RN03** | **Alteração de marca** | Implementada via `PUT /api/brands/{id}`. Altera o nome da marca mantendo intactos os relacionamentos com os modelos existentes. |
| **RN04** | **Alteração de modelo e marca vinculada** | Implementada via `PUT /api/models/{id}`. Permite atualizar o nome do modelo e/ou alterar a marca associada para outra marca válida. |
| **RN05** | **Validação de campos obrigatórios** | - Validação client-side no React antes do disparo da requisição.<br>- Validação server-side via `FormRequest` (`StoreVehicleBrandRequest`, `StoreVehicleModelRequest`), exigindo nomes preenchidos e garantindo que `brand_id` exista na tabela `vehicle_brands`. |
| **RN06** | **Prevenção de duplicidade (case-insensitive & trim)** | - Sanitização com `trim()` aplicada nos Models e Requests.<br>- Validação customizada comparando `LOWER(TRIM(name))`.<br>- Índices únicos funcionais criados no PostgreSQL (`LOWER(TRIM(name))` para marcas e composto `(brand_id, LOWER(TRIM(name)))` para modelos). |

---

## Como Executar o Projeto Localmente

### Pré-requisitos
- **PHP** 8.2 ou superior (com extensões `pdo_pgsql`, `pgsql` e `zip` ativas).
- **Composer** 2+.
- **Node.js** 20+ e **npm**.
- **PostgreSQL** 14+ em execução.

---

### 1. Configuração do Backend (Laravel)

1. Entre no diretório `backend`:
   ```bash
   cd backend
   ```

2. Instale as dependências PHP:
   ```bash
   composer install
   ```

3. Verifique as credenciais do banco de dados no arquivo `.env`:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=crud_veiculos
   DB_USERNAME=postgres
   DB_PASSWORD=sua_senha_do_postgres
   ```

4. Execute as migrações para criar as tabelas e índices no PostgreSQL:
   ```bash
   php artisan migrate
   ```

5. Inicie o servidor da API:
   ```bash
   php artisan serve
   ```
   *A API estará disponível em: `http://localhost:8000`*

---

### 2. Configuração do Frontend (React)

1. Em outro terminal, acesse a pasta `frontend`:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   *Acesse a aplicação no seu navegador em: `http://localhost:5173`*

---

## Execução dos Testes Automatizados

O projeto conta com uma suíte de testes de integração cobrindo 100% dos cenários felizes e regras de negócio críticas.

Para executar os testes:
```bash
cd backend
php artisan test
```

### Resultados da Cobertura de Testes:
```text
   PASS  Tests\Feature\VehicleBrandApiTest
  ✓ can list and search brands
  ✓ can create brand
  ✓ cannot create brand without name (RN05)
  ✓ cannot create duplicate brand (RN06)
  ✓ can update brand name (RN03)
  ✓ cannot delete brand with associated models (RN01, RN07)
  ✓ can delete brand without models

   PASS  Tests\Feature\VehicleModelApiTest
  ✓ can list and search models with brand
  ✓ can create model
  ✓ cannot create model without name or brand (RN05)
  ✓ cannot create model with nonexistent brand (RN05)
  ✓ cannot create duplicate model for same brand (RN06)
  ✓ can create same model name for different brands (RN06)
  ✓ can update model and reassign brand (RN04)
  ✓ can delete model (RN02)

  Tests:    17 passed (72 assertions)
  Duration: 1.43s
```

---

## Endpoints da API REST

### Marcas (`/api/brands`)
- `GET /api/brands` - Lista marcas em ordem alfabética (suporta `?search=nome`).
- `POST /api/brands` - Cadastra uma nova marca.
- `GET /api/brands/{id}` - Exibe dados de uma marca e contagem de modelos.
- `PUT /api/brands/{id}` - Atualiza o nome da marca (RN03).
- `DELETE /api/brands/{id}` - Exclui a marca se não possuir modelos vinculados (RN01, RN07).

### Modelos (`/api/models`)
- `GET /api/models` - Lista modelos trazendo os dados completos da marca vinculada (suporta `?search=termo` e `?brand_id=X`).
- `POST /api/models` - Cadastra novo modelo vinculado a uma marca (RN05, RN06).
- `GET /api/models/{id}` - Exibe dados do modelo com sua marca.
- `PUT /api/models/{id}` - Atualiza nome e/ou troca de marca vinculada (RN04).
- `DELETE /api/models/{id}` - Exclui o modelo (RN02).

