# Storage: LocalStorage, SessionStorage & Cookie

> Type-safe wrappers for browser storage mechanisms: `localStorage`, `sessionStorage`, `cookie`, and more.

This module provides **reusable, consistent, and safe functions** to work with client-side storage.  
Currently, it supports `LocalStorage`, `SessionStorage`, and `Cookie`, but it can be extended to other storage mechanisms (e.g., IndexedDB) in the future.

---

## Contents:

- [LocalStorage](#1-localstorage)
  - [File Structure](#file-structure)
  - [Paths Example](#paths-example)
  - [Get Method](#get-method)
  - [Set Method](#set-method)
  - [Remove Method](#remove-method)
- [SessionStorage](#2-sessionstorage)
  - [File Structure](#file-structure-1)
  - [Paths Example](#paths-example-1)
  - [Get Method](#get-method-1)
  - [Set Method](#set-method-1)
  - [Remove Method](#remove-method-1)
- [Cookie](#3-cookie)
  - [Get Method](#get-method-2)
  - [Set Method](#set-method-2)
  - [Remove Method](#remove-method-2)

---

## 1. LocalStorage

### File Structure

There are two main files for configuration:

- `functions.ts` — contains functions to work with LocalStorage.
- `paths.ts` — defines keys (paths) used for storage.

---

### Usage

#### Paths Example

```ts
const LOCAL_STORAGE_PATHS = {
  user: 'user',
  is_logged_in: 'is_logged_in',
  score: 'score',
} as const;

export default LOCAL_STORAGE_PATHS;
```

#### GET Method

```ts
import { LOCAL_STORAGE_PATHS, customLocalStorage } from '@services/storage';

const user = customLocalStorage.get(LOCAL_STORAGE_PATHS.user, { id: 0, name: 'Guest' });
console.log(user); // { id: 1, name: 'Alice' }

const isLoggedIn = customLocalStorage.get(LOCAL_STORAGE_PATHS.is_logged_in, false);
console.log(isLoggedIn); // true

const score = customLocalStorage.get(LOCAL_STORAGE_PATHS.score, 0n);
console.log(score); // 123n
```

#### SET Method

```ts
import { LOCAL_STORAGE_PATHS, customLocalStorage } from '@services/storage';

customLocalStorage.set(LOCAL_STORAGE_PATHS.user, { id: 1, name: 'Alice' });

customLocalStorage.set(LOCAL_STORAGE_PATHS.is_logged_in, true);

customLocalStorage.set(LOCAL_STORAGE_PATHS.score, 123n);
```

#### REMOVE Method

```ts
import { LOCAL_STORAGE_PATHS, customLocalStorage } from '@services/storage';

customLocalStorage.remove(LOCAL_STORAGE_PATHS.user);

const removedUser = customLocalStorage.get(LOCAL_STORAGE_PATHS.user, null);
console.log(removedUser); // null
```

---

## 2. SessionStorage

### File Structure

There are two main files for configuration:

- `functions.ts` — contains functions to work with SessionStorage.
- `paths.ts` — defines keys (paths) used for storage.

---

### Usage

#### Paths Example

```ts
const SESSION_STORAGE_PATHS = {
  temp_data: 'temp_data',
  form_state: 'form_state',
} as const;

export default SESSION_STORAGE_PATHS;
```

#### GET Method

```ts
import { SESSION_STORAGE_PATHS, customSessionStorage } from '@services/storage';

type TypeUser = {
  id: number;
  name: string;
};

const user = customSessionStorage.get<TypeUser | null>(SESSION_STORAGE_PATHS.temp_data, null);
console.log(user); // { id: 1, name: 'Alice' } or null

const formState = customSessionStorage.get<boolean>(SESSION_STORAGE_PATHS.form_state, false);
console.log(formState); // true or false
```

#### SET Method

```ts
import { SESSION_STORAGE_PATHS, customSessionStorage } from '@services/storage';

customSessionStorage.set(SESSION_STORAGE_PATHS.temp_data, { id: 1, name: 'Alice' });
customSessionStorage.set(SESSION_STORAGE_PATHS.form_state, true);
```

#### REMOVE Method

```ts
import { SESSION_STORAGE_PATHS, customSessionStorage } from '@services/storage';

customSessionStorage.remove(SESSION_STORAGE_PATHS.temp_data);

const removedData = customSessionStorage.get(SESSION_STORAGE_PATHS.temp_data, null);
console.log(removedData); // null
```

---

## 3. Cookie

### File Structure

There are two main files for configuration:

- `functions.ts` — contains functions to work with Cookie.
- `paths.ts` — defines keys (paths) used for storage.

---

### Usage

#### Paths Example

```ts
const COOKIE_PATHS = {
  user: 'user',
  is_logged_in: 'is_logged_in',
  session_token: 'session_token',
} as const;

export default COOKIE_PATHS;
```

#### GET Method

```ts
import { COOKIE_PATHS, customCookieStorage } from '@services/storage';

const user = customCookieStorage.get(COOKIE_PATHS.user, { id: 0, name: 'Guest' });
console.log(user); // { id: 1, name: 'Alice' }

const isLoggedIn = customCookieStorage.get(COOKIE_PATHS.is_logged_in, false);
console.log(isLoggedIn); // true
```

#### SET Method

```ts
import { COOKIE_PATHS, customCookieStorage } from '@services/storage';

customCookieStorage.set(COOKIE_PATHS.user, { id: 1, name: 'Alice' });
customCookieStorage.set(COOKIE_PATHS.is_logged_in, true);
customCookieStorage.set(COOKIE_PATHS.session_token, 'abc123', { path: '/', maxAge: 3600 });
```

#### REMOVE Method

```ts
import { COOKIE_PATHS, customCookieStorage } from '@services/storage';

customCookieStorage.remove(COOKIE_PATHS.user);

const removedUser = customCookieStorage.get(COOKIE_PATHS.user, null);
console.log(removedUser); // null
```

---
