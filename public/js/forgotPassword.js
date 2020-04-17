import { showAlert } from './alerts'
export const forgotPassword = async (email) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/users/forgotPassword',
            data: {
                email
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Your password reset link has been sent to your email address.');
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}