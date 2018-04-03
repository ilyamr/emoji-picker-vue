<template>
    <div class="emoji-picker" v-click-outside="handleOutside">
        <div class="emoji-picker_navigation">
            <div :class="['emoji-picker_navigation-item',
                availableCategory && category == activeCategory ? 'emoji-picker_navigation-item__active' : '']"
                 v-for="category in getCategories()"
                 @click="goToCategory(category)"
            >
                <img :src="categoryNavImageSrc(category)" alt="">
            </div>
        </div>

        <input type="text" class="emoji-picker_search" placeholder="Поиск..." v-model="search"
               @keypress.enter="selectFirstSearchEmoji"
               @keyup.esc="emptySearch"
               ref="search"
        >

        <div class="emoji-picker_list"
            @scroll="scroll"
            ref="list"
        >
            <div v-show="!search" class="emoji-picker_emojies-holder" :style="pickerListStyle">
                <category v-for="(category, i) in getCategories()"
                          :key="i"
                          :category-index="i"
                          :name="category"

                          :scroll-top="scrollTop"
                          :emojies-view-height="emojiesViewHeight"
                          :bounds="bounds(category)"

                          :emojies="specialEmojies(category)"
                          @loaded="setCategoryTopPosition"
                          @emoji-clicked="emojiClicked">
                </category>
            </div>
            <div v-if="search">
                <category name="Результаты поиска"
                          :emojies="searchEmojis"
                          @emoji-clicked="emojiClicked"
                >
                </category>
                <div class="emoji-picker_empty-search" v-if="!searchEmojis.length">
                    Emoji по запросу не найдено
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import data from './data';

    import Category from './Category.vue';
    import RecentEmojis from './RecentEmojis';
    import EmojiIndex from './emoji-index';

    let start = null;

    export default {
        beforeMount ()
        {
            if(window.performance) {
              start = performance.now();
            }
        },
        mounted()
        {
            this.recent = RecentEmojis.load();

            setTimeout(() => {
                this._updateHeights();
            }, 1);

            if(window.performance) {
                console.info('emojipicker ready in ', performance.now() - start);
            };

            EventBus.listen('global::on-escape-pressed', () => {
                EventBus.fire('hide-emoji-picker');
            });

            this.search = null;
            this._updateHeights();
            setTimeout(() => {
                this.$refs.search.focus();
            }, 1);
        },
        data()
        {
            return {
                search: null,

                activeCategory: "Recent",
                availableCategory: true,
                categoriesTopPosition: {},

                scrollTop: 0,
                categoryBounds: {},

                recent: {},
            }
        },
        watch: {
            search(value) {
                this.availableCategory = !value;
            }
        },
        props: {
            emojiesInRow: {
                type: Number,
                default: 8
            },

            emojiesViewHeight: {
                type: Number,
                default: 265
            }
        },
        computed: {
            pickerListStyle () {
                if(this.search) return {};

                let height = 0;

                for(let category of this.getCategories()) {
                    if(!this.categoryBounds[category]) {
                        Vue.set(this.categoryBounds, category, {
                            top: height,
                            bottom: 0
                        })
                    }
                    else {
                        this.categoryBounds[category].top = height;
                    }

                    let categoryHeight = 0;

                    categoryHeight += 27;
                    categoryHeight += 30 * Math.ceil(this.category(category).length / this.emojiesInRow);

                    height += categoryHeight;

                    this.categoryBounds[category].bottom = categoryHeight;
                }

                return {
                    'height': height + 'px'
                }
            },
            searchEmojis()
            {
                let emojis = EmojiIndex.search(this.search, 48);
                return emojis.map((item) => {return item.id;})
            }
        },
        methods: {
            bounds(category) {
                return this.categoryBounds[category] || false;
            },
            handleOutside () {
                this.$emit('click-outside');
            },
            setCategoryTopPosition(category, top)
            {
                this.categoriesTopPosition[category] = top;
            },
            specialEmojies(category)
            {
                if(category == 'Recent') {
                    return RecentEmojis.create(this.recent)
                            .getKeys();
                }
            },
            getCategories()
            {
                return [
                    "Recent",
                    "People",
                    "Nature",
                    "Foods",
                    "Activity",
                    "Places",
                    "Objects",
                    "Symbols",
                    "Flags"
                ];
            },
            scroll(e)
            {
                this.scrollTop = e.target.scrollTop;
                this.updateActiveCategory(e.target.scrollTop);
            },
            updateActiveCategory(top)
            {
                let keys = Object.keys(this.categoriesTopPosition).reverse();

                for(let category of keys) {
                    if(top >= this.categoryBounds[category].top) {
                        this.activeCategory = category;
                        return;
                    }
                }
            },
            getEmoji(emoji)
            {
                return data.emojis[emoji];
            },

            categoryNavImageSrc(category)
            {
                return './img/emoji/' + (category.toLowerCase()) + '.svg';
            },

            goToCategory(category)
            {
                this.search = null;
                setTimeout(() => {
                    this.$refs.list.scrollTop = this.categoryBounds[category].top;
                }, 1);
            },

            category(name)
            {
                let cat = [];

                if(name == 'Recent') {
                    return Object.keys(this.recent);
                }
                else {
                    let foundCategory = data.categories.filter((category) => {
                        return category.name == name;
                    });

                    cat = (!foundCategory[0]) ? [] : foundCategory[0].emojis;
                }

                return cat;
            },

            emojiClicked(item)
            {
                RecentEmojis.create(this.recent).add(item);
                this.$emit('emoji-clicked', item);
            },
            selectFirstSearchEmoji()
            {
                if(!this.search || !this.searchEmojis.length) return;

                this.emojiClicked(this.getEmoji(this.searchEmojis[0]));
            },
            emptySearch()
            {
                this.search = null;
            },

            _updateHeights()
            {
                for(let category of this.getCategories()) {
                    this.categoriesTopPosition[category] = document.getElementById('category-' + category).offsetTop;
                }
            }
        },
        components: {
            'category': Category
        }
    }
</script>