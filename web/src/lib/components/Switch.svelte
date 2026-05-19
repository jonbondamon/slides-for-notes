<script lang="ts">
	interface Props {
		label: string;
		description?: string;
		checked: boolean;
		onchange: (v: boolean) => void;
	}
	let { label, description, checked, onchange }: Props = $props();
</script>

<label class="switch">
	<div class="text">
		<span class="label">{label}</span>
		{#if description}<span class="desc">{description}</span>{/if}
	</div>
	<button
		type="button"
		role="switch"
		aria-checked={checked}
		aria-label={label}
		class="toggle"
		class:on={checked}
		onclick={() => onchange(!checked)}
	>
		<span class="knob"></span>
	</button>
</label>

<style>
	.switch {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
		padding: 8px 0;
		cursor: pointer;
	}
	.text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.label {
		font-family: var(--font-display);
		font-size: 1.0625rem;
		font-weight: 500;
		color: var(--color-ink);
		letter-spacing: -0.01em;
	}
	.desc {
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
	}
	.toggle {
		flex-shrink: 0;
		position: relative;
		width: 52px;
		height: 30px;
		padding: 0;
		background: var(--color-paper-deep);
		border: 1px solid var(--color-rule-strong);
		border-radius: 15px;
		cursor: pointer;
		transition: all 220ms cubic-bezier(0.32, 0.72, 0, 1);
	}
	.toggle.on {
		background: var(--color-ink);
		border-color: var(--color-ink);
	}
	.knob {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 22px;
		height: 22px;
		background: var(--color-paper);
		border-radius: 50%;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		transition: transform 220ms cubic-bezier(0.32, 0.72, 0, 1);
	}
	.toggle.on .knob {
		transform: translateX(22px);
		background: var(--color-margin);
	}
	.toggle:focus-visible {
		outline: 2px solid var(--color-margin);
		outline-offset: 3px;
	}
</style>
