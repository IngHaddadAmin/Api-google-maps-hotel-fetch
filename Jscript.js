//  MAPS
let map, bounds;
const API = 'c3926d7198msh7f865f753f0716bp1348e9jsn75c8521a48ba'
const init_center = { lat: 51.1666, lng: 10.45 };

function initMap() {
    map = new google.maps.Map(document.getElementById("mapContainer"),
        { center: init_center, zoom: 7, disableDefaultUI: true, });
    bounds = new google.maps.LatLngBounds();
}
window.initMap = initMap;


let markers = [];


const fetchCountries = async () => {
    const urlx = 'https://wft-geo-db.p.rapidapi.com/v1/geo/countries?limit=10&offset=90';
    const optionsx = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': API,
            'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
        }
    }
    const response = await fetch(urlx, optionsx)
    const result = await response.json()
    return result
}


const submit = document.querySelector("#submit");
submit.setAttribute('disabled', '');


async function getMarkers(country) {
    const url = `https://hotels4.p.rapidapi.com/locations/v3/search?q=${country}}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': API,
            'X-RapidAPI-Host': 'hotels4.p.rapidapi.com'
        }
    };

    const response = await fetch(url, options)
    const result = await response.json()

    markers = []

    result.sr.map(pos => {
        const lat = parseFloat(pos.coordinates.lat)
        const lng = parseFloat(pos.coordinates.long)
        const position = { lat, lng }
        markers.push(position)
        bounds.extend(new google.maps.LatLng(position))
    })

    submit.removeAttribute('disabled', '');

}



(async function load_country() {

    const result = await fetchCountries()


    for (let i = 0; i < result.data.length; i++) {
        const e = result.data[i];
        countrylist.innerHTML += `
            <li data-value="${e.name}" data-sprache="${e.code}">
                <span>${e.name}</span>
            </li>`
    }

    countrylist.style.display = "none";
    countryinput.addEventListener('click', () => {
        countrylist.style.display = "block";
    })

    let sprachen_options = Array.from(document.querySelectorAll("#countrylist li"));

    sprachen_options.map((option) => {
        option.addEventListener('click', (e) => {
            countryinput.value = option.dataset.value
            countrylist.style.display = "none";
            getMarkers(option.dataset.value)
        })
    });

})()




const search_input = document.getElementById('search');

search_input.addEventListener('input', async function (e) {

     suggest.innerHTML = '';
    const result = await fetchCountries()


    result.data.map(country => {
        country_lower = country.name.toLowerCase()

        if (e.target.value && e.target.value !== '' && country_lower.startsWith(e.target.value)) {
            auto_suggest_list.innerHTML += `
                <ul class="countrylist">
                    <li data-country="${country.name}">
                        <span>${country.name}</span>
                    </li>
                </ul>`;
        }
    })


    const auto_suggest_select = Array.from(document.querySelectorAll('#suggest li'));

    auto_suggest_select.map(selected => {
        selected.addEventListener('click', function (e) {
            getMarkers(this.dataset.country)
            e.target.value = this.dataset.country
            suggest.style.display = "none"
        })
    })


})





const input_search_form = document.querySelector("#input_search");

input_search_form.addEventListener("submit", function (e) {
    e.preventDefault();

    markers.map((marker) => {
        console.log(marker)
        new google.maps.Marker({ position: marker, map })
    })
    map.fitBounds(bounds);
    markers = []
});