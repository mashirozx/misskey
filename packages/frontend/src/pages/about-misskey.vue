<template>
<MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<div style="overflow: clip;">
		<MkSpacer :content-max="600" :margin-min="20">
			<div class="_gaps_m znqjceqz">
				<div v-panel class="about">
					<div ref="containerEl" class="container" :class="{ playing: easterEggEngine != null }">
						<img src="/client-assets/about-icon.png" alt="" class="icon" draggable="false" @load="iconLoaded" @click="gravity"/>
						<div class="misskey">Misskey</div>
						<div class="version">v{{ version }}</div>
						<span v-for="emoji in easterEggEmojis" :key="emoji.id" class="emoji" :data-physics-x="emoji.left" :data-physics-y="emoji.top" :class="{ _physics_circle_: !emoji.emoji.startsWith(':') }"><MkEmoji class="emoji" :emoji="emoji.emoji" :is-reaction="false" :normal="true" :no-style="true"/></span>
					</div>
					<button v-if="thereIsTreasure" class="_button treasure" @click="getTreasure"><img src="/fluent-emoji/1f3c6.png" class="treasureImg"></button>
				</div>
				<div style="text-align: center;">
					{{ i18n.ts._aboutMisskey.about }}<br><a href="https://misskey-hub.net/docs/misskey.html" target="_blank" class="_link">{{ i18n.ts.learnMore }}</a>
				</div>
				<div style="text-align: center;">
					<MkButton primary rounded inline @click="iLoveMisskey">I <Mfm text="$[jelly ❤]"/> #Misskey</MkButton>
				</div>
				<FormSection>
					<div class="_formLinks">
						<FormLink to="https://github.com/misskey-dev/misskey" external>
							<template #icon><i class="ti ti-code"></i></template>
							{{ i18n.ts._aboutMisskey.source }}
							<template #suffix>GitHub</template>
						</FormLink>
						<FormLink to="https://crowdin.com/project/misskey" external>
							<template #icon><i class="ti ti-language-hiragana"></i></template>
							{{ i18n.ts._aboutMisskey.translation }}
							<template #suffix>Crowdin</template>
						</FormLink>
						<FormLink to="https://www.patreon.com/syuilo" external>
							<template #icon><i class="ti ti-pig-money"></i></template>
							{{ i18n.ts._aboutMisskey.donate }}
							<template #suffix>Patreon</template>
						</FormLink>
					</div>
				</FormSection>
				<FormSection>
					<template #label>{{ i18n.ts._aboutMisskey.contributors }}</template>
					<div class="_formLinksGrid">
						<FormLink to="https://github.com/syuilo" external>@syuilo</FormLink>
						<FormLink to="https://github.com/tamaina" external>@tamaina</FormLink>
						<FormLink to="https://github.com/acid-chicken" external>@acid-chicken</FormLink>
						<FormLink to="https://github.com/rinsuki" external>@rinsuki</FormLink>
					</div>
					<template #caption><MkLink url="https://github.com/misskey-dev/misskey/graphs/contributors">{{ i18n.ts._aboutMisskey.allContributors }}</MkLink></template>
				</FormSection>
				<FormSection>
					<template #label><Mfm text="$[jelly ❤]"/> {{ i18n.ts._aboutMisskey.patrons }}</template>
					<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); grid-gap: 12px;">
						<div v-for="patron in patrons" :key="patron">{{ patron }}</div>
					</div>
					<p>{{ i18n.ts._aboutMisskey.morePatrons }}</p>
				</FormSection>
			</div>
		</MkSpacer>
	</div>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount } from 'vue';
import { version } from '@/config';
import FormLink from '@/components/form/link.vue';
import FormSection from '@/components/form/section.vue';
import MkButton from '@/components/MkButton.vue';
import MkLink from '@/components/MkLink.vue';
import { physics } from '@/scripts/physics';
import { i18n } from '@/i18n';
import { defaultStore } from '@/store';
import * as os from '@/os';
import { definePageMetadata } from '@/scripts/page-metadata';
import { claimAchievement, claimedAchievements } from '@/scripts/achievements';
import { $i } from '@/account';

