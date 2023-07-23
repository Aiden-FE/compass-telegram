import json from '@rollup/plugin-json';
import ts from 'rollup-plugin-ts';
import { builtinModules } from 'module';
import terser from '@rollup/plugin-terser';
import cleanup from 'rollup-plugin-cleanup';
import summary from 'rollup-plugin-summary';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import serve from 'rollup-plugin-serve';
import { visualizer } from 'rollup-plugin-visualizer';
import pkg from './package.json';

const isProd = !process.env.ROLLUP_WATCH;

/**
 * @description 获取构建插件
 * @param {('serve'|'nodeResolve'|'commonjs'|'compiler'|'terser'|'cleanup'|'summary'|'visualizer')[]} disablePlugins 待禁用的插件
 * @param {{[key: string]: object}} options
 * @return {(Plugin|false|{generateBundle: generateBundle, name: string})[]}
 */
function getPlugins(disablePlugins = [], options = {}) {
  return [
    json(),
    ts(),
    !disablePlugins.includes('serve') &&
      !isProd &&
      serve(
        options.serve || {
          port: 3000,
          contentBase: '.',
        },
      ),
    // 如果目标是node环境,需要提供选项{ exportConditions: ["node"] }以支持构建
    !disablePlugins.includes('nodeResolve') && nodeResolve(options.nodeResolve || undefined),
    !disablePlugins.includes('commonjs') && commonjs(options.commonjs || undefined),
    !disablePlugins.includes('terser') && isProd && terser(options.terser || undefined),
    !disablePlugins.includes('cleanup') && isProd && cleanup(options.cleanup || { comments: 'none' }),
    !disablePlugins.includes('summary') &&
      isProd &&
      summary(
        options.summary || {
          totalLow: 1024 * 8,
          totalHigh: 1024 * 20,
          showBrotliSize: true,
          showGzippedSize: true,
          showMinifiedSize: true,
        },
      ),
    !disablePlugins.includes('visualizer') && isProd && visualizer(),
  ];
}

/**
 * @description 获取要排除的外部选项
 * @param {string[]} additionalExternal
 * @return {string[]}
 */
function getExternal(additionalExternal = []) {
  return [...builtinModules].concat(additionalExternal || []);
}

/**
 * @description 获取输出配置项
 * @param options 文档: https://www.rollupjs.com/guide/big-list-of-options
 * @return {Record<string, unknown>}
 */
function getOutput(options = {}) {
  return {
    dir: 'dist',
    format: 'es',
    chunkFileNames: 'bundle/chunk.[format].[hash].js',
    entryFileNames: '[name].[format].js',
    sourcemap: isProd,
    ...options,
  };
}

export default [
  // umd bundle
  {
    input: 'src/main.ts',
    output: getOutput({
      format: 'umd',
      file: pkg.main,
      name: 'Telegram' || pkg.name, // Set your library name.
      dir: undefined,
      chunkFileNames: undefined,
      entryFileNames: undefined,
      exports: 'named',
      globals: {
        axios: 'axios',
      },
    }),
    external: getExternal(Object.keys(pkg.peerDependencies)),
    plugins: getPlugins(undefined, {
      nodeResolve: { browser: true },
    }),
  },
  // commonjs bundle
  isProd && {
    input: 'src/main.ts',
    output: getOutput({
      format: 'cjs',
      exports: 'auto',
    }),
    external: getExternal(Object.keys(pkg.peerDependencies)),
    plugins: getPlugins(undefined, {
      nodeResolve: { browser: false, exportConditions: ['node'] },
    }),
  },
  // esm bundle
  isProd && {
    input: 'src/main.ts',
    output: getOutput(),
    external: getExternal(Object.keys(pkg.peerDependencies)),
    plugins: getPlugins(),
    watch: {
      include: ['src/**', 'index.html'],
    },
  },
].filter((item) => !!item);
