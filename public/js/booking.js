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

export const updateSpecificBookingForTour = async (tour, user, price, tour_id, booking_id, tour_slug) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `/api/v1/tours/${tour_id}/bookings/${booking_id}`,
            data: {
                tour,
                user,
                price
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Booking Updated successfully.');
            window.setTimeout(() => {
                location.assign(`/tour/${tour_slug}/bookings/${booking_id}`);
            }, 6000);
        }

    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

export const deleteSpecificBookingForTour = async (tour_id, booking_id, tour_slug) => {
    try {
        await axios({
            method: 'DELETE',
            url: `/api/v1/tours/${tour_id}/bookings/${booking_id}`
        });


        showAlert('success', 'Booking Deleted Successfully.');
        window.setTimeout(() => {
            location.assign(`/tour/${tour_slug}/bookings/`);
        }, 6000);

    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

export const updateSpecificBookingForUser = async (tour, user, price, user_id, booking_id, user_email) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `/api/v1/users/${user_id}/bookings/${booking_id}`,
            data: {
                tour,
                user,
                price
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Booking Updated successfully.');
            window.setTimeout(() => {
                location.assign(`/users/${user_email}/bookings/${booking_id}`);
            }, 6000);
        }

    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

export const deleteSpecificBookingForUser = async (user_id, booking_id, user_email) => {
    try {
        await axios({
            method: 'DELETE',
            url: `/api/v1/users/${user_id}/bookings/${booking_id}`
        });


        showAlert('success', 'Booking Deleted Successfully.');
        window.setTimeout(() => {
            location.assign(`/users/${user_email}/bookings/`);
        }, 6000);

    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

export const updateSpecificBooking = async (tour, user, price, booking_id) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `/api/v1/bookings/${booking_id}`,
            data: {
                tour,
                user,
                price
            }
        });

        if (res.data.status === 'Success') {
            showAlert('success', 'Booking Updated successfully.');
            window.setTimeout(() => {
                location.assign(`/bookings/${booking_id}`);
            }, 6000);
        }

    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

export const deleteSpecificBooking = async (booking_id) => {
    try {
        await axios({
            method: 'DELETE',
            url: `/api/v1/bookings/${booking_id}`
        });


        showAlert('success', 'Booking Deleted Successfully.');
        window.setTimeout(() => {
            location.assign(`/bookings`);
        }, 6000);

    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}