import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

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
    },
    external: ['rxjs', 'rxjs/operators'],
    plugins: [
      typescript({
        rootDir: 'src/',
        ...typescriptOptions,
      }),
      nodeResolve(),
    ],
  };
}
