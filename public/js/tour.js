import axios from "../../node_modules/axios";
import { showAlert } from './alerts';

//1. Book Tour
export const bookTour = async tourId => {
    const stripe = Stripe('pk_test_tFzRlFeRIFMIr1wwOA842gqk00hzu5wJ2m');
    try {
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`)
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (err) {
        showAlert('error', err.response.data.message);
        window.setTimeout(() => {
            location.reload(true);
        }, 2000);
    }
}

//2. Delete Tour
export const deleteTour = async tourId => {
    try {
        await axios({
            method: 'DELETE',
            url: `/api/v1/tours/${tourId}`
        });

        showAlert('success', 'Tour deleted successfully!');
        window.setTimeout(() => {
            location.assign('/');
        }, 2000)
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

//3. Display Map
export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiaW1tYW51ZWw1MDE1IiwiYSI6ImNrN3poZHp6cTA1aGgzZnBnbTJ2cWg2Y2YifQ.ASCGcSrYK_fKkbylOkrrqA';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/immanuel5015/ck7zhvu0q04d21io8i46h0s2n',
        scrollZoom: false
        // center: [-118.635621, 34.153231],
        // interactive: false,
        // zoom: 10
    });

    const bounds = new mapboxgl.LngLatBounds();
    // Create the marker
    locations.forEach(loc => {
        const el = document.createElement('div');
        el.className = 'marker'

        // Add the marker to the map
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);

        //Add popup
        new mapboxgl.Popup({
            offset: 30
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day} ${loc.description}<p>`)
            .addTo(map);

        //Extend the Bounds object for the current location
        bounds.extend(loc.coordinates);

        map.fitBounds(bounds, {
            padding: {
                top: 200,
                bottom: 150,
                left: 100,
                right: 300
            }
        });
    });
}