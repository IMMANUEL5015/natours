import { showAlert } from './alerts';
import axios from '../../node_modules/axios';

export const createNewBooking = async (tour, user, price) => {
    try {
        const res = await axios({
            method: 'POST',
            url: `/api/v1/bookings/`,
            data: {
                tour,
                user,
                price
            }
        });

        if (res.data.status === 'Success') {
            showAlert('success', 'Booking created successfully.');
            window.setTimeout(() => {
                location.assign('/me');
            }, 6000);
        }

    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}