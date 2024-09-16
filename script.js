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

  var urlParams = new URLSearchParams(window.location.search)
  var gclid = urlParams.get('gclid')
  var fclid = urlParams.get('fclid')
  var ttl = 45 * 24 * 60 * 60 * 1000

  if (gclid) {
    var storedGclid = getLocalStorageWithExpiry('gclid')
    if (storedGclid !== gclid) {
      setLocalStorageWithExpiry('gclid', gclid, ttl)
    }
  }

  if (fclid) {
    var storedFclid = getLocalStorageWithExpiry('fclid')
    if (storedFclid !== fclid) {
      setLocalStorageWithExpiry('fclid', fclid, ttl)
    }
  }

  function changeFormAction() {
    var cubilisReservationForms = document.querySelectorAll('form[action^="https://reservations.cubilis.eu"]')
    var cubilisReservationLinks = document.querySelectorAll('a[href^="https://reservations.cubilis.eu"]')
    var hoteliersReservationLinks = document.querySelectorAll('a[href^="https://ibe.hoteliers.guru"]')
    var hoteliersReservationForms = document.querySelectorAll('form[action^="https://ibe.hoteliers.guru"]')
    var url = ''

    if (localStorage.getItem('gclid')) {
      url += '?gclid=' + JSON.parse(localStorage.getItem('gclid')).value + '&'
    }

    if (localStorage.getItem('fclid')) {
      url += '?fclid=' + JSON.parse(localStorage.getItem('fclid')).value + '&'
    }

    // Cubilis
    if (cubilisReservationForms.length > 0) {
      Array.from(cubilisReservationForms).forEach(function (reservationForm) {
        reservationForm.querySelector('#startdate').setAttribute('required', 'required')
        reservationForm.querySelector('#enddate').setAttribute('required', 'required')

        reservationForm.action += url
      })
    }

    if (cubilisReservationLinks.length > 0) {
      Array.from(cubilisReservationLinks).forEach(function (reservationLink) {
        reservationLink.href += url
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
					console.log('dirsIframe: ' + dirsIframe)
					if (dirsIframe && !dirsIframe.src.includes('gclid') && !dirsIframe.src.includes('fclid')) {
						dirsIframe.addEventListener('load', function () {
							this.src += url
						}, { once: true })
					}
				}
			}, 2000)
		})
      })
    }

    // Hoteliers Guru
    if (hoteliersReservationLinks.length > 0) {
      Array.from(hoteliersReservationLinks).forEach(function (hoteliersReservationLink) {
        hoteliersReservationLink.href += url
      })
    }

    if (hoteliersReservationForms.length > 0) {
      Array.from(hoteliersReservationForms).forEach(function (reservationForm) {
        reservationForm.action += url
      })
    }
  }

  changeFormAction()
})