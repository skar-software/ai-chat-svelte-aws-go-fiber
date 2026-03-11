<script lang="ts">
	import * as Code from "$lib/components/ai-elements/code";
	import type { Tokens } from "marked";

	let { token, id }: { token: Tokens.Code; id: string } = $props();

	// Some inline code variants might pass different props, though the type says Tokens.Code
	// Just to be safe, we fall back to raw values if it behaves differently.
	let codeText = $derived(token?.text || "");
	let codeLang = $derived(token?.lang || "plaintext");
</script>

<div class="my-3 flex w-full flex-col">
	<Code.Root code={codeText} lang={codeLang}>
		<Code.Overflow>
			<Code.CopyButton />
		</Code.Overflow>
	</Code.Root>
</div>
