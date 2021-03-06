// An alert's type can either be 'success' or 'error'

export const hideAlert = () => {
    const el = document.querySelector('.alert');
    el.parentElement.removeChild(el);
}

export const showAlert = (type, msg, time = 7) => {
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, time * 1000);
}