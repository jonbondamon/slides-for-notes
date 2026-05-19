<script lang="ts">
	import { app, outputFileName } from '$lib/state.svelte';
	import { transformPdf } from '$lib/transform';
	import DropZone from '$lib/components/DropZone.svelte';
	import LayoutPicker from '$lib/components/LayoutPicker.svelte';
	import Range from '$lib/components/Range.svelte';
	import Switch from '$lib/components/Switch.svelte';
	import ColorField from '$lib/components/ColorField.svelte';
	import Section from '$lib/components/Section.svelte';
	import PreviewPane from '$lib/components/PreviewPane.svelte';

	let advancedOpen = $state(false);
	let downloadError = $state('');
	const is3up = $derived(app.options.layout === '3up');

	async function download() {
		if (!app.file || app.isProcessing) return;
		downloadError = '';
		app.isProcessing = true;
		try {
			const bytes = await transformPdf(await app.file.arrayBuffer(), app.options);
			const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = outputFileName();
			document.body.appendChild(a);
			a.click();
			a.remove();
			setTimeout(() => URL.revokeObjectURL(url), 1500);
		} catch (e) {
			downloadError = (e as Error).message || 'Could not export PDF.';
		} finally {
			app.isProcessing = false;
		}
	}
</script>

<div class="page">
	<aside class="margin-rail" aria-hidden="true">
		<span class="margin-line"></span>
		<span class="punch p1"></span>
		<span class="punch p2"></span>
		<span class="punch p3"></span>
	</aside>

	<header class="masthead">
		<div class="folio">
			<span class="folio-num">№ 01</span>
			<span class="folio-sep">—</span>
			<span class="folio-meta">Vol. I · Edition 2026</span>
		</div>
		<h1 class="font-display title">
			Slides<span class="for">for</span>Notes
		</h1>
		<p class="subtitle">
			A quiet tool that extends slide decks <em>for handwritten study</em>.
		</p>
	</header>

	<main class="layout">
		<div class="controls">
			<Section num="01" title="Upload">
				<DropZone />
			</Section>

			<Section num="02" title="Layout">
				<LayoutPicker />
			</Section>

			<Section num="03" title="Notes">
				<Range
					label="Notes width"
					value={app.options.ratio}
					min={0.25}
					max={2}
					step={0.05}
					format={(v) => v.toFixed(2)}
					unit="× slide"
					onchange={(v) => (app.options.ratio = v)}
				/>

				<div class="divider"></div>

				<Switch
					label="Ruled lines"
					description="Faint horizontal rules in the notes area."
					checked={app.options.lines}
					onchange={(v) => (app.options.lines = v)}
				/>

				{#if app.options.lines}
					<div class="lines-detail">
						<Range
							label="Spacing"
							value={app.options.lineSpacingMm}
							min={4}
							max={20}
							step={0.5}
							unit="mm"
							format={(v) => v.toFixed(1)}
							onchange={(v) => (app.options.lineSpacingMm = v)}
						/>
						<Range
							label="Stroke"
							value={app.options.lineWeightPt}
							min={0.1}
							max={1.5}
							step={0.05}
							unit="pt"
							format={(v) => v.toFixed(2)}
							onchange={(v) => (app.options.lineWeightPt = v)}
						/>
						<ColorField
							label="Color"
							value={app.options.lineColor}
							onchange={(v) => (app.options.lineColor = v)}
						/>
					</div>
				{/if}
			</Section>

			<button class="advanced-toggle" type="button" onclick={() => (advancedOpen = !advancedOpen)}>
				<span class="caret" class:open={advancedOpen}>›</span>
				Advanced
			</button>

			{#if advancedOpen}
				<div class="advanced-body">
					{#if is3up}
						<div class="select-group">
							<span class="select-label">Page size</span>
							<div class="select-options">
								{#each ['letter', 'a4', 'legal'] as size}
									<button
										type="button"
										class="select-opt"
										class:selected={app.options.pageSize === size}
										onclick={() => (app.options.pageSize = size as 'letter' | 'a4' | 'legal')}
									>
										{size === 'letter' ? 'Letter' : size === 'a4' ? 'A4' : 'Legal'}
									</button>
								{/each}
							</div>
						</div>
						<Range
							label="Margin"
							value={app.options.marginMm}
							min={5}
							max={30}
							step={0.5}
							unit="mm"
							format={(v) => v.toFixed(1)}
							onchange={(v) => (app.options.marginMm = v)}
						/>
						<Range
							label="Gutter"
							value={app.options.gutterMm}
							min={2}
							max={20}
							step={0.5}
							unit="mm"
							format={(v) => v.toFixed(1)}
							onchange={(v) => (app.options.gutterMm = v)}
						/>
					{:else}
						<p class="advanced-note">No advanced options for this layout.</p>
					{/if}
				</div>
			{/if}

			<div class="action">
				<button
					class="download"
					type="button"
					disabled={!app.file || app.isProcessing}
					onclick={download}
				>
					{#if app.isProcessing}
						<span class="spinner" aria-hidden="true"></span>
						Generating…
					{:else}
						<svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
							<path d="M12 4v12m0 0l-5-5m5 5l5-5M4 20h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
						Download formatted PDF
					{/if}
				</button>
				{#if downloadError}
					<p class="download-error">{downloadError}</p>
				{:else}
					<p class="privacy">Processing happens in this browser — your PDF never uploads.</p>
				{/if}
			</div>
		</div>

		<div class="preview">
			<PreviewPane />
		</div>
	</main>

	<footer>
		<span class="mono">END · SLIDES FOR NOTES</span>
	</footer>
</div>

<style>
	.page {
		position: relative;
		min-height: 100vh;
		max-width: 1440px;
		margin: 0 auto;
		padding: 32px 28px 80px 88px;
		z-index: 1;
	}
	@media (min-width: 1024px) {
		.page {
			padding: 48px 56px 96px 120px;
		}
	}

	/* Red binding line + punch holes */
	.margin-rail {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 48px;
		width: 24px;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 60px;
		gap: 220px;
		pointer-events: none;
	}
	@media (min-width: 1024px) {
		.margin-rail {
			left: 72px;
		}
	}
	.margin-line {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 50%;
		width: 1.5px;
		background: var(--color-margin);
		opacity: 0.7;
	}
	.punch {
		position: relative;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--color-paper);
		border: 1px solid var(--color-rule-strong);
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06);
	}

	/* Masthead */
	.masthead {
		margin-bottom: 56px;
	}
	.folio {
		display: flex;
		gap: 10px;
		align-items: center;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-ink-muted);
		margin-bottom: 18px;
	}
	.folio-num {
		color: var(--color-margin);
	}
	.folio-sep {
		opacity: 0.4;
	}
	.title {
		font-size: clamp(3.5rem, 9vw, 7.5rem);
		font-weight: 500;
		font-variation-settings: 'opsz' 144, 'SOFT' 50, 'WONK' 0;
		letter-spacing: -0.035em;
		line-height: 0.9;
		margin: 0 0 16px 0;
		color: var(--color-ink);
	}
	.title .for {
		font-style: italic;
		font-weight: 300;
		font-size: 0.55em;
		font-variation-settings: 'opsz' 36, 'SOFT' 100, 'WONK' 1;
		color: var(--color-margin);
		margin: 0 0.15em;
		display: inline-block;
		transform: translateY(-0.18em);
	}
	.subtitle {
		font-size: 1.0625rem;
		color: var(--color-ink-muted);
		max-width: 460px;
		line-height: 1.5;
	}
	.subtitle em {
		font-style: italic;
		color: var(--color-ink);
	}

	/* Layout */
	.layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: 48px;
	}
	@media (min-width: 1024px) {
		.layout {
			grid-template-columns: minmax(380px, 1fr) minmax(0, 1.2fr);
			gap: 64px;
			align-items: start;
		}
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 36px;
	}

	.divider {
		height: 1px;
		background: var(--color-rule);
		margin: 4px 0;
	}
	.lines-detail {
		display: flex;
		flex-direction: column;
		gap: 18px;
		padding: 4px 0 8px;
	}

	.advanced-toggle {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 4px;
		background: transparent;
		border: none;
		border-top: 1px solid var(--color-rule);
		border-bottom: 1px solid var(--color-rule);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-ink-muted);
		cursor: pointer;
		text-align: left;
	}
	.advanced-toggle:hover {
		color: var(--color-ink);
	}
	.caret {
		font-family: var(--font-display);
		font-size: 1rem;
		transition: transform 220ms ease;
		display: inline-block;
	}
	.caret.open {
		transform: rotate(90deg);
	}
	.advanced-body {
		display: flex;
		flex-direction: column;
		gap: 18px;
		padding: 8px 0 0;
	}
	.advanced-note {
		font-size: 0.875rem;
		color: var(--color-ink-muted);
		font-style: italic;
	}

	.select-group {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.select-label {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-ink-muted);
	}
	.select-options {
		display: flex;
		gap: 8px;
	}
	.select-opt {
		flex: 1;
		min-height: 44px;
		padding: 8px 14px;
		background: var(--color-surface);
		border: 1px solid var(--color-rule);
		border-radius: 3px;
		font-family: var(--font-display);
		font-size: 0.9375rem;
		color: var(--color-ink);
		cursor: pointer;
		transition: all 120ms ease;
	}
	.select-opt:hover {
		border-color: var(--color-rule-strong);
	}
	.select-opt.selected {
		border-color: var(--color-ink);
		background: var(--color-paper-deep);
	}

	.action {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding-top: 16px;
	}
	.download {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		width: 100%;
		min-height: 56px;
		padding: 16px 24px;
		background: var(--color-ink);
		color: var(--color-paper);
		border: 1px solid var(--color-ink);
		border-radius: 3px;
		font-family: var(--font-display);
		font-size: 1.0625rem;
		font-weight: 500;
		letter-spacing: -0.01em;
		cursor: pointer;
		transition: all 160ms ease;
	}
	.download:hover:not(:disabled) {
		background: var(--color-margin);
		border-color: var(--color-margin);
		transform: translateY(-1px);
		box-shadow: 0 6px 20px rgba(192, 57, 43, 0.22);
	}
	.download:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.privacy {
		font-size: 0.75rem;
		color: var(--color-ink-muted);
		text-align: center;
		font-style: italic;
	}
	.download-error {
		font-size: 0.8125rem;
		color: var(--color-margin);
		text-align: center;
	}
	.spinner {
		display: inline-block;
		width: 14px;
		height: 14px;
		border: 1.5px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 720ms linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	footer {
		margin-top: 80px;
		padding-top: 24px;
		border-top: 1px solid var(--color-rule);
		text-align: center;
	}
	.mono {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: 0.18em;
		color: var(--color-ink-muted);
	}
</style>
