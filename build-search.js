module.exports = data => {
  const search = []

  function renameProp(o, key, newKey, opt_default) {
    o[newKey] = o[key] || opt_default;
    delete o[key];
  }

  var addToSearch = (strings, split) => {
    if (!strings) {
      return
    }

    (Array.isArray(strings) ? strings : [strings]).forEach((string) => {
      (split ? string.split(/[-|_|\s]+/) : [string]).forEach((s) => {
        s = s.toLowerCase()

        if (search.indexOf(s) == -1) {
          search.push(s)
        }
      })
    })
  }

  addToSearch(data.short_names, true)
  addToSearch(data.name, true)
  addToSearch(data.keywords, false)
  addToSearch(data.emoticons, false)

  return search
}
