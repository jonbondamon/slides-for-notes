<script lang="ts">
	import { app } from '$lib/state.svelte';

	// Stubbed for now; wired with pdf.js in the next step.
</script>

<aside class="preview">
	<header>
		<span class="num">04</span>
		<span class="rule" aria-hidden="true"></span>
		<h2>Preview</h2>
	</header>

	<div class="canvas-wrap">
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
				<p>Upload a deck to see a preview of the first page.</p>
			</div>
		{:else}
			<div class="placeholder">
				<p class="line-1">First output page</p>
				<p class="line-2">Live preview wires in next step.</p>
				<div class="meta">
					<span>{app.fileName}</span>
					<span class="dot">·</span>
					<span>{app.pageCount} slides</span>
				</div>
			</div>
		{/if}
	</div>
</aside>

<style>
	.preview {
		display: flex;
		flex-direction: column;
		gap: 20px;
		height: 100%;
	}
	header {
		display: grid;
		grid-template-columns: auto 1fr auto;
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
	}
	.canvas-wrap {
		flex: 1;
		min-height: 320px;
		background: var(--color-surface);
		border: 1px solid var(--color-rule);
		border-radius: 4px;
		display: grid;
		place-items: center;
		padding: 28px;
		box-shadow: var(--shadow-card);
	}
	.empty,
	.placeholder {
		text-align: center;
		color: var(--color-ink-muted);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
	}
	.empty p {
		font-size: 0.875rem;
		max-width: 280px;
	}
	.line-1 {
		font-family: var(--font-display);
		font-size: 1.5rem;
		color: var(--color-ink);
		margin: 0;
	}
	.line-2 {
		font-size: 0.8125rem;
		margin: 0;
	}
	.meta {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		display: flex;
		gap: 8px;
	}
	.dot {
		opacity: 0.4;
	}
</style>
