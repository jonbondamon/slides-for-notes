<script lang="ts">
	import { app } from '$lib/state.svelte';
	import { PDFDocument } from 'pdf-lib';

	let dragging = $state(false);
	let inputEl: HTMLInputElement;
	let error = $state('');

	async function ingest(file: File) {
		error = '';
		try {
			const bytes = await file.arrayBuffer();
			const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
			app.file = file;
			app.fileName = file.name;
			app.pageCount = doc.getPageCount();
		} catch (e) {
			error = (e as Error).message || 'Could not read that file.';
			app.file = null;
			app.fileName = '';
			app.pageCount = 0;
		}
	}

	function onDrop(ev: DragEvent) {
		ev.preventDefault();
		dragging = false;
		const f = ev.dataTransfer?.files?.[0];
		if (f) ingest(f);
	}

	function onPick(ev: Event) {
		const f = (ev.target as HTMLInputElement).files?.[0];
		if (f) ingest(f);
	}

	function clear() {
		app.file = null;
		app.fileName = '';
		app.pageCount = 0;
		if (inputEl) inputEl.value = '';
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
		return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
	}
</script>

<div
	class="dropzone"
	class:dragging
	class:loaded={!!app.file}
	role="button"
	tabindex="0"
	ondragover={(e) => {
		e.preventDefault();
		dragging = true;
	}}
	ondragleave={() => (dragging = false)}
	ondrop={onDrop}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') inputEl?.click();
	}}
	onclick={() => inputEl?.click()}
>
	<input
		bind:this={inputEl}
		type="file"
		accept="application/pdf,.pdf"
		onchange={onPick}
		class="sr-only"
	/>

	{#if app.file}
		<div class="loaded-content">
			<div class="filemark">PDF</div>
			<div class="file-info">
				<div class="filename" title={app.fileName}>{app.fileName}</div>
				<div class="meta">
					<span>{app.pageCount}&nbsp;slides</span>
					<span class="dot">·</span>
					<span>{formatSize(app.file.size)}</span>
				</div>
			</div>
			<button
				class="clear"
				onclick={(e) => {
					e.stopPropagation();
					clear();
				}}
				aria-label="Remove file"
			>
				×
			</button>
		</div>
	{:else}
		<div class="empty-content">
			<div class="ornament" aria-hidden="true">
				<svg viewBox="0 0 60 80" width="44" height="58">
					<path
						d="M10 6 H42 L50 14 V74 H10 Z"
						fill="none"
						stroke="currentColor"
						stroke-width="1.4"
					/>
					<path
						d="M42 6 V14 H50"
						fill="none"
						stroke="currentColor"
						stroke-width="1.4"
					/>
					<line x1="18" y1="32" x2="42" y2="32" stroke="currentColor" stroke-width="0.8" />
					<line x1="18" y1="40" x2="42" y2="40" stroke="currentColor" stroke-width="0.8" />
					<line x1="18" y1="48" x2="36" y2="48" stroke="currentColor" stroke-width="0.8" />
				</svg>
			</div>
			<div class="prompt">
				<strong>Drop a PDF</strong>
				<span>or tap to browse</span>
			</div>
		</div>
	{/if}

	{#if error}
		<p class="error">{error}</p>
	{/if}
</div>

<style>
	.dropzone {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: 132px;
		padding: 1.25rem 1.5rem;
		background: var(--color-surface);
		border: 1.5px dashed var(--color-rule-strong);
		border-radius: 4px;
		cursor: pointer;
		transition:
			border-color 180ms ease,
			background-color 180ms ease,
			transform 120ms ease;
		color: var(--color-ink-muted);
	}
	.dropzone:hover,
	.dropzone:focus-visible {
		border-color: var(--color-margin);
		color: var(--color-ink);
		outline: none;
	}
	.dropzone.dragging {
		border-color: var(--color-margin);
		background: var(--color-accent-soft);
		color: var(--color-ink);
		transform: scale(1.005);
	}
	.dropzone.loaded {
		border-style: solid;
		border-color: var(--color-rule);
		background: var(--color-surface);
	}

	.empty-content {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.ornament {
		flex-shrink: 0;
		color: var(--color-rule-strong);
	}
	.dropzone:hover .ornament,
	.dropzone.dragging .ornament {
		color: var(--color-margin);
	}
	.prompt {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.prompt strong {
		font-family: var(--font-display);
		font-weight: 500;
		font-size: 1.5rem;
		letter-spacing: -0.01em;
		color: var(--color-ink);
	}
	.prompt span {
		font-size: 0.875rem;
		color: var(--color-ink-muted);
	}

	.loaded-content {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.filemark {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		font-weight: 500;
		letter-spacing: 0.1em;
		padding: 4px 8px;
		background: var(--color-margin);
		color: var(--color-paper);
		border-radius: 2px;
		flex-shrink: 0;
	}
	.file-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.filename {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 500;
		color: var(--color-ink);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		letter-spacing: -0.01em;
	}
	.meta {
		display: flex;
		gap: 8px;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-ink-muted);
		letter-spacing: 0.02em;
	}
	.meta .dot {
		opacity: 0.4;
	}
	.clear {
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		display: grid;
		place-items: center;
		font-size: 1.5rem;
		font-family: var(--font-display);
		background: transparent;
		border: 1px solid var(--color-rule);
		color: var(--color-ink-muted);
		border-radius: 2px;
		cursor: pointer;
		transition: all 120ms ease;
	}
	.clear:hover {
		border-color: var(--color-margin);
		color: var(--color-margin);
	}

	.error {
		margin-top: 8px;
		font-size: 0.8125rem;
		color: var(--color-margin);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
	}
</style>
