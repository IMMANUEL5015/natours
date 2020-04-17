import { showAlert } from './alerts'
export const resetPassword = async (password, passwordConfirm, resetToken) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `http://127.0.0.1:8000/api/v1/users/resetPassword/${resetToken}`,
            data: {
                password,
                passwordConfirm
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Reset password successful!');
            window.setTimeout(() => {
                location.assign('/');
            }, 6000)
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}