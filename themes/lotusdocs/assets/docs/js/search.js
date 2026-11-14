'use strict'

var searchFunc = function (path, searchInputID, contentID, collapseID, clearBtn, closeBtn, maxResult) {
    fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`)
            }
            return response.text()
        })
        .then(xmlText => {
            const searchInput = document.getElementById(searchInputID)
            const resultContent = document.getElementById(contentID)

            if (!searchInput || !resultContent) {
                return
            }

            const searchContainer = document.getElementById(collapseID)
            const searchContainerCollapse = new Modal(searchContainer, { toggle: false })

            if (searchInput !== null) {
                document.addEventListener('keydown', inputFocus)
                searchContainer.addEventListener('shown.bs.modal', () => {
                    searchInput.focus()
                })

                let topHeader = document.getElementById('top-header')
                document.addEventListener('click', (elem) => {
                    if (!searchContainer.contains(elem.target) && !topHeader.contains(elem.target))
                        searchContainerCollapse.hide()
                })
            }

            const hideSearchBtn = document.getElementById(clearBtn)
            hideSearchBtn.addEventListener('click', () => {
                searchInput.value = ''
                hideSearchBtn.classList.add('d-none')
            })

            const closeSearchBtn = document.getElementById(closeBtn)
            closeSearchBtn.addEventListener('click', () => {
                searchInput.value = ''
                searchContainerCollapse.hide()
            })

            function inputFocus (e) {
                if ((e.ctrlKey && e.key === '/') || (e.metaKey && e.key === '/')) {
                    e.preventDefault()
                    searchContainerCollapse.toggle()
                }
                if (e.key === 'Escape' ) {
                    searchInput.value = ''
                    searchInput.blur()
                    searchContainerCollapse.hide()
                }
            }

            document.addEventListener('click', function(event) {
                let isClickInsideElement = resultContent.contains(event.target)
                if (!isClickInsideElement) {
                    resultContent.classList.add('d-none')
                }
            })

            document.addEventListener('keydown', (e) => {
                const suggestionsHidden = resultContent.classList.contains('d-none')
                if (suggestionsHidden) {
                    return
                }

                const focusableSuggestions = [...resultContent.querySelectorAll('a')]
                if (focusableSuggestions.length === 0) {
                    return
                }

                const index = focusableSuggestions.indexOf(document.activeElement)

                if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    const nextIndex = index > 0 ? index - 1 : 0
                    focusableSuggestions[nextIndex].focus()
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    const nextIndex= index + 1 < focusableSuggestions.length ? index + 1 : index
                    focusableSuggestions[nextIndex].focus()
                }
            })

            const parser = new DOMParser()
            const xmlResponse = parser.parseFromString(xmlText, 'application/xml')

            const searchEntries = Array.from(xmlResponse.querySelectorAll('item')).map(entry => ({
                title: entry.querySelector('title')?.textContent || '',
                content: entry.querySelector('content')?.textContent || '',
                link: entry.querySelector('url')?.textContent || '',
                artist: entry.querySelector('author')?.textContent || '',
                icon: entry.querySelector('icon')?.textContent || '',
                breadcrumb: entry.querySelector('breadcrumb')?.textContent || '',
            }))

            searchInput.addEventListener('input', function () {
                if (this.value) {
                    hideSearchBtn.classList.remove('d-none')
                } else {
                    hideSearchBtn.classList.add('d-none')
                }

                const keywords = this.value.trim().toLowerCase().split(/[\s\-]+/)

                resultContent.innerHTML = ''
                resultContent.classList.remove('d-none')

                if (this.value.trim().length <= 0) {
                    return
                }

                for (let entry of searchEntries) {
                    let isMatch = true
                    let indexTitle = -1

                    const entryTitle = entry.title.trim().toLowerCase()

                    if (entryTitle !== '') {
                        keywords.forEach((keyword, i) => {
                            indexTitle = entryTitle.toLowerCase().indexOf(keyword.toLowerCase())
                            if (indexTitle < 0) {
                                isMatch = false
                            }
                        })
                    }

                    if (isMatch) {
                        const resEntry = document.createElement('div')
                        resultContent.appendChild(resEntry)

                        const a = document.createElement('a')
                        a.href = entry.link
                        resEntry.appendChild(a)

                        const icon = document.createElement('i')
                        icon.textContent = entry.icon
                        icon.classList.add('suggestion__icon')
                        icon.classList.add('material-icons')
                        a.appendChild(icon)

                        let highlight = `<span class="suggestion__description__normal">${entry.breadcrumb}</span>`
                        keywords.forEach(keyword => {
                            const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                            const regex = new RegExp(`(${escaped})`, 'gi')

                            highlight = highlight.replace(
                                regex,
                                '</span><mark class="suggestion__description__highlight p-0 bg-transparent">$1</mark><span class="suggestion__description__normal">'
                            )
                        })

                        const description = document.createElement('span')
                        description.innerHTML = highlight
                        description.classList.add('suggestion__description')
                        a.appendChild(description)

                        const enter = document.createElement('i')
                        enter.textContent = 'subdirectory_arrow_left'
                        enter.classList.add('suggestion__enter')
                        enter.classList.add('material-icons')
                        a.appendChild(enter)

                        if (resultContent.childElementCount == maxResult) {
                            break
                        }
                    }
                }

                if (resultContent.childElementCount == 0) {
                    const noResultEntry = document.createElement('div')
                    noResultEntry.classList.add("suggestion__no-results");

                    const noResultIcon = document.createElement('span')
                    noResultIcon.classList.add("suggestion__no-results_icon");
                    noResultIcon.innerHTML = ':('
                    noResultEntry.appendChild(noResultIcon)

                    const noResultsMessage = document.createElement('span')
                    noResultsMessage.innerHTML = `找不到關於「<strong>${keywords}</strong>」的歌曲/專輯/歌手`
                    noResultEntry.appendChild(noResultsMessage)

                    suggestions.appendChild(noResultEntry);
                    return;
                }
            })
        })
        .catch(error => {
            console.error('Search data loading failed:', error)
        })
}
