const handleLoginErrors = error => {
    const errors = {username : '',password : ''}
    // Login
    if(error.message === 'empty username') {
        errors.username = 'Please enter username !'
        return errors
    }
    if(error.message === 'empty password') {
        errors.password = 'Please enter password !'
        return errors
    }
    if(error.message === 'incorrect username') {
        errors.username = 'Incorrect username !'
        return errors
    }
    if(error.message === 'incorrect password') {
        errors.password = 'Incorrect password !'
        return errors
    }
}
const handleCreateAccountErrors = error => {
    const errors = {
        display_name:'',
        username : '',
        password : '',
        categories : ''
    }
    if(error.message === 'empty display_name') {
        errors.display_name = 'Please enter a display name!'
        return errors
    }
    if(error.message === 'empty username') {
        errors.username = 'Please enter an username !'
        return errors
    }
    if(error.message === 'empty password') {
        errors.password = 'Please enter a password !'
        return errors
    }
    if(error.message === 'empty categories') {
        errors.categories = 'Please check at least one department/faculty !'
        return errors
    }
    if(error.message === 'invalid password') {
        errors.password = 'Minimum password length is 6 characters !'
        return errors
    }
    // Duplicate username
    if(error.code === 11000) {
        errors.username= 'This username is already existed !'
        return errors
    }
    return errors
}
const handleCreateEditNotifErrors = error => {
    const errors = {
        title:'',
        category : '',
        content : '',
    }
    if(error.message === 'empty title') {
        errors.title = 'Please enter a title !'
        return errors
    }
    if(error.message === 'empty category') {
        errors.category = 'Please choose a category !'
        return errors
    }
    if(error.message === 'empty content') {
        errors.content = 'Please enter content !'
        return errors
    }
    return errors
}
const handleUpdateProfileInfoErrors = error => {
    const errors = {
        display_name:'',
        faculty : '',
        class : '',
    }
    if(error.message === 'empty display_name') {
        errors.display_name = 'Please enter a display name !'
        return errors
    }
    if(error.message === 'empty faculty') {
        errors.faculty = 'Please choose a faculty !'
        return errors
    }
    if(error.message === 'empty class') {
        errors.class = 'Please enter class !'
        return errors
    }
    return errors
}
const handleUpdateProfilePasswordErrors = error => {
    const errors = {
        password:'',
        newPassword : '',
        reNewPassword : '',
    }
    if(error.message === 'empty password') {
        errors.password = 'Please enter a password !'
        return errors
    }
    if(error.message === 'empty new password') {
        errors.newPassword = 'Please choose a new password !'
        return errors
    }
    if(error.message === 'empty renew password') {
        errors.reNewPassword = 'Please enter renew password !'
        return errors
    }
    if(error.message === 'invalid new password') {
        errors.newPassword = 'Minimum password length is 6 characters !'
        return errors
    }
    if(error.message === 'invalid renew password') {
        errors.reNewPassword = 'Renew password inccorect !'
        return errors
    }
    if(error.message === 'invalid password') {
        errors.password = 'Password inccorect !'
        return errors
    }
    return errors
}
module.exports = {
    handleLoginErrors,
    handleCreateAccountErrors,
    handleCreateEditNotifErrors,
    handleUpdateProfileInfoErrors,
    handleUpdateProfilePasswordErrors
}