import { showAlert } from './alerts';

//1. Create Review
export const createReview = async (review, rating, tour, slug) => {
    try {
        const res = await axios({
            method: 'POST',
            url: `/api/v1/tours/${tour}/reviews`,
            data: {
                review,
                rating
            }
        });

        if (res.data.status === 'Success') {
            showAlert('success', 'Review created successfully!');
            window.setTimeout(() => {
                location.assign(`/tour/${slug}`);
            }, 3000)
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

//2. Update Review
export const updateReview = async (review, rating, tour, reviewId, slug) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `/api/v1/tours/${tour}/reviews/${reviewId}`,
            data: {
                review,
                rating
            }
        });

        if (res.data.status === 'Success') {
            showAlert('success', 'Review Updated successfully!');
            window.setTimeout(() => {
                location.assign(`/tour/${slug}`);
            }, 3000)
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

//3. Delete Review
export const deleteReview = async (tour, reviewId, slug) => {
    try {
        await axios({
            method: 'DELETE',
            url: `/api/v1/tours/${tour}/reviews/${reviewId}`
        });

        showAlert('success', 'Review Deleted successfully!');
        window.setTimeout(() => {
            location.assign(`/tour/${slug}`);
        }, 3000)
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}