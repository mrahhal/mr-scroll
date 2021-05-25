import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

// eslint-disable-next-line no-undef
const production = process.env.NODE_ENV === 'production';

export function createRollupConfig(format, name = undefined) {
  const outputDir = `dist/${format}`;
  const typescriptOptions = format == 'es' ? {
    declaration: true,
    declarationDir: outputDir,
  } : {};

  return {
    input: 'src/index.ts',
    output: {
      dir: outputDir,
      format,
      name,
      sourcemap: true,
    },
    plugins: [
      format == 'es' ? peerDepsExternal() : null,
      typescript({
        rootDir: 'src/',
        sourceMap: !production,
        inlineSources: !production,
        ...typescriptOptions,
      }),
      nodeResolve(),
    ],
  };
}
