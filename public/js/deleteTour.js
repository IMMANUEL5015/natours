import axios from "../../node_modules/axios";
import { showAlert } from './alerts';

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