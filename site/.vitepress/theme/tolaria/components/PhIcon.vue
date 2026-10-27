<script setup lang="ts">
// Phosphor icon (filled weight by default, per the brand rule) from the vendored path data in ../icons.ts.
import { ICONS } from "../icons"
defineProps<{ name: string; size?: number | string }>()
</script>

<template>
  <svg class="tl-icon" viewBox="0 0 256 256" fill="currentColor" :width="size ?? 20" :height="size ?? 20" aria-hidden="true" v-html="ICONS[name] ?? ''" />
</template>

<style>
.tl-icon { flex: none; display: inline-block; }
</style>