const patrons = [
	'まっちゃとーにゅ',
	'mametsuko',
	'noellabo',
	'AureoleArk',
	'Gargron',
	'Nokotaro Takeda',
	'Suji Yan',
	'oi_yekssim',
	'regtan',
	'Hekovic',
	'nenohi',
	'Gitmo Life Services',
	'naga_rus',
	'Efertone',
	'Melilot',
	'motcha',
	'nanami kan',
	'sevvie Rose',
	'Hayato Ishikawa',
	'Puniko',
	'skehmatics',
	'Quinton Macejkovic',
	'YUKIMOCHI',
	'dansup',
	'mewl hayabusa',
	'Emilis',
	'Fristi',
	'makokunsan',
	'chidori ninokura',
	'Peter G.',
	'見当かなみ',
	'natalie',
	'Maronu',
	'Steffen K9',
	'takimura',
	'sikyosyounin',
	'Nesakko',
	'YuzuRyo61',
	'blackskye',
	'sheeta.s',
	'osapon',
	'public_yusuke',
	'CG',
	'吴浥',
	't_w',
	'Jerry',
	'nafuchoco',
	'Takumi Sugita',
	'GLaTAN',
	'mkatze',
	'kabo2468y',
	'mydarkstar',
	'Roujo',
	'DignifiedSilence',
	'uroco @99',
	'totokoro',
	'うし',
	'kiritan',
	'weepjp',
	'Liaizon Wakest',
	'Duponin',
	'Blue',
	'Naoki Hirayama',
	'wara',
	'Wataru Manji (manji0)',
	'みなしま',
	'kanoy',
	'xianon',
	'Denshi',
	'Osushimaru',
	'にょんへら',
	'おのだい',
	'Leni',
	'oss',
	'Weeble',
	'蝉暮せせせ',
	'ThatOneCalculator',
	'pixeldesu',
];

let thereIsTreasure = $ref($i && !claimedAchievements.includes('foundTreasure'));

let easterEggReady = false;
let easterEggEmojis = $ref([]);
let easterEggEngine = $ref(null);
const containerEl = $shallowRef<HTMLElement>();

function iconLoaded() {
	const emojis = defaultStore.state.reactions;
	const containerWidth = containerEl.offsetWidth;
	for (let i = 0; i < 32; i++) {
		easterEggEmojis.push({
			id: i.toString(),
			top: -(128 + (Math.random() * 256)),
			left: (Math.random() * containerWidth),
			emoji: emojis[Math.floor(Math.random() * emojis.length)],
		});
	}

	nextTick(() => {
		easterEggReady = true;
	});
}

function gravity() {
	if (!easterEggReady) return;
	easterEggReady = false;
	easterEggEngine = physics(containerEl);
}

function iLoveMisskey() {
	os.post({
		initialText: 'I $[jelly ❤] #Misskey',
		instant: true,
	});
}

function getTreasure() {
	thereIsTreasure = false;
	claimAchievement('foundTreasure');
}

onBeforeUnmount(() => {
	if (easterEggEngine) {
		easterEggEngine.stop();
	}
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.aboutMisskey,
	icon: null,
});
</script>

<style lang="scss" scoped>
.znqjceqz {
	> .about {
		position: relative;
		border-radius: var(--radius);

		> .treasure {
			position: absolute;
			top: 60px;
			left: 0;
			right: 0;
			margin: 0 auto;
			width: min-content;

			> .treasureImg {
				width: 25px;
				vertical-align: bottom;
			}
		}

		> .container {
			position: relative;
			text-align: center;
			padding: 16px;

			&.playing {
				&, * {
					user-select: none;
				}

				* {
					will-change: transform;
				}

				> .emoji {
					visibility: visible;
				}
			}

			> .icon {
				display: block;
				width: 80px;
				margin: 0 auto;
				border-radius: 16px;
				position: relative;
				z-index: 1;
			}

			> .misskey {
				margin: 0.75em auto 0 auto;
				width: max-content;
				position: relative;
				z-index: 1;
			}

			> .version {
				margin: 0 auto;
				width: max-content;
				opacity: 0.5;
				position: relative;
				z-index: 1;
			}

			> .emoji {
				position: absolute;
				z-index: 1;
				top: 0;
				left: 0;
				visibility: hidden;

				> .emoji {
					pointer-events: none;
					font-size: 24px;
					width: 24px;
				}
			}
		}
	}
}
</style>
