<script lang="ts">
	import { hexToRgb, rgbToHex, type RgbColor } from '$lib/transform';

	interface Props {
		label: string;
		value: RgbColor;
		onchange: (v: RgbColor) => void;
	}
	let { label, value, onchange }: Props = $props();

	const presets = ['#B8B8B8', '#5F574B', '#2A3F6B', '#3F6B47', '#C0392B', '#1A1814'];
	const currentHex = $derived(rgbToHex(value).toUpperCase());
</script>

<div class="color">
	<div class="head">
		<span class="label">{label}</span>
		<span class="hex">{currentHex}</span>
	</div>
	<div class="swatches">
		{#each presets as p (p)}
			<button
				type="button"
				class="swatch"
				class:selected={currentHex.toLowerCase() === p.toLowerCase()}
				style="background: {p}"
				onclick={() => onchange(hexToRgb(p))}
				aria-label={`Set color to ${p}`}
			></button>
		{/each}
		<label class="custom" aria-label="Custom color">
			<input
				type="color"
				value={currentHex}
				oninput={(e) => onchange(hexToRgb((e.target as HTMLInputElement).value))}
			/>
			<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
				<path d="M2 14 L8 8 L14 14 M8 2 V8" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" />
			</svg>
		</label>
	</div>
</div>

<style>
	.color {
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
	.hex {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-ink);
		letter-spacing: 0.05em;
	}
	.swatches {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	.swatch {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 1.5px solid var(--color-rule);
		cursor: pointer;
		padding: 0;
		transition: all 120ms ease;
	}
	.swatch:hover {
		transform: scale(1.08);
	}
	.swatch.selected {
		border-color: var(--color-ink);
		box-shadow: 0 0 0 2px var(--color-paper), 0 0 0 4px var(--color-margin);
	}
	.custom {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 1.5px dashed var(--color-rule-strong);
		display: grid;
		place-items: center;
		cursor: pointer;
		color: var(--color-ink-muted);
		transition: all 120ms ease;
	}
	.custom:hover {
		border-color: var(--color-margin);
		color: var(--color-margin);
	}
	.custom input[type='color'] {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		pointer-events: none;
	}
</style>
