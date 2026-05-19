<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		num: string;
		title: string;
		children: Snippet;
	}
	let { num, title, children }: Props = $props();
</script>

<section>
	<header>
		<span class="num">{num}</span>
		<span class="rule" aria-hidden="true"></span>
		<h2>{title}</h2>
	</header>
	<div class="body">
		{@render children()}
	</div>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		gap: 14px;
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
		min-width: 16px;
	}
	h2 {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 1rem;
		color: var(--color-ink);
		letter-spacing: 0;
		font-style: italic;
		margin: 0;
	}
	.body {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
</style>
