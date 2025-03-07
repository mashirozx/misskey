<template>
<MkStickyContainer>
	<template #header><XHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :content-max="700" :margin-min="16" :margin-max="32">
		<FormSuspense :p="init">
			<div class="_gaps_m">
				<MkSwitch v-model="useObjectStorage">{{ i18n.ts.useObjectStorage }}</MkSwitch>

				<template v-if="useObjectStorage">
					<MkInput v-model="objectStorageBaseUrl">
						<template #label>{{ i18n.ts.objectStorageBaseUrl }}</template>
						<template #caption>{{ i18n.ts.objectStorageBaseUrlDesc }}</template>
					</MkInput>

					<MkInput v-model="objectStorageBucket">
						<template #label>{{ i18n.ts.objectStorageBucket }}</template>
						<template #caption>{{ i18n.ts.objectStorageBucketDesc }}</template>
					</MkInput>

					<MkInput v-model="objectStoragePrefix">
						<template #label>{{ i18n.ts.objectStoragePrefix }}</template>
						<template #caption>{{ i18n.ts.objectStoragePrefixDesc }}</template>
					</MkInput>

					<MkInput v-model="objectStorageEndpoint">
						<template #label>{{ i18n.ts.objectStorageEndpoint }}</template>
						<template #caption>{{ i18n.ts.objectStorageEndpointDesc }}</template>
					</MkInput>

					<MkInput v-model="objectStorageRegion">
						<template #label>{{ i18n.ts.objectStorageRegion }}</template>
						<template #caption>{{ i18n.ts.objectStorageRegionDesc }}</template>
					</MkInput>

					<FormSplit :min-width="280">
						<MkInput v-model="objectStorageAccessKey">
							<template #prefix><i class="ti ti-key"></i></template>
							<template #label>Access key</template>
						</MkInput>

						<MkInput v-model="objectStorageSecretKey">
							<template #prefix><i class="ti ti-key"></i></template>
							<template #label>Secret key</template>
						</MkInput>
					</FormSplit>

					<MkSwitch v-model="objectStorageUseSSL">
						<template #label>{{ i18n.ts.objectStorageUseSSL }}</template>
						<template #caption>{{ i18n.ts.objectStorageUseSSLDesc }}</template>
					</MkSwitch>

					<MkSwitch v-model="objectStorageUseProxy">
						<template #label>{{ i18n.ts.objectStorageUseProxy }}</template>
						<template #caption>{{ i18n.ts.objectStorageUseProxyDesc }}</template>
					</MkSwitch>

					<MkSwitch v-model="objectStorageSetPublicRead">
						<template #label>{{ i18n.ts.objectStorageSetPublicRead }}</template>
					</MkSwitch>

					<MkSwitch v-model="objectStorageS3ForcePathStyle">
						<template #label>s3ForcePathStyle</template>
					</MkSwitch>
				</template>
			</div>
		</FormSuspense>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { } from 'vue';
import XHeader from './_header_.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkInput from '@/components/MkInput.vue';
import FormSuspense from '@/components/form/suspense.vue';
import FormSplit from '@/components/form/split.vue';
import FormSection from '@/components/form/section.vue';
import * as os from '@/os';
import { fetchInstance } from '@/instance';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

let useObjectStorage: boolean = $ref(false);
let objectStorageBaseUrl: string | null = $ref(null);
let objectStorageBucket: string | null = $ref(null);
let objectStoragePrefix: string | null = $ref(null);
let objectStorageEndpoint: string | null = $ref(null);
let objectStorageRegion: string | null = $ref(null);
let objectStoragePort: number | null = $ref(null);
let objectStorageAccessKey: string | null = $ref(null);
let objectStorageSecretKey: string | null = $ref(null);
let objectStorageUseSSL: boolean = $ref(false);
let objectStorageUseProxy: boolean = $ref(false);
let objectStorageSetPublicRead: boolean = $ref(false);
let objectStorageS3ForcePathStyle: boolean = $ref(true);

async function init() {
	const meta = await os.api('admin/meta');
	useObjectStorage = meta.useObjectStorage;
	objectStorageBaseUrl = meta.objectStorageBaseUrl;
	objectStorageBucket = meta.objectStorageBucket;
	objectStoragePrefix = meta.objectStoragePrefix;
	objectStorageEndpoint = meta.objectStorageEndpoint;
	objectStorageRegion = meta.objectStorageRegion;
	objectStoragePort = meta.objectStoragePort;
	objectStorageAccessKey = meta.objectStorageAccessKey;
	objectStorageSecretKey = meta.objectStorageSecretKey;
	objectStorageUseSSL = meta.objectStorageUseSSL;
	objectStorageUseProxy = meta.objectStorageUseProxy;
	objectStorageSetPublicRead = meta.objectStorageSetPublicRead;
	objectStorageS3ForcePathStyle = meta.objectStorageS3ForcePathStyle;
}

function save() {
	os.apiWithDialog('admin/update-meta', {
		useObjectStorage,
		objectStorageBaseUrl,
		objectStorageBucket,
		objectStoragePrefix,
		objectStorageEndpoint,
		objectStorageRegion,
		objectStoragePort,
		objectStorageAccessKey,
		objectStorageSecretKey,
		objectStorageUseSSL,
		objectStorageUseProxy,
		objectStorageSetPublicRead,
		objectStorageS3ForcePathStyle,
	}).then(() => {
		fetchInstance();
	});
}

const headerActions = $computed(() => [{
	asFullButton: true,
	icon: 'ti ti-check',
	text: i18n.ts.save,
	handler: save,
}]);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.objectStorage,
	icon: 'ti ti-cloud',
});
</script>
