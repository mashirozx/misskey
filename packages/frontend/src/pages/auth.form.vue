<template>
<section class="">
	<div class="">{{ $t('_auth.shareAccess', { name: app.name }) }}</div>
	<div class="">
		<h2>{{ app.name }}</h2>
		<p class="id">{{ app.id }}</p>
		<p class="description">{{ app.description }}</p>
	</div>
	<div class="">
		<h2>{{ $ts._auth.permissionAsk }}</h2>
		<ul>
			<li v-for="p in app.permission" :key="p">{{ $t(`_permissions.${p}`) }}</li>
		</ul>
	</div>
	<div class="">
		<MkButton inline @click="cancel">{{ $ts.cancel }}</MkButton>
		<MkButton inline primary @click="accept">{{ $ts.accept }}</MkButton>
	</div>
</section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os';

export default defineComponent({
	components: {
		MkButton,
	},
	props: ['session'],
	computed: {
		name(): string {
			const el = document.createElement('div');
			el.textContent = this.app.name;
			return el.innerHTML;
		},
		app(): any {
			return this.session.app;
		},
	},
	methods: {
		cancel() {
			os.api('auth/deny', {
				token: this.session.token,
			}).then(() => {
				this.$emit('denied');
			});
		},

		accept() {
			os.api('auth/accept', {
				token: this.session.token,
			}).then(() => {
				this.$emit('accepted');
			});
		},
	},
});
</script>
