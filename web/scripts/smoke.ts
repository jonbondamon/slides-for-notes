// Local smoke test: not deployed. Run via `bun run scripts/smoke.ts <input.pdf>`.
import { readFileSync, writeFileSync } from 'fs';
import { transformPdf } from '../src/lib/transform.js';

const input = process.argv[2];
if (!input) {
	console.error('usage: bun run scripts/smoke.ts <input.pdf>');
	process.exit(1);
}

const bytes = readFileSync(input);

async function run() {
	for (const layout of ['extend', '3up', 'all'] as const) {
		const out = await transformPdf(bytes, { layout, lines: true });
		const path = `/tmp/smoke-${layout}.pdf`;
		writeFileSync(path, out);
		console.log(`wrote ${path} (${out.length} bytes)`);
	}
}

run();
