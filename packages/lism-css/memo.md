## use client対策

以下のように、 `React.functionNmae`で利用することに注意。

```js
import React from 'react';
export const LayoutContext = React.createContext(null);
```

以下ののように useXXX や createContext などを直接 import してきてしまうと、 Boxのインポートだけでも use client が必要だとエラーになってしまった。

```js
import { createContext } from 'react';
export const LayoutContext = createContext(null);
```

## パッケージ公開

```
npm login
npm publish
```

## pnpm-lock.yamlの更新

依存関係を再整理したいときは再インストール。

```
pnpm install
```
