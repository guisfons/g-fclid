document.addEventListener('DOMContentLoaded', function () {
  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    let paramsObject = {};

    if (params.toString()) {
        for (const [key, value] of params.entries()) {
            paramsObject[key] = value;
        }
        return paramsObject;
    }

    const storedParams = localStorage.getItem('urlParams');
    if (storedParams) {
        const parsedParams = JSON.parse(storedParams);
        
        // Check if the item has expired
        const now = new Date();
        if (parsedParams.expiry && now.getTime() > parsedParams.expiry) {
            console.log('Stored URL parameters have expired');
            return paramsObject;  // Return empty object since params are expired
        }

        return parsedParams.value;
    }

    return paramsObject;
  }

  function setLocalStorageWithExpiry(key, value, ttl) {
      const now = new Date();
      const item = {
          value: value,
          expiry: now.getTime() + ttl
      };
      localStorage.setItem(key, JSON.stringify(item));
  }

  function saveParamsToLocalStorageWithExpiry(ttl) {
      const urlParams = getUrlParams();
      setLocalStorageWithExpiry('urlParams', urlParams, ttl);
  }

  var ttl = 45 * 24 * 60 * 60 * 1000 // 45 dias
  saveParamsToLocalStorageWithExpiry(ttl);

  function addLocalStorageParamsToUrl() {
    const storedParams = localStorage.getItem('urlParams');
    
    if (storedParams) {
        const parsedParams = JSON.parse(storedParams);
        
        const now = new Date();
        if (parsedParams.expiry && now.getTime() > parsedParams.expiry) {
            console.log('Stored URL parameters have expired');
            return;
        }

        const urlParams = new URLSearchParams(parsedParams.value);
        // Append the parameters to the current URL
        // const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        // window.history.replaceState(null, '', newUrl);
        return urlParams.toString()
    } else {
        console.log('No URL parameters found in localStorage');
    }
  }

  addLocalStorageParamsToUrl();

  function changeFormAction() {
    var cubilisReservationForms = document.querySelectorAll('form[action^="https://reservations.cubilis.eu"]')
    var cubilisReservationLinks = document.querySelectorAll('a[href^="https://reservations.cubilis.eu"]')
    var hoteliersReservationLinks = document.querySelectorAll('a[href^="https://ibe.hoteliers.guru"]')
    var hoteliersReservationForms = document.querySelectorAll('form[action^="https://ibe.hoteliers.guru"]')
    var url = '?'

    if (localStorage.getItem('urlParams')) {
      url += addLocalStorageParamsToUrl()
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
					if (dirsIframe) {
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
