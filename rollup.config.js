import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const plugins = [
  resolve(),
  commonjs(),
];

export default {
  plugins,
  input: './polygon-crosshatching.js',
  output: [
    // UMD Build
    {
      name: 'polygonCrosshatching',
      file: 'build.js',
      format: 'umd',
      interop: false,
    },
  ],
};
