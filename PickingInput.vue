<template>
    <div class="emoji-picking-container">
        <div class="emoji-picking-button editor-emoji-button"
             @click="togglePicker"
             ref="trigger"
        >
            <i class="fa fa-smile-o" aria-hidden="true"></i>
        </div>

        <div class="emoji-picking-holder" :style="emojiPosition">
            <transition name="dropdown">
                <emoji-picker v-if="visible"
                              @click-outside="hideIfVisible"
                              @emoji-clicked="emojiPickerSelected"
                ></emoji-picker>
            </transition>
        </div>

        <slot></slot>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                visible: false,

                input: null,

                emojiPosition: {
                    position: 'absolute',
                    top: '30px',
                    left: 'auto',
                    right: '-115px',
                }
            }
        },
        props: {
            fixed: {
                type: Boolean,
                default: false
            }
        },
        mounted () {
            this.input = this.$el.querySelector('textarea,input[type="text"]');
            if(this.input) {
                this._setupEventsOn(this.input);
            }

            EventBus.listen('hide-emoji-picker', this.hideIfVisible);
        },
        methods: {
            hideIfVisible () {
                if(this.visible) {
                    this.hidePicker();

                    this.$nextTick(() => {
                        this.input.focus();
                    });
                }
            },

            emojiPickerSelected (item) {
                this.insertInCaller(this.input, this.getUtf8(item));
            },

            togglePicker () {
                if (this.visible) {
                    this.hidePicker();
                    return;
                }

                this.$nextTick(() => {
                    this.showPicker();
                });
            },

            hidePicker () {
                this.visible = false;
            },

            showPicker () {
                if(this.fixed) {
                    let triggerPosition = this.$refs.trigger.getBoundingClientRect();
                    this.emojiPosition.top = triggerPosition.y + triggerPosition.height + 'px';
                    this.emojiPosition.left = (triggerPosition.left - (275/2) + triggerPosition.width) + 'px';
                    this.emojiPosition.right = 'auto';
                    this.emojiPosition.position = 'fixed';
                }

                this.visible = true;
            },

            insertInCaller(input, item)
            {
                let insertAtCaret = (txtarea, text) => {
                    var scrollPos = txtarea.scrollTop;
                    var caretPos = txtarea.selectionStart;

                    var front = (txtarea.value).substring(0, caretPos);
                    var back = (txtarea.value).substring(txtarea.selectionEnd, txtarea.value.length);
                    txtarea.value = front + text + back;
                    caretPos = caretPos + text.length;
                    txtarea.selectionStart = caretPos;
                    txtarea.selectionEnd = caretPos;
                    txtarea.focus();
                    txtarea.scrollTop = scrollPos;
                };

                try {
                    insertAtCaret(input, item);
                    input.dispatchEvent(new Event('input'));
                }
                catch(e) {
                    input.value += item;
                    input.dispatchEvent(new Event('input'));
                }
            },
            getUtf8(item)
            {
                let unifiedToNative = (unified) => {
                    var unicodes = unified.split('-'),
                            codePoints = unicodes.map((u) => `0x${u}`);

                    return String.fromCodePoint(...codePoints)
                };

                return unifiedToNative(item.unified);
            },

            /**
             * Handle keydown. Used for handling tabs and default input.
             * Tabs will show picker, continuing input will hide it.
             *
             * @param e
             * @private
             */
            _eventKeydown (e) {
                if (e.keyCode == 9) {
                    e.preventDefault();
                    this.showPicker();
                }
                else {
                    if (this.visible) {
                        this.hidePicker();
                    }
                }
            },

            _setupEventsOn (input) {
                input.addEventListener ('keydown', this._eventKeydown);
            }
        }
    }
</script>

<style>
    .emoji-picking-container {
        position: relative;
    }

    .emoji-picking-button {
        position: absolute;
        right: 6px;
        top: 6px;
        z-index: 2;
    }

    .emoji-picking-holder {
        z-index: 99;
    }

    .emoji-picker {
        transform-origin: top;
    }
</style>