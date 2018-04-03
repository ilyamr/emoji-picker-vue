export default

class RecentEmojis
{
    constructor(list)
    {
        this.list = list;
    }

    getKeys()
    {
        return Object.keys(this.list).sort((a,b) => {
            return this.list[a] - this.list[b];
        }).reverse();
    }

    add(item)
    {
        let emojiName = item.short_names[0];
        let weight = 1;

        let keys = Object.keys(this.list).sort((a,b) => {
            return this.list[a] - this.list[b];
        }).reverse();

        // if more than limit
        if(Object.keys(this.list).length >= 16 && !this.list[emojiName]) {
            for(let i = 16 - 6; i < 16; i++) {
                let emoji = keys[i];
                this.list[emoji] = 16 - i;
            }
            delete this.list[keys[15]];

            weight = 6;
        }
        // set last 5 to 1, remove last and add new with 2

        Vue.set(this.list, emojiName, this.list[emojiName] ?
            (this.list[emojiName] + 1 > 100 ? 100 : this.list[emojiName] + 1)
            : weight);

        this.save();

        return this;
    }

    save()
    {
        let sortedList = {};
        let keys = Object.keys(this.list).sort((a,b) => {
            return this.list[a] - this.list[b];
        }).reverse();
        for(let key of keys) {
            sortedList[key] = this.list[key];
        }
        this.list = sortedList;
        localStorage.setItem("emoji-picker-recent", JSON.stringify(this.list));
    }

    static getDefault()
    {
        return {
            "raised_hands": 6,
            "clap": 6,
            "heart_eyes_cat": 6,
            "japanese_goblin": 6,
            "scream": 6,
            "sunglasses": 6,
            "innocent": 6,
            "smiley": 6,
        }
    }

    static load()
    {
        let recentItems = localStorage.getItem("emoji-picker-recent");

        if(!recentItems) {
            return RecentEmojis.getDefault();
        }

        try {
            return JSON.parse(recentItems);
        } catch (e) {}

        return RecentEmojis.getDefault();
    }

    static create(list)
    {
        return new RecentEmojis(list);
    }
}