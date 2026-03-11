<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils";

	let {
		children,
		class: className,
		...restProps
	}: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={cn("flex items-center gap-1", className)} {...restProps}>
	{@render children?.()}
</div>
