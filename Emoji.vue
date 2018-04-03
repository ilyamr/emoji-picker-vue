<template>
    <span @click="emit('click')">
        <span class="emoji-picker-item" :style="style()"></span>
    </span>
</template>

<script>
    const COLS = 48;

    export default {
        props: [
             'item', 'skinVariation'
        ],
        methods: {
            style()
            {
                let bpx = this.item.sheet_x / COLS * 100;
                let bpy = this.item.sheet_y / COLS * 100;
                return {
                    'background-position': `${bpx}% ${bpy}%`
                }
            }
        }
    }
</script>

<style>
    .emoji-picker-item {
        display: inline-block;
        width: 20px;
        height: 20px;
        background-size: 4900%;
        image-rendering: -webkit-optimize-contrast;
        background-image: url("/img/sheet_apple_64_indexed_256.png");
    }
</style>