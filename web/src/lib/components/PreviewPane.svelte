<script lang="ts">
	import { app } from '$lib/state.svelte';
	import { transformPdf } from '$lib/transform';
	import * as pdfjs from 'pdfjs-dist';
	import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

	pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

	let canvasEl: HTMLCanvasElement;
	let wrapEl: HTMLDivElement;
	let outputMeta = $state({ pages: 0, width: 0, height: 0 });
	let rendering = $state(false);
	let renderError = $state('');
	let renderToken = 0;

	async function previewBytes(): Promise<Uint8Array> {
		const file = app.file!;
		const buf = await file.arrayBuffer();
		// For 'extend' / '3up' previews we only need the first few input pages.
		// For 'all' we need everything (it's one output page).
		const previewCount =
			app.options.layout === 'extend' ? 1 : app.options.layout === '3up' ? 3 : Infinity;

		if (!isFinite(previewCount)) {
			return await transformPdf(buf, app.options);
		}

		// Slice the source to first N pages without copying all of it via pdf-lib.
		const { PDFDocument } = await import('pdf-lib');
		const src = await PDFDocument.load(buf, { ignoreEncryption: true });
		const sub = await PDFDocument.create();
		const idx = Array.from({ length: Math.min(previewCount, src.getPageCount()) }, (_, i) => i);
		const pages = await sub.copyPages(src, idx);
		pages.forEach((p) => sub.addPage(p));
		const subBytes = await sub.save();
		return await transformPdf(subBytes, app.options);
	}

	async function render() {
		if (!app.file) {
			outputMeta = { pages: 0, width: 0, height: 0 };
			return;
		}
		const token = ++renderToken;
		rendering = true;
		renderError = '';
		try {
			const bytes = await previewBytes();
			if (token !== renderToken) return;

			const doc = await pdfjs.getDocument({ data: bytes }).promise;
			if (token !== renderToken) return;

			const page = await doc.getPage(1);
			const unscaled = page.getViewport({ scale: 1 });

			const wrapW = wrapEl?.clientWidth ?? 600;
			const wrapH = wrapEl?.clientHeight ?? 600;
			const scale = Math.min(wrapW / unscaled.width, wrapH / unscaled.height);
			const viewport = page.getViewport({ scale });

			const dpr = window.devicePixelRatio || 1;
			canvasEl.width = Math.ceil(viewport.width * dpr);
			canvasEl.height = Math.ceil(viewport.height * dpr);
			canvasEl.style.width = `${viewport.width}px`;
			canvasEl.style.height = `${viewport.height}px`;
			const ctx = canvasEl.getContext('2d')!;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

			await page.render({ canvasContext: ctx, viewport, canvas: canvasEl }).promise;
			if (token !== renderToken) return;

			outputMeta = {
				pages: doc.numPages,
				width: unscaled.width,
				height: unscaled.height
			};
		} catch (e) {
			renderError = (e as Error).message || 'Could not render preview.';
		} finally {
			if (token === renderToken) rendering = false;
		}
	}

	let timer: ReturnType<typeof setTimeout> | undefined;
	$effect(() => {
		// Track every option + file so changes trigger a re-render.
		const _ = {
			file: app.file,
			...app.options,
			lineColor: { ...app.options.lineColor }
		};
		clearTimeout(timer);
		timer = setTimeout(render, 200);
		return () => clearTimeout(timer);
	});

	function fmt(pt: number): string {
		const inches = pt / 72;
		return `${inches.toFixed(1)}″`;
	}

	// Compute total output page count for the meta line (without rendering them all).
	const totalOutputPages = $derived.by(() => {
		if (!app.file || app.pageCount === 0) return 0;
		if (app.options.layout === 'extend') return app.pageCount;
		if (app.options.layout === '3up') return Math.ceil(app.pageCount / 3);
		return 1;
	});
</script>

