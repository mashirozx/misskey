<template>
<MkWindow :initial-width="640" :initial-height="402" :can-resize="true" :close-button="true">
	<template #header>
		<i class="icon ti ti-brand-youtube" style="margin-right: 0.5em;"></i>
		<span>{{ title ?? 'YouTube' }}</span>
	</template>

	<div class="poamfof">
		<Transition :name="$store.state.animation ? 'fade' : ''" mode="out-in">
			<div v-if="player.url" class="player">
				<iframe v-if="!fetching" :src="player.url + (player.url.match(/\?/) ? '&autoplay=1&auto_play=1' : '?autoplay=1&auto_play=1')" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen/>
			</div>
		</Transition>
		<MkLoading v-if="fetching"/>
		<MkError v-else-if="!player.url" @retry="ytFetch()"/>
	</div>
</MkWindow>
</template>

<script lang="ts" setup>
import MkWindow from '@/components/MkWindow.vue';
import { versatileLang } from '@/scripts/intl-const';

const props = defineProps<{
	url: string;
}>();

const requestUrl = new URL(props.url);

let fetching = $ref(true);
let title = $ref<string | null>(null);
let player = $ref({
	url: null,
	width: null,
	height: null,
});

const ytFetch = (): void => {
	fetching = true;
	window.fetch(`/url?url=${encodeURIComponent(requestUrl.href)}&lang=${versatileLang}`).then(res => {
		res.json().then(info => {
			if (info.url == null) return;
			title = info.title;
			fetching = false;
			player = info.player;
		});
	});
};

ytFetch();

</script>

<style lang="scss">
.poamfof {
	position: relative;
	overflow: hidden;
	height: 100%;

	.player {
		position: absolute;
		inset: 0;

		iframe {
			width: 100%;
			height: 100%;
		}
	}
}
</style>
