<script lang="ts">
	import { app } from '$lib/state.svelte';
	import type { Layout } from '$lib/transform';

	const options: { value: Layout; label: string; tagline: string }[] = [
		{
			value: 'extend',
			label: 'Extend right',
			tagline: 'One slide per page, notes on the right.'
		},
		{
			value: '3up',
			label: 'Handout',
			tagline: 'Three slides per Letter page, with notes.'
		},
		{
			value: 'all',
			label: 'One tall page',
			tagline: 'Every slide stacked into a single page.'
		}
	];
</script>

<div class="grid">
	{#each options as opt (opt.value)}
		<button
			type="button"
			class="card"
			class:selected={app.options.layout === opt.value}
			onclick={() => (app.options.layout = opt.value)}
		>
			<div class="diagram" aria-hidden="true">
				{#if opt.value === 'extend'}
					<svg viewBox="0 0 120 60">
						<rect x="4" y="6" width="52" height="48" fill="var(--color-paper-deep)" stroke="var(--color-ink)" stroke-width="1" />
						<rect x="62" y="6" width="54" height="48" fill="none" stroke="var(--color-rule-strong)" stroke-width="0.8" stroke-dasharray="2 2" />
						<line x1="66" y1="14" x2="112" y2="14" stroke="var(--color-rule-strong)" stroke-width="0.5" />
						<line x1="66" y1="22" x2="112" y2="22" stroke="var(--color-rule-strong)" stroke-width="0.5" />
						<line x1="66" y1="30" x2="112" y2="30" stroke="var(--color-rule-strong)" stroke-width="0.5" />
						<line x1="66" y1="38" x2="112" y2="38" stroke="var(--color-rule-strong)" stroke-width="0.5" />
						<line x1="66" y1="46" x2="112" y2="46" stroke="var(--color-rule-strong)" stroke-width="0.5" />
					</svg>
				{:else if opt.value === '3up'}
					<svg viewBox="0 0 120 60">
						{#each [4, 22, 40] as y}
							<rect x="20" y={y} width="38" height="14" fill="var(--color-paper-deep)" stroke="var(--color-ink)" stroke-width="0.8" />
							<rect x="62" y={y} width="38" height="14" fill="none" stroke="var(--color-rule-strong)" stroke-width="0.6" stroke-dasharray="1.5 1.5" />
							<line x1="64" y1={y + 4} x2="98" y2={y + 4} stroke="var(--color-rule-strong)" stroke-width="0.4" />
							<line x1="64" y1={y + 8} x2="98" y2={y + 8} stroke="var(--color-rule-strong)" stroke-width="0.4" />
							<line x1="64" y1={y + 12} x2="98" y2={y + 12} stroke="var(--color-rule-strong)" stroke-width="0.4" />
						{/each}
					</svg>
				{:else}
					<svg viewBox="0 0 120 60">
						{#each [3, 14, 25, 36, 47] as y}
							<rect x="20" y={y} width="34" height="9" fill="var(--color-paper-deep)" stroke="var(--color-ink)" stroke-width="0.7" />
							<rect x="58" y={y} width="42" height="9" fill="none" stroke="var(--color-rule-strong)" stroke-width="0.5" stroke-dasharray="1.5 1.5" />
							<line x1="61" y1={y + 3} x2="97" y2={y + 3} stroke="var(--color-rule-strong)" stroke-width="0.3" />
							<line x1="61" y1={y + 6} x2="97" y2={y + 6} stroke="var(--color-rule-strong)" stroke-width="0.3" />
						{/each}
					</svg>
				{/if}
			</div>
			<div class="text">
				<div class="label">{opt.label}</div>
				<div class="tagline">{opt.tagline}</div>
			</div>
			<div class="mark" aria-hidden="true">
				{#if app.options.layout === opt.value}●{:else}○{/if}
			</div>
		</button>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		gap: 10px;
	}
	.card {
		position: relative;
		display: grid;
		grid-template-columns: 80px 1fr auto;
		gap: 14px;
		align-items: center;
		padding: 12px 14px;
		background: var(--color-surface);
		border: 1px solid var(--color-rule);
		border-radius: 3px;
		text-align: left;
		cursor: pointer;
		transition: all 160ms ease;
		min-height: 64px;
	}
	.card:hover {
		border-color: var(--color-rule-strong);
		transform: translateY(-1px);
	}
	.card.selected {
		border-color: var(--color-ink);
		background: var(--color-paper-deep);
		box-shadow: var(--shadow-paper);
	}
	.diagram {
		display: grid;
		place-items: center;
	}
	.diagram :global(svg) {
		width: 80px;
		height: 40px;
	}
	.text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.label {
		font-family: var(--font-display);
		font-weight: 500;
		font-size: 1.0625rem;
		color: var(--color-ink);
		letter-spacing: -0.01em;
	}
	.tagline {
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		line-height: 1.3;
	}
	.mark {
		font-family: var(--font-display);
		font-size: 1.25rem;
		color: var(--color-ink);
		opacity: 0.5;
	}
	.card.selected .mark {
		opacity: 1;
		color: var(--color-margin);
	}
</style>
