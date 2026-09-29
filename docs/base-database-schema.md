# KREVORA Base Database Schema v1

This document is the database contract for Base Setup v1. It defines the
seven foundation tables before Sequelize migrations are created.

## Design Decisions

- PostgreSQL is the source of truth.
- IDs use auto-incrementing `BIGINT` values.
- Timestamps use `TIMESTAMPTZ`.
- Application code normalizes usernames, emails, keys, and permission names
  before persistence.
- Users, roles, permissions, and menus are deactivated rather than deleted.
- Effective permissions are the union of permissions from all active roles
  assigned to an active user.
- There are no deny rules or permission inheritance rules in v1.

## 1. users

| Column | Type | Rules |
|---|---|---|
| `id` | `BIGINT` | Primary key, identity |
| `full_name` | `VARCHAR(150)` | Required |
| `username` | `VARCHAR(80)` | Required, unique |
| `email` | `VARCHAR(255)` | Required, unique |
| `mobile` | `VARCHAR(30)` | Optional |
| `password_hash` | `VARCHAR(255)` | Required |
| `status` | `VARCHAR(20)` | Required, `ACTIVE` or `INACTIVE` |
| `last_login_at` | `TIMESTAMPTZ` | Optional |
| `created_at` | `TIMESTAMPTZ` | Required, default current time |
| `updated_at` | `TIMESTAMPTZ` | Required, default current time |

Indexes:

- Unique index on `username`.
- Unique index on `email`.
- Index on `status`.

The API must never return `password_hash`.

## 2. roles

| Column | Type | Rules |
|---|---|---|
| `id` | `BIGINT` | Primary key, identity |
| `name` | `VARCHAR(100)` | Required |
| `key` | `VARCHAR(100)` | Required, unique, immutable for system roles |
| `description` | `TEXT` | Optional |
| `status` | `VARCHAR(20)` | Required, `ACTIVE` or `INACTIVE` |
| `is_system` | `BOOLEAN` | Required, default `FALSE` |
| `created_at` | `TIMESTAMPTZ` | Required, default current time |
| `updated_at` | `TIMESTAMPTZ` | Required, default current time |

Indexes and rules:

- Unique index on `key`.
- Index on `status`.
- The `SUPER_ADMIN` role has `key = 'SUPER_ADMIN'` and `is_system = TRUE`.
- System roles cannot be deleted or deactivated through the API.
- The last active Super Admin cannot lose its role or access.

## 3. permissions

| Column | Type | Rules |
|---|---|---|
| `id` | `BIGINT` | Primary key, identity |
| `name` | `VARCHAR(150)` | Required, unique, format `module.action` |
| `module` | `VARCHAR(80)` | Required |
| `action` | `VARCHAR(80)` | Required |
| `description` | `TEXT` | Optional |
| `status` | `VARCHAR(20)` | Required, `ACTIVE` or `INACTIVE` |
| `created_at` | `TIMESTAMPTZ` | Required, default current time |
| `updated_at` | `TIMESTAMPTZ` | Required, default current time |

Constraints and indexes:

- Unique constraint on `name`.
- Unique constraint on (`module`, `action`).
- Index on `module`.
- Index on `status`.
- Permission records are developer-defined; there is no permission CRUD API.

## 4. menus

| Column | Type | Rules |
|---|---|---|
| `id` | `BIGINT` | Primary key, identity |
| `name` | `VARCHAR(120)` | Required |
| `key` | `VARCHAR(120)` | Required, unique |
| `parent_id` | `BIGINT` | Optional self-reference to `menus.id` |
| `route` | `VARCHAR(255)` | Optional, unique when present |
| `icon` | `VARCHAR(100)` | Optional |
| `display_order` | `INTEGER` | Required, default `0`, non-negative |
| `status` | `VARCHAR(20)` | Required, `ACTIVE` or `INACTIVE` |
| `created_at` | `TIMESTAMPTZ` | Required, default current time |
| `updated_at` | `TIMESTAMPTZ` | Required, default current time |

Constraints and indexes:

- Unique constraint on `key`.
- Partial unique index on non-null `route` values.
- Index on `parent_id`.
- Index on (`status`, `parent_id`, `display_order`).
- A menu cannot be its own parent.
- Parent menus may have a null route.
- The service layer must reject circular parent relationships.
- Menus are deactivated rather than deleted.

## 5. user_roles

| Column | Type | Rules |
|---|---|---|
| `user_id` | `BIGINT` | Required FK to `users.id` |
| `role_id` | `BIGINT` | Required FK to `roles.id` |

Constraints and indexes:

- Composite primary key on (`user_id`, `role_id`).
- Index on `role_id`.
- Foreign keys use `ON DELETE CASCADE` for relationship cleanup.
- Duplicate role assignments are impossible.

## 6. role_permissions

| Column | Type | Rules |
|---|---|---|
| `role_id` | `BIGINT` | Required FK to `roles.id` |
| `permission_id` | `BIGINT` | Required FK to `permissions.id` |

Constraints and indexes:

- Composite primary key on (`role_id`, `permission_id`).
- Index on `permission_id`.
- Foreign keys use `ON DELETE CASCADE` for relationship cleanup.
- Assignment replacement occurs inside a transaction.

## 7. role_menus

| Column | Type | Rules |
|---|---|---|
| `role_id` | `BIGINT` | Required FK to `roles.id` |
| `menu_id` | `BIGINT` | Required FK to `menus.id` |

Constraints and indexes:

- Composite primary key on (`role_id`, `menu_id`).
- Index on `menu_id`.
- Foreign keys use `ON DELETE CASCADE` for relationship cleanup.
- Assignment replacement occurs inside a transaction.

## Relationship Summary

```text
users ───< user_roles >─── roles
roles ───< role_permissions >─── permissions
roles ───< role_menus >─── menus
menus ───< menus (parent_id)
```

## Migration Order

Create tables in this order:

```text
users
roles
permissions
menus
user_roles
role_permissions
role_menus
```

Create foreign keys and indexes within the relevant migrations. Seeders
must run after all migrations succeed.

## Assignment and Authorization Rules

- Assigning roles, permissions, or menus replaces the complete assignment
  set in one database transaction.
- Inactive users cannot authenticate.
- Inactive roles do not contribute effective permissions.
- Inactive permissions are ignored during authorization.
- Inactive menus are excluded from authorized menu responses.
- Super Admin access is protected by the system role key, not by its display
  name.
