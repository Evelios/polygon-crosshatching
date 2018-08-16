import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const plugins = [
  resolve(),
  commonjs(),
];

export default {
  plugins,
  input: './boundingbox-crosshatching.js',
  output: [
    // UMD Build
    {
      name: 'boundingboxCrosshatching',
      file: 'build.js',
      format: 'umd',
      interop: false,
    },    
  ],
};