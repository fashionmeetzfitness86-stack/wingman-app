const { execSync } = require('child_process');

try {
  console.log('Running TypeScript typecheck for Wingman...');
  const output = execSync('node_modules\\.bin\\tsc --noEmit', {
    cwd: 'C:\\Users\\Anderson\\wingman-app',
    encoding: 'utf-8',
    stdio: 'pipe'
  });
  console.log('✅ TypeScript check passed — no errors.');
  if (output) console.log(output);
} catch (error) {
  console.log('❌ TypeScript errors found:');
  console.log(error.stdout || error.message);
}
