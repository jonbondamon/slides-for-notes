<script lang="ts">
	interface Props {
		label: string;
		value: number;
		min: number;
		max: number;
		step?: number;
		unit?: string;
		format?: (v: number) => string;
		onchange: (v: number) => void;
	}
	let {
		label,
		value,
		min,
		max,
		step = 0.01,
		unit = '',
		format,
		onchange
	}: Props = $props();

	const formatted = $derived(format ? format(value) : value.toFixed(step >= 1 ? 0 : 2));
	const pct = $derived(((value - min) / (max - min)) * 100);
</script>

<label class="range">
	<div class="head">
		<span class="label">{label}</span>
		<span class="value">
			<span class="num">{formatted}</span>
			{#if unit}<span class="unit">{unit}</span>{/if}
		</span>
	</div>
	<div class="track-wrap" style="--pct: {pct}%">
		<input
			type="range"
			{min}
			{max}
			{step}
			{value}
			oninput={(e) => onchange(+(e.target as HTMLInputElement).value)}
		/>
		<div class="track-bg" aria-hidden="true"></div>
		<div class="track-fill" aria-hidden="true"></div>
	</div>
</label>

<style>
	.range {
		display: block;
	}
	.head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 8px;
	}
	.label {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-ink-muted);
	}
	.value {
		display: flex;
		gap: 3px;
		align-items: baseline;
	}
	.num {
		font-family: var(--font-display);
		font-weight: 500;
		font-size: 1.125rem;
		color: var(--color-ink);
		letter-spacing: -0.01em;
		font-variant-numeric: tabular-nums;
	}
	.unit {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--color-ink-muted);
		letter-spacing: 0.05em;
	}
	.track-wrap {
		position: relative;
		height: 44px;
		display: grid;
		align-items: center;
	}
	.track-bg {
		grid-row: 1;
		grid-column: 1;
		height: 2px;
		background: var(--color-rule-strong);
		border-radius: 1px;
	}
	.track-fill {
		grid-row: 1;
		grid-column: 1;
		height: 2px;
		width: var(--pct);
		background: var(--color-margin);
		border-radius: 1px;
	}
	input[type='range'] {
		grid-row: 1;
		grid-column: 1;
		appearance: none;
		-webkit-appearance: none;
		background: transparent;
		width: 100%;
		height: 44px;
		margin: 0;
		cursor: pointer;
		z-index: 1;
	}
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 24px;
		height: 24px;
		background: var(--color-ink);
		border-radius: 50%;
		cursor: grab;
		border: 3px solid var(--color-paper);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
		transition: transform 100ms ease;
	}
	input[type='range']::-webkit-slider-thumb:active {
		cursor: grabbing;
		transform: scale(1.1);
	}
	input[type='range']::-moz-range-thumb {
		width: 24px;
		height: 24px;
		background: var(--color-ink);
		border-radius: 50%;
		border: 3px solid var(--color-paper);
		cursor: grab;
	}
	input[type='range']:focus-visible::-webkit-slider-thumb {
		outline: 2px solid var(--color-margin);
		outline-offset: 2px;
	}
</style>
