<template>
    <div class="emoji-picker_category" :id="'category-' + name">
        <div class="emoji-picker_category-title sticky"
             v-if="isCategoryTitleVisible()"
             :style="categoryStyle"
        >{{ name }}</div>
        <div class="emoji-picker_category-list">
            <span v-for="(item, i) in category(name)"
                  class="emoji-picker_emoji"
                  v-if="isEmojiVisible(i)"
                  :style="emojiStyle(i)"
                  :title="item.name"
                  @click="emojiClicked(item)"
            >
                <span class="emoji-picker-item"
                      :style="style(item)"
                ></span>
            </span>
        </div>
    </div>
</template>

<script>
    let Stickyfill = require('stickyfill')();

    import data from './data';
    import Emoji from './Emoji.vue';

    const COLS = 48;

    export default {
        mounted()
        {
            var stickyElements = document.getElementsByClassName('sticky');

            for (var i = stickyElements.length - 1; i >= 0; i--) {
                Stickyfill.add(stickyElements[i]);
            }
        },
        props: {
            categoryIndex: {
                type: Number,
                default: 0
            },
            name: {
                type: String,
                required: true
            },
            emojies: {
                default: false
            },

            emojiesInRow: {
                type: Number,
                default: 8
            },
            emojiesViewHeight: {
                type: Number,
                default: 265
            },
            scrollTop: {
                type: Number,
                default: -1
            },
            bounds: {
                type: Object,
                default () {
                    return {}
                }
            }
        },
        computed: {
            categoryStyle () {
                if(this.scrollTop === -1) return {};

                return {
                    position: 'absolute',
                    top: this.bounds.top + 'px'
                }
            }
        },
        methods: {
            isCategoryTitleVisible () {
                if(this.scrollTop === -1) return true;

                try {
                    return this.scrollTop + this.emojiesViewHeight > this.bounds.top
                        && this.scrollTop <= this.bounds.top + 30;
                }
                catch (e) {
                    console.error(e);
                    return true;
                }
            },

            emojiStyle (emojiIndex) {
                if(this.scrollTop === -1) return {};

                try {
                    let row = Math.floor(emojiIndex / this.emojiesInRow);

                    return {
                        position: 'absolute',
                        display: 'inline-block',
                        top: (27 + row * 30 + this.bounds.top) + 'px',
                        left: ((emojiIndex % this.emojiesInRow) * 30) + 'px',
                    };
                }
                catch (e) {
                    console.error(e);
                    return {};
                }
            },

            isEmojiVisible (emojiIndex) {
                if(this.scrollTop === -1) return true;

                try {
                    let row = Math.floor(emojiIndex / this.emojiesInRow);

                    return this.scrollTop + this.emojiesViewHeight > 27 + row * 30 + this.bounds.top
                            && this.scrollTop <= 27 + row * 30 + this.bounds.top + 30;
                }
                catch (e) {
                    console.error(e);
                    return true;
                }
            },

            category(name)
            {
                let cat = [];

                if(this.emojies) {
                    cat = this.emojies;
                }
                else {
                    let foundCategory = data.categories.filter((category) => {
                        return category.name == name;
                    });

                    cat = (!foundCategory[0]) ? [] : foundCategory[0].emojis;
                }

                return cat.map((emoji) => {
                    return this.getEmoji(emoji)
                });
            },
            style(item)
            {
                let bpx = item.sheet_x / COLS * 100;
                let bpy = item.sheet_y / COLS * 100;
                return {
                    'background-position': `${bpx}% ${bpy}%`
                }
            },
            getEmoji(emoji)
            {
                return data.emojis[emoji];
            },

            emojiClicked(item)
            {
                this.$emit('emoji-clicked', item);
            },

            _getTopPosition()
            {
                return this.$el.offsetTop;
            }
        },
        components: {
            'emoji': Emoji
        }
    }
</script>
<style>
    .emoji-picker-item {
        display: inline-block;
        width: 22px;
        height: 22px;
        background-size: 4900%;
        background-image: url("/img/sheet_apple_64_indexed_256.png");
    }
</style>