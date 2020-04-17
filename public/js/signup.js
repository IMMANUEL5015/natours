import { showAlert } from './alerts'
export const signup = async (email, name, password, passwordConfirm) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: {
                email,
                name,
                password,
                passwordConfirm
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Account created successfully! Please check your email inbox.');
            window.setTimeout(() => {
                location.assign('/');
            }, 2500)
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}