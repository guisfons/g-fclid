document.addEventListener('DOMContentLoaded', function () {
  function setLocalStorageWithExpiry(key, value, ttl) {
    var now = new Date()
    var item = {
      value: value,
      expiry: now.getTime() + ttl
    }
    localStorage.setItem(key, JSON.stringify(item))
  }

  function getLocalStorageWithExpiry(key) {
    var itemStr = localStorage.getItem(key)
    if (!itemStr) {
      return null
    }
    var item = JSON.parse(itemStr)
    var now = new Date()
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key)
      return null
    }
    return item.value
  }

  function storeAllUrlParams() {
    var urlParams = new URLSearchParams(window.location.search)
    var ttl = 45 * 24 * 60 * 60 * 1000 // 45 days in milliseconds

    urlParams.forEach(function (value, key) {
      var storedValue = getLocalStorageWithExpiry(key)
      if (storedValue !== value) {
        setLocalStorageWithExpiry(key, value, ttl)
      }
    })
  }

  storeAllUrlParams()

  function getAllStoredParams() {
    var url = ''
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i)
      var value = getLocalStorageWithExpiry(key)
      if (value) {
        url += key + '=' + value + '&'
      }
    }
    return url.slice(0, -1) // Remove the trailing '&'
  }

  function changeFormAction() {
    var cubilisReservationForms = document.querySelectorAll('form[action^="https://reservations.cubilis.eu"]')
    var cubilisReservationLinks = document.querySelectorAll('a[href^="https://reservations.cubilis.eu"]')
    var hoteliersReservationLinks = document.querySelectorAll('a[href^="https://ibe.hoteliers.guru"]')
    var hoteliersReservationForms = document.querySelectorAll('form[action^="https://ibe.hoteliers.guru"]')
    var url = getAllStoredParams()

    // Cubilis
    if (cubilisReservationForms.length > 0) {
      Array.from(cubilisReservationForms).forEach(function (reservationForm) {
        reservationForm.querySelector('#startdate').setAttribute('required', 'required')
        reservationForm.querySelector('#enddate').setAttribute('required', 'required')
        reservationForm.action += '?' + url
      })
    }

    if (cubilisReservationLinks.length > 0) {
      Array.from(cubilisReservationLinks).forEach(function (reservationLink) {
        reservationLink.href += '?' + url
      })
    }

    // Dirs
    if (document.querySelectorAll('.d21-trigger-ibe').length > 0) {
      let d21Trigger = document.querySelectorAll('.d21-trigger-ibe')

      d21Trigger.forEach(function (trigger) {
        trigger.addEventListener('click', function () {
          setTimeout(function () {
            let dirsIframeContainer = document.querySelector('#d21-modal-fullsize')

            if (dirsIframeContainer) {
              let dirsIframe = dirsIframeContainer.querySelector('iframe')

              if (dirsIframe) {
                let separator = dirsIframe.src.includes('?') ? '&' : '?'

                dirsIframe.addEventListener('load', function () {
                  this.src += separator + getAllStoredParams()
                }, { once: true })
              }
            }
          }, 2000)
        })
      })
    }

    if (hoteliersReservationLinks.length > 0) {
      Array.from(hoteliersReservationLinks).forEach(function (hoteliersReservationLink) {
        hoteliersReservationLink.href += '?' + url
      })
    }

    if (hoteliersReservationForms.length > 0) {
      Array.from(hoteliersReservationForms).forEach(function (reservationForm) {
        reservationForm.action += '?' + url
      })
    }
  }

  changeFormAction()
})
