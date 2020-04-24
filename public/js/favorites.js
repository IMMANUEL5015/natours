import { showAlert } from './alerts';
import axios from "../../node_modules/axios";

export const addToFavorites = async (tourId) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `/api/v1/tours/${tourId}/add-to-favorites`
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Added to favorites');
            window.setTimeout(() => {
                location.reload(true);
            }, 6000)
        }
    } catch (err) {
        showAlert('error', 'Failed to add tour to favorites. Try Again.');
    }
}

export const removeFromFavorites = async (tourId) => {
    try {
        const res = await axios({
            method: 'DELETE',
            url: `/api/v1/tours/${tourId}/remove-from-favorites`
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Successfully removed from favorites.');
            window.setTimeout(() => {
                location.reload(true);
            }, 6000);
        }
    } catch (err) {
        showAlert('error', 'Failed to remove tour from favorites. Try again.');
    }
}