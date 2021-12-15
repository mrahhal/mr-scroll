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
lerna version [version] --no-git-tag-version --no-push --yes
```

## Release

```
lerna publish [version]
```

If we're updating to a version (usually a major version update) that requires updates to the peer dependencies, then use the `lerna version ...` command above to allow lerna to update what it wants to update, and then go on and update peer dependencies manually (and run `npm i` so that the lock file is updated too). After that, commit the changes, and then finally run lerna publish.