<aside class="preview">
	<header>
		<span class="num">04</span>
		<span class="rule" aria-hidden="true"></span>
		<h2>Preview</h2>
		{#if app.file}
			<span class="pages-meta">
				{app.pageCount} → {totalOutputPages}
			</span>
		{/if}
	</header>

	<div class="canvas-wrap" bind:this={wrapEl}>
		{#if !app.file}
			<div class="empty">
				<div class="ornament" aria-hidden="true">
					<svg viewBox="0 0 80 100" width="60" height="76">
						<rect x="14" y="6" width="52" height="86" fill="var(--color-surface)" stroke="var(--color-rule-strong)" stroke-width="1.2" />
						<line x1="22" y1="20" x2="58" y2="20" stroke="var(--color-rule)" stroke-width="0.8" />
						<line x1="22" y1="28" x2="58" y2="28" stroke="var(--color-rule)" stroke-width="0.8" />
						<line x1="22" y1="36" x2="50" y2="36" stroke="var(--color-rule)" stroke-width="0.8" />
						<line x1="22" y1="56" x2="58" y2="56" stroke="var(--color-rule)" stroke-width="0.8" />
						<line x1="22" y1="64" x2="58" y2="64" stroke="var(--color-rule)" stroke-width="0.8" />
						<line x1="22" y1="72" x2="44" y2="72" stroke="var(--color-rule)" stroke-width="0.8" />
					</svg>
				</div>
				<p>Upload a deck to see a live preview of the first output page.</p>
			</div>
		{/if}

		<canvas bind:this={canvasEl} class:visible={!!app.file && !renderError}></canvas>

		{#if rendering}
			<div class="overlay">
				<span class="dot d1"></span>
				<span class="dot d2"></span>
				<span class="dot d3"></span>
			</div>
		{/if}

		{#if renderError}
			<div class="error">
				<p>{renderError}</p>
			</div>
		{/if}
	</div>

	{#if app.file && outputMeta.width > 0}
		<div class="meta-line">
			<span class="meta-num">{fmt(outputMeta.width)} × {fmt(outputMeta.height)}</span>
			<span class="meta-sep"></span>
			<span class="meta-tag">first page</span>
		</div>
	{/if}
</aside>

<style>
	.preview {
		display: flex;
		flex-direction: column;
		gap: 20px;
		height: 100%;
		position: sticky;
		top: 24px;
	}
	header {
		display: grid;
		grid-template-columns: auto auto 1fr auto;
		align-items: center;
		gap: 12px;
	}
	.num {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 500;
		letter-spacing: 0.16em;
		color: var(--color-margin);
	}
	.rule {
		height: 1px;
		background: var(--color-rule);
	}
	h2 {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 1rem;
		color: var(--color-ink);
		font-style: italic;
		margin: 0;
		grid-column: 2;
	}
	.pages-meta {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.08em;
		color: var(--color-ink-muted);
	}

	.canvas-wrap {
		position: relative;
		flex: 1;
		min-height: 420px;
		max-height: 70vh;
		background: var(--color-paper-deep);
		border: 1px solid var(--color-rule);
		border-radius: 4px;
		display: grid;
		place-items: center;
		padding: 28px;
		box-shadow: var(--shadow-card);
		overflow: hidden;
	}
	canvas {
		max-width: 100%;
		max-height: 100%;
		opacity: 0;
		transition: opacity 220ms ease;
		background: white;
		box-shadow: 0 4px 24px rgba(58, 50, 38, 0.12);
	}
	canvas.visible {
		opacity: 1;
	}

	.empty {
		text-align: center;
		color: var(--color-ink-muted);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		position: absolute;
	}
	.empty p {
		font-size: 0.875rem;
		max-width: 280px;
	}

	.overlay {
		position: absolute;
		top: 16px;
		right: 16px;
		display: flex;
		gap: 4px;
		padding: 6px 10px;
		background: rgba(255, 255, 255, 0.92);
		border: 1px solid var(--color-rule);
		border-radius: 2px;
	}
	.dot {
		width: 5px;
		height: 5px;
		background: var(--color-margin);
		border-radius: 50%;
		animation: pulse 1.1s infinite;
	}
	.dot.d2 {
		animation-delay: 0.16s;
	}
	.dot.d3 {
		animation-delay: 0.32s;
	}
	@keyframes pulse {
		0%,
		60%,
		100% {
			opacity: 0.3;
		}
		30% {
			opacity: 1;
		}
	}

	.error {
		position: absolute;
		padding: 16px;
		max-width: 320px;
		text-align: center;
		color: var(--color-margin);
		font-size: 0.875rem;
	}

	.meta-line {
		display: flex;
		align-items: center;
		gap: 12px;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.1em;
		color: var(--color-ink-muted);
	}
	.meta-num {
		color: var(--color-ink);
	}
	.meta-sep {
		flex: 1;
		height: 1px;
		background: var(--color-rule);
	}
	.meta-tag {
		text-transform: uppercase;
	}
</style>
