import { existsSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Only runs for degit-cloned projects (no .git directory).
if (!existsSync('.git')) {
  const projectName = basename(resolve('.'));

  // Remove CI workflows (only needed for the template repo)
  if (existsSync('.github/workflows')) {
    rmSync('.github/workflows', { recursive: true });
  }

  // Replace project name in source files
  const filesToUpdate = ['src/configs/project/index.ts', 'ecosystem.config.cjs'];

  for (const filePath of filesToUpdate) {
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf8');
      const updated = content.replaceAll('next-template', projectName);
      if (content !== updated) {
        writeFileSync(filePath, updated);
      }
    }
  }

  // Reset package.json to a clean project state
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  pkg.name = projectName;
  pkg.version = '1.0.0';
  delete pkg.description;
  delete pkg.author;
  delete pkg.license;
  delete pkg.scripts.prepare;
  writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`);

  // Self-delete — this script is no longer needed
  try {
    rmSync(fileURLToPath(import.meta.url), { force: true });
  } catch {
    // ignore
  }

  console.log(`\n✅ Project "${projectName}" initialized. Run: pnpm dev\n`);
}
