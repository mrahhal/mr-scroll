import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

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
    external: ['rxjs', 'rxjs/operators'],
    plugins: [
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
