import axios from "../../node_modules/axios";
import { showAlert } from './alerts';

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