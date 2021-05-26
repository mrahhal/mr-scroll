# Development

We use [lerna](https://github.com/lerna/lerna) to publish our packages. We use the fixed versioning mode.

```
npm i -g lerna
```

## What changed since last release

```
lerna changed
```

## Release without actual git push / npm publish

```
lerna publish [version] --skip-git --skip-npm --yes
```

## Release

```
lerna publish [version]
```
