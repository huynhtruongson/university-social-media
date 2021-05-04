$(document).ready(() => {
    // Socket
    const socket = io('https://university-social-media.herokuapp.com',{autoConnect : false})
    if($('.header-user').data('id') && $('.header-user').data('role') === 0)
        socket.connect();
    if($('.header-user').data('role') === 0) {
        socket.emit('student-connect')
    }
    socket.on('new-notification',data => {
        const $toast = $(`
            <a class="toast__item" href="/notification/${data.id}">
                <div class="toast__header">
                    <div class="toast__title">${data.category}</div>
                    <button class="btn-close toast__btn" type="button"></button>
                </div>
                <div class="toast__body">${data.title}</div>
            </a>
        `)
        $($toast).on('click','.toast__btn',() => $($toast).remove())
        $('.toast-box').prepend($toast)
        setTimeout(() => $($toast).remove(),4400)

    })
    // CONTAINER
    const container_state = {
        department : false,
        faculty : false
    }
    $('.navbar-item__dropdown').click((e) => {
        const { position } = e.currentTarget.dataset;
        if(!container_state[position]) {
            $(`.navbar-item__dropdown[data-position=${position}]+.navbar-item__children`)
            .addClass('navbar-item__children--active');
            $(`.navbar-item__dropdown[data-position=${position}] .navbar-item__icon`)
            .addClass('fa-rotate-90')
        }
        else {
            $(`.navbar-item__dropdown[data-position=${position}]+.navbar-item__children`)
            .removeClass('navbar-item__children--active');
            $(`.navbar-item__dropdown[data-position=${position}] .navbar-item__icon`)
            .removeClass('fa-rotate-90')
        }
        container_state[position] = !container_state[position]
    });
    $('.header-menu__btn').click(e => {
        $('.navigation-bar-tablet').addClass('navigation-bar-tablet--active')
        $('.navigation-bar__overlay').css('display','block')
    })
    $('.navigation-bar__btn-close').click(e => {
        $('.navigation-bar-tablet').removeClass('navigation-bar-tablet--active')
        $('.navigation-bar__overlay').css('display','none')
    })
    $('.navigation-bar__overlay').click(e => {
        $('.navigation-bar-tablet').removeClass('navigation-bar-tablet--active')
        $('.navigation-bar__overlay').css('display','none')
    })
    //Login page
    if (window.location.href.indexOf("auth/login?failed") > -1) {
        $('#modalLoginFailed').modal('show');
    }
    $('.login-form__input').focus((e) => {
        $(`.login-form__error--${e.target.name}`).text('');
    });
    $('.login-form__form').submit(async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/auth/login', {
                username: $('.login-form__input[name="username"]').val().trim(),
                password: $('.login-form__input[name="password"]').val().trim(),
            });
            if (res.status === 200) location.assign('/');
        } catch (error) {
            if (error.response.status === 400) {
                const {
                    data: { errors }
                } = error.response;
                $('.login-form__error--username').text(errors.username);
                $('.login-form__error--password').text(errors.password);
            }
        }
    });

    // ADMIN PAGE
    const admin_state = {
        pagination : {
            currentPage : 1,
            category : 'all',
            limit : 10,
            totalPages : null
        },
        toggleClass() {
            $('.admin-form__credentials').toggleClass('admin-form__credentials--disable')
            $('.admin-form__authorize').toggleClass('admin-form__authorize--active')
        },
        removeClass() {
            $('.admin-form__credentials').removeClass('admin-form__credentials--disable')
            $('.admin-form__authorize').removeClass('admin-form__authorize--active')
        },
        formExtend() {
            const authorizeHeight = $('.admin-form__authorize').height()
            $('.admin-create-user__form').css('min-height',authorizeHeight)
        },
        formMinimize() { $('.admin-create-user__form').css('min-height',0) },
        setEmptyValue() {
            $('.admin-form__credentials-input[name="display_name"]').val('')
            $('.admin-form__credentials-input[name="username"]').val('')
            $('.admin-form__credentials-input[name="password"]').val('')
            $('.admin-form__authorize-input').prop('checked',false)
        },
        hideModal() {
            this.setEmptyValue()
            this.formMinimize()
            this.removeClass()
            $('.admin-form__error').empty()
        },
        handleNextBtn() {
            this.formExtend()
            this.toggleClass()
        },
        handleBackBtn() {
            this.formMinimize()
            this.toggleClass()
        },
        handleAppendRow(user) {
            const userRow = `<tr id=${user._id}">
                    <td>
                        <div class="admin-table__text">${user.username} </div>
                    </td>
                    <td>
                        <div class="admin-table__text">${user.display_name}</div>
                    </td>
                    <td>
                        <div class="admin-table__text">${user.categories}</div>
                    </td>
                    <td>
                        <div class="admin-table__text"> </div><i class="fas fa-edit admin-table__icon-edit"></i><i class="fas fa-trash-alt admin-table__icon-delete"></i>
                    </td>
                </tr>`
            $('.admin-table__body').append(userRow)
        },
        handlePageClick: async function(e) {
            try {
                const {page} = e.currentTarget.dataset
                const {currentPage,totalPages,limit,category} = this.pagination
                let nextPage = page
                if(page === currentPage)
                    return
                if(nextPage === 'previous') {
                    if(currentPage === 1)
                        return 
                    $(`.admin-pagination__page-item[data-page=${currentPage}]`).removeClass('active')
                    $(`.admin-pagination__page-item[data-page=${currentPage-1}]`).addClass('active')
                    nextPage = currentPage-1
                }
                else if(nextPage === 'next') {
                    if(currentPage === totalPages)
                        return 
                    $(`.admin-pagination__page-item[data-page=${currentPage}]`).removeClass('active')
                    $(`.admin-pagination__page-item[data-page=${currentPage+1}]`).addClass('active')
                    nextPage = currentPage+1
                }
                else {
                    $(`.admin-pagination__page-item[data-page=${currentPage}]`).removeClass('active')
                    $(`.admin-pagination__page-item[data-page=${nextPage}]`).addClass('active')
                }
                const res = await axios.get('/admin/user',{params : {
                    page : nextPage,
                    categories : category,
                    limit : limit
                }})
                const {users,pagination} = res.data
                $('.admin-table__body').empty()
                users.forEach(user => this.handleAppendRow(user))
                this.pagination.currentPage = pagination.page

                if(this.pagination.totalPages === null)
                    this.pagination.totalPages = pagination.totalPages
                if(pagination.page === 1)
                    $('.admin-pagination__page-item[data-page="previous"]').addClass('disabled')
                else 
                    $('.admin-pagination__page-item[data-page="previous"]').removeClass('disabled')
                if(pagination.page === pagination.totalPages)
                    $('.admin-pagination__page-item[data-page="next"]').addClass('disabled')
                else 
                    $('.admin-pagination__page-item[data-page="next"]').removeClass('disabled')
            } catch (error) {
                console.log(error.response)
            }
        }
        
    }
    // handle hide modal
    $('#modalCreateAccount').on('hidden.bs.modal',() => admin_state.hideModal())
    //handle next form
    $('.admin-form__btn-next').click(() => admin_state.handleNextBtn())
    // handle back form
    $('.admin-form__authorize-back-btn').click(() => admin_state.handleBackBtn())
    // handle submit form create account
    $('.admin-create-user__form').submit(async (e) => {
        try {
            e.preventDefault();
            $('.modal-loading').css('display','flex')
            const display_name = $('.admin-form__credentials-input[name="display_name"]').val().trim()
            const username = $('.admin-form__credentials-input[name="username"]').val().trim() 
            const password = $('.admin-form__credentials-input[name="password"]').val().trim()
            const categories = []
            $('.admin-form__authorize-input:checked').each((index,element) => {
                categories.push(element.value)
            })  
            const userData = {display_name,username,password,categories}
            const res = await axios.post('/admin/create-user',userData);
            if (res.status === 200) {
                $('#modalCreateAccount').modal('hide');
                $('.admin-feature__select').val('all').trigger('change')
                $('.modal-loading').css('display','none')
            };
        } catch (error) {
            if (error.response.status === 400) {
                $('.modal-loading').css('display','none')
                const {data: { errors }} = error.response;
                const {display_name,username,password} = errors
                if(display_name || username || password)
                    admin_state.handleBackBtn()
                Object.keys(errors).forEach(err => $(`.admin-form__error--${err}`).text(errors[err]))
            }
        }
    })
    //handle focus input
    $('.admin-form__credentials-input,.admin-form__authorize-input')
    .focus(e => $(`.admin-form__error--${e.target.name}`).empty())
    // handle filter category
    $('.admin-feature__select').on('change',async function(e) {
        try {
            const res = await axios.get('/admin/user',{params : {categories : this.value}})
            const {users,pagination} = res.data
            $('.admin-table__body').empty()
            $('.admin-pagination ul.pagination').empty()
            if(users.length) {
                users.forEach(user => admin_state.handleAppendRow(user))
                admin_state.pagination.category = this.value
                admin_state.pagination.currentPage = 1
                admin_state.pagination.totalPages = pagination.totalPages
                $('.admin-pagination ul.pagination').append(`
                    <li class="page-item admin-pagination__page-item disabled" data-page="previous">
                        <p class="page-link">Previous</p>
                    </li>
                `)
                for(let i =1; i<=pagination.totalPages;i++) {
                    $('.admin-pagination ul.pagination').append(`
                    <li class="page-item admin-pagination__page-item ${i ===1 ? "active" : ""}" data-page=${i}>
                        <p class="page-link">${i}</p>
                    </li>
                    `)
                }
                $('.admin-pagination ul.pagination').append(`
                    <li class="page-item admin-pagination__page-item ${pagination.totalPages === 1 ? "disabled" : ""}" data-page="next">
                        <p class="page-link">next</p>
                    </li>
                `)
                $('.admin-table__empty-message').text('')
                $('.admin-pagination ul.pagination').on('click', '.admin-pagination__page-item',admin_state.handlePageClick.bind(admin_state))
            }
            else {
                $('.admin-table__empty-message').text('Chưa có tài khoản nào')
            }
        } catch (error) {
            console.log(error.response)
        }
    })
    // handle pagination
    $('.admin-pagination__page-item').click(admin_state.handlePageClick.bind(admin_state)) 

    // DEPARTMENT PAGE
    const department_state = {
        pagination : {
            currentPage : 1,
            category : 'all',
            limit : 10,
            totalPages : null
        },
        isClearFiles : false,
        handlePageClick: async function(e) {
            try {
                const {page} = e.currentTarget.dataset
                const {currentPage,totalPages,limit,category} = this.pagination
                let nextPage = page
                if(page === currentPage)
                    return
                if(nextPage === 'previous') {
                    if(currentPage === 1)
                        return 
                    $(`.department-pagination__page-item[data-page=${currentPage}]`).removeClass('active')
                    $(`.department-pagination__page-item[data-page=${currentPage-1}]`).addClass('active')
                    nextPage = currentPage-1
                }
                else if(nextPage === 'next') {
                    if(currentPage === totalPages)
                        return 
                    $(`.department-pagination__page-item[data-page=${currentPage}]`).removeClass('active')
                    $(`.department-pagination__page-item[data-page=${currentPage+1}]`).addClass('active')
                    nextPage = currentPage+1
                }
                else {
                    $(`.department-pagination__page-item[data-page=${currentPage}]`).removeClass('active')
                    $(`.department-pagination__page-item[data-page=${nextPage}]`).addClass('active')
                }
                const res = await axios.get('/department/notification',{params : {
                    page : nextPage,
                    category,
                    limit
                }})
                const {notifs,pagination} = res.data
                $('.department-notifications').empty()
                notifs.forEach(notif => this.handleAppendRow(notif))
                this.pagination.currentPage = pagination.page

                if(this.pagination.totalPages === null)
                    this.pagination.totalPages = pagination.totalPages
                if(pagination.page === 1)
                    $('.department-pagination__page-item[data-page="previous"]').addClass('disabled')
                else 
                    $('.department-pagination__page-item[data-page="previous"]').removeClass('disabled')
                if(pagination.page === pagination.totalPages)
                    $('.department-pagination__page-item[data-page="next"]').addClass('disabled')
                else 
                    $('.department-pagination__page-item[data-page="next"]').removeClass('disabled')
            } catch (error) {
                console.log(error)
            }
        },
        handleAppendRow(notif) {
            const $notifRow = $(`<div class="department-notif__item" data-id=${notif._id} data-name="${notif.title}">
            <div class="department-notif__display">
                <a href="notification/${notif._id}" class="department-notif__title">${notif.title}</a>
                <div class="department-notif__subtitle">[${notif.category}] - ${notif.createdAt}</div>
            </div>
            <div class="department-notif__actions">
                <button class="department-notif__actions-btn department-notif__btn-edit"><i class="fas fa-edit department-notif__icon-edit"></i></button>
                <button class="department-notif__actions-btn department-notif__btn-delete"><i class="fas fa-trash-alt department-notif__icon-delete"></i></button>
            </div>
        </div>`)
            $($notifRow).on('click', '.department-notif__btn-delete',this.handleDeleteBtnClick)
            $($notifRow).on('click', '.department-notif__btn-edit',this.handleEditBtnClick)
            $('.department-notifications').append($notifRow)
        },
        handleDeleteBtnClick(e) {
            const notif = $(e.target).parents('.department-notif__item')
            $('.department-modal__notif-name').text(notif.data('name'))
            $('.department-modal__confirm-delete-btn').data('id',notif.data('id'))
            $('#modalConfirmDeleteNoif').modal('show')
        },
        handleEditBtnClick : async (e) => {
            try {
                const id = $(e.target).parents('.department-notif__item').data('id')
                const res = await axios.get(`/notification/api/${id}`)
                if(res.status === 200) {
                    const {notif} = res.data
                    $('.department-edit-notif__form').data('id',id)
                    $('.department-form__input[name="title-edit"]').val(notif.title)
                    $('.department-form__input[name="category-edit"]').val(notif.category)
                    $('.department-form__input[name="content-edit"]').val(notif.content)
                    $('.department-form__files-edit-list').empty()
                    if(notif.files && notif.files.length) {
                        const $clearButton = $(`
                            <div class="department-form__file-clear" data-name="files-edit"}>
                                Clear all
                            </div>
                        `)
                        $($clearButton).on('click',department_state.handleClearFile.bind(department_state))
                        $('.department-form__files-edit-list').append($clearButton)
                        notif.files.forEach(file => {
                            $('.department-form__files-edit-list').append(`
                                <div class="department-form__file-item">${file.title}</div>
                            `)
                        })
                    }
                    $('#modalEditNotification').modal('show')
                }
            } catch (error) {
                console.log(error)
                if(error.response.status === 400) {
                    const {data: { errors }} = error.response;
                    alert(errors)
                }
            }
        },
        handleClearFile(e) {
            const name = $(e.target).data('name')
            $(`.department-form__${name}-list`).empty()
            $(`.department-form__input[name=${name}]`).val('')
            if(name === 'files-edit')
                this.isClearFiles = true
        }
    }
    // Handle display selected files
    $('.department-form__input[type="file"]').on('change',function(e) {
        const name = $(e.target).attr('name')
        $(`.department-form__${name}-list`).empty()
        if(this.files && this.files.length) {
            const $clearButton = $(`
                <div class="department-form__file-clear" data-name=${name}>
                    Clear all
                </div>
            `)
            $($clearButton).on('click',department_state.handleClearFile.bind(department_state))
            $(`.department-form__${name}-list`).append($clearButton)
            $(`.department-form__${name}-list`).append()
            for (let i =0;i< this.files.length;i++) {
                $(`.department-form__${name}-list`).append(`<div class="department-form__file-item">
                    ${this.files[i].name}
                </div>`)
            }
        }
    })
    //handle btn file click (create notif)
    $('.department-form__file-btn--create').click(e => {
        $('.department-form__input[name="files"]').click()
    })
    //handle btn file click (edit notif)
    $('.department-form__file-btn--edit').click(e => {
        $('.department-form__input[name="files-edit"]').click()
    })
    // Handle close modal create notification
    $('#modalCreateNotification').on('hidden.bs.modal',() => {
        $('.department-create-notif__form').trigger('reset')
        $('.department-form__files-list').empty()
        $('.department-form__error').text('')
    })
    // handle close modal edit notification
    $('#modalEditNotification').on('hidden.bs.modal',() => {
        $('.department-edit-notif__form').trigger('reset')
        $('.department-form__error').text('')
        department_state.isClearFiles = false
    })
    // Handle focus input
    $('.department-form__input').focus(e => $(`.department-form__error--${e.target.name}`).empty())
    // handle pagination
    $('.department-pagination__page-item').click(department_state.handlePageClick.bind(department_state)) 
    // Handle submit form create notification
    $('.department-create-notif__form').submit(async (e) => {
        try {
            e.preventDefault()
            $('.modal-loading').css('display','flex')
            const notifData = new FormData()
            notifData.append('title',$('.department-form__input[name="title"]').val().trim())
            notifData.append('category',$('.department-form__select').val())
            notifData.append('content',$('.department-form__input[name="content"]').val().trim())
            const files = $('.department-form__input[name="files"]').prop('files')
            for (let i=0;i<files.length;i++) {
                notifData.append('notification_files',files[i])
            }
            const res = await axios.post('/department/create-notification',notifData)
            if (res.status === 200) {
                $('#modalCreateNotification').modal('hide');
                $('.department-feature__select').val('all').trigger('change')
                $('.modal-loading').css('display','none')
            };
        } catch (error) {
            if (error.response.status === 400) {
                $('.modal-loading').css('display','none')
                const {data: { errors }} = error.response;
                Object.keys(errors).forEach(err => $(`.department-form__error--${err}`).text(errors[err]))
            }
        }
    })
    // Handle filter category
    $('.department-feature__select').on('change',async function(e) {
        try {
            const res = await axios.get('/department/notification',{params : {category : this.value}})
            const {notifs,pagination} = res.data
            $('.department-notifications').empty()
            $('.department-pagination ul.pagination').empty()
            if(notifs.length) {
                notifs.forEach(notif => department_state.handleAppendRow(notif))
                department_state.pagination.category = this.value
                department_state.pagination.currentPage = 1
                department_state.pagination.totalPages = pagination.totalPages
                $('.department-pagination ul.pagination').append(`
                    <li class="page-item department-pagination__page-item disabled" data-page="previous">
                        <p class="page-link">Previous</p>
                    </li>
                `)
                for(let i =1; i<=pagination.totalPages;i++) {
                    $('.department-pagination ul.pagination').append(`
                    <li class="page-item department-pagination__page-item ${i ===1 ? "active" : ""}" data-page=${i}>
                        <p class="page-link">${i}</p>
                    </li>
                    `)
                }
                $('.department-pagination ul.pagination').append(`
                    <li class="page-item department-pagination__page-item ${pagination.totalPages === 1 ? "disabled" : ""}" data-page="next">
                        <p class="page-link">next</p>
                    </li>
                `)
                $('.department-pagination ul.pagination').on('click', '.department-pagination__page-item',department_state.handlePageClick.bind(department_state))
            }
            else {
                $('.department-notifications').append('<div class="department__empty-message">Chưa có thông báo nào !</div>')
            }
        } catch (error) {
            console.log(error.response)
        }
    })
    // Handle delete btn click 
    $('.department-notif__btn-delete').click(department_state.handleDeleteBtnClick)
    //Handle confirm delete btn click
    $('.department-modal__confirm-delete-btn').click( async (e) => {
        try {
            $('.modal-loading').css('display','flex')
            const id = $(e.target).data('id')
            if(!id)
                return
            const res = await axios.delete(`/department/delete-notification/${id}`)
            if(res.status === 200) {
                $(`.department-notif__item[data-id=${id}]`).remove()
                $('#modalConfirmDeleteNoif').modal('hide')
                $('.modal-loading').css('display','none')
            }
        } catch (error) {
            $('.modal-loading').css('display','none')
            if (error.response.status === 400) {
                $('#modalConfirmDeleteNoif').modal('hide')
                const {data: { errors }} = error.response;
                alert(errors)
            }
        }
    })
    //Handle show modal edit notification
    $('.department-notif__btn-edit').click(department_state.handleEditBtnClick)
    // Handle submit form edit notification
    $('.department-edit-notif__form').submit(async (e) => {
        try {
            e.preventDefault()
            $('.modal-loading').css('display','flex')
            const id = $(e.target).data('id')
            const notifData = new FormData()
            notifData.append('title',$('.department-form__input[name="title-edit"]').val().trim())
            notifData.append('category',$('.department-form__select-edit').val())
            notifData.append('content',$('.department-form__input[name="content-edit"]').val().trim())
            notifData.append('isClearFiles',department_state.isClearFiles)
            const files = $('.department-form__input[name="files-edit"]').prop('files')
            for (let i=0;i<files.length;i++) {
                notifData.append('notification_files-edit',files[i])
            }
            const res = await axios.put(`/department/update-notification/${id}`,notifData)
            if (res.status === 200) {
                const {notif} = res.data
                $(`.department-notif__item[data-id=${id}]`).data('name',notif.title)
                $(`.department-notif__item[data-id=${id}] .department-notif__title`)
                    .text(notif.title)
                $(`.department-notif__item[data-id=${id}] .department-notif__subtitle`)
                    .text(`[${notif.category}] - ${notif.createdAt}`)
                $('#modalEditNotification').modal('hide');
                $('.modal-loading').css('display','none')
            };
        } catch (error) {
            if(error.response.status === 400) {
                $('.modal-loading').css('display','none')
                const {data: { errors }} = error.response;
                Object.keys(errors).forEach(err => $(`.department-form__error--${err}-edit`).text(errors[err]))
            }
        }
    })
    // NOTIFICATION PAGE
    const notification_state = {
        pagination : {
            currentPage : 1,
            category : $('.notification-feature').data('category'),
            limit : 10,
            totalPages : null
        },
        handlePageClick: async function(e) {
            try {
                const {page} = e.currentTarget.dataset
                const {currentPage,totalPages,limit,category} = this.pagination
                let nextPage = page
                if(page === currentPage)
                    return
                if(nextPage === 'previous') {
                    if(currentPage === 1)
                        return 
                    $(`.notification-pagination__page-item[data-page=${currentPage}]`).removeClass('active')
                    $(`.notification-pagination__page-item[data-page=${currentPage-1}]`).addClass('active')
                    nextPage = currentPage-1
                }
                else if(nextPage === 'next') {
                    if(currentPage === totalPages)
                        return 
                    $(`.notification-pagination__page-item[data-page=${currentPage}]`).removeClass('active')
                    $(`.notification-pagination__page-item[data-page=${currentPage+1}]`).addClass('active')
                    nextPage = currentPage+1
                }
                else {
                    $(`.notification-pagination__page-item[data-page=${currentPage}]`).removeClass('active')
                    $(`.notification-pagination__page-item[data-page=${nextPage}]`).addClass('active')
                }
                const res = await axios.get('/notification/feature',{params : {
                    page : nextPage,
                    category,
                    limit
                }})
                const {notifs,pagination} = res.data
                $('.notification-notifications').empty()
                notifs.forEach(notif => this.handleAppendRow(notif))
                this.pagination.currentPage = pagination.page

                if(this.pagination.totalPages === null)
                    this.pagination.totalPages = pagination.totalPages
                if(pagination.page === 1)
                    $('.notification-pagination__page-item[data-page="previous"]').addClass('disabled')
                else 
                    $('.notification-pagination__page-item[data-page="previous"]').removeClass('disabled')
                if(pagination.page === pagination.totalPages)
                    $('.notification-pagination__page-item[data-page="next"]').addClass('disabled')
                else 
                    $('.notification-pagination__page-item[data-page="next"]').removeClass('disabled')
            } catch (error) {
                console.log(error)
            }
        },
        handleAppendRow(notif) {
            const notifRow = `<div class="notification-notif__item">
                <a href="/notification/${notif._id}" class="notification-notif__title">${notif.title}</a>
                <div class="notification-notif__subtitle">[${notif.category}] - ${notif.createdAt}</div>
            </div>`
            $('.notification-notifications').append(notifRow)
        }
    }
    // handle pagination
    $('.notification-pagination__page-item').click(notification_state.handlePageClick.bind(notification_state)) 
    // Handle filter category
    $('.notification-feature__select').on('change',async function(e) {
        try {
            const res = await axios.get('/notification/feature',{params : {category : this.value}})
            const {notifs,pagination} = res.data
            $('.notification-notifications').empty()
            $('.notification-pagination ul.pagination').empty()
            if(notifs.length) {
                notifs.forEach(notif => notification_state.handleAppendRow(notif))
                notification_state.pagination.category = this.value
                notification_state.pagination.currentPage = 1
                notification_state.pagination.totalPages = pagination.totalPages
                $('.notification-pagination ul.pagination').append(`
                    <li class="page-item notification-pagination__page-item disabled" data-page="previous">
                        <p class="page-link">Previous</p>
                    </li>
                `)
                for(let i =1; i<=pagination.totalPages;i++) {
                    $('.notification-pagination ul.pagination').append(`
                    <li class="page-item notification-pagination__page-item ${i ===1 ? "active" : ""}" data-page=${i}>
                        <p class="page-link">${i}</p>
                    </li>
                    `)
                }
                $('.notification-pagination ul.pagination').append(`
                    <li class="page-item notification-pagination__page-item ${pagination.totalPages === 1 ? "disabled" : ""}" data-page="next">
                        <p class="page-link">next</p>
                    </li>
                `)
                $('.notification-pagination ul.pagination').on('click', '.notification-pagination__page-item',notification_state.handlePageClick.bind(notification_state))
            }
            else {
                $('.notification-notifications').append('<div class="notification__empty-message">Chưa có tài khoản nào !</div>')
            }
        } catch (error) {
            console.log(error.response)
        }
    })
    // PROFILE PAGE
    const profile_state = {
        currentUser: {
            id:$('.header-user').data('id'),
            avatar : $('.header-user__avatar').attr('src')
        },
        file_type : 'image',
        page : 1,
        limit: 10,
        isAllPosts : false,
        isClearFiles : false,
        readFileAsBase64(file) {
            return new Promise((resolve,reject) => {
                if(!file.type.includes(this.file_type)) {
                    this.file_type === 'image' ? 
                    reject('File ảnh không hợp lệ !') :
                    reject('File video không hợp lệ !')
                }
                const reader = new FileReader();
                reader.readAsDataURL(file); // convert to base64 string
                reader.onload = function(e) {
                    resolve(e.target.result)
                }
                reader.onerror = function(e){
                    reject(e.target.error);
                };
            })
        },
        handleUploadPhotoClick(name) {
            this.file_type = 'image'
            $(`.profile-form__input-status[name=${name}]`).attr('accept','image/*')
            $(`.profile-form__input-status[name=${name}]`).attr('multiple',true)
            $(`.profile-form__input-status[name=${name}]`).click()
        },
        handleUploadVideoClick(name) {
            this.file_type = 'video'
            $(`.profile-form__input-status[name=${name}]`).attr('accept','video/*')
            $(`.profile-form__input-status[name=${name}]`).attr('multiple',false)
            $(`.profile-form__input-status[name=${name}]`).click()
        },
        handleEditPostBtnClick : async (e) => {
            try {
                const id = $(e.target).parents('.profile-post__status-item').data('id')
                const res = await axios.get(`/post/api/${id}`)
                if(res.status === 200) {
                    const {post} = res.data
                    $('.profile-edit-post__form').data('id',id)
                    $('.profile-form__input[name="status_edit"]').val(post.status)
                    $('.profile-form__status_files_edit-preview-list').empty()
                    if(post.images.length) {
                        post.images.forEach(img => $('.profile-form__status_files_edit-preview-list')
                            .append(`<img class="profile-form__status-preview-item" src="https://res.cloudinary.com/sonhn/image/upload/${img}" alt="" />`)    
                        )
                        $('.profile-form__clear-preview-btn').css('display','flex')

                    }
                    if(post.videos.length) {
                        post.videos.forEach(vid => $('.profile-form__status_files_edit-preview-list')
                            .append(`<video class="profile-form__status-preview-item profile-form__status-preview-item--video" controls>
                                <source src="https://res.cloudinary.com/sonhn/video/upload/${vid}">
                            </video>`) 
                        )
                        $('.profile-form__clear-preview-btn').css('display','flex')   
                    }
                    $('#modalEditPost').modal('show')
                }
            } catch (error) {
                console.log(error)
                if(error.response.status === 400) {
                    const {data: { errors }} = error.response;
                    alert(errors)
                }
            }
        },
        handleDeletePostBtnClick(e) {
            const id = $(e.target).parents('.profile-post__status-item').data('id')
            $('.profile-post__confirm-delete-btn').data('id',id)
            $('#modalConfirmDeletePost').modal('show')
        },
        handleCreatePost(post,isCreate) {
            const $post = $(`
                <div class="profile-post__status-item" data-id=${post._id}>
                    ${this.currentUser.id === post.author._id ? 
                        `<div class="profile-post__options-btn">
                            <i class="fas fa-ellipsis-h profile-post__options-btn-icon"></i>
                            <div class="profile-post__options-list">
                                <button class="profile-post__option-btn profile-post__edit-btn">
                                    <i class="fas fa-edit profile-post__icon-edit"></i>
                                    <span>Edit Post</span>
                                </button>
                                <button class="profile-post__option-btn profile-post__delete-btn">
                                    <i class="fas fa-trash-alt profile-post__icon-delete"></i>
                                    <span>Delete Post</span>
                                </button>
                            </div>
                        </div>` : ``
                    }
                    <div class="profile-post__author">
                        <div class="profile-post__author-avatar">
                            <img class="profile-post__author-img" 
                                src=${post.author.avatar ? `https://res.cloudinary.com/sonhn/image/upload/${post.author.avatar}` : "/images/user-avatar.png"} alt="" />
                        </div>
                        <div class="profile-post__author-info">
                            <a class="profile-post__author-name" href="/profile/${post.author._id}">${post.author.display_name}</a>
                            <div class="profile-post__author-time">${moment(post.createdAt).calendar()}</div>
                        </div>
                    </div>
                    <div class="profile-post__content">
                        <div class="profile-post__content-status">${post.status}</div>
                        <div class="profile-post__content-assets"></div>
                    </div>
                    <div class="profile-post__count">
                        <div class="profile-post__count-item profile-post__count-item--like">
                            ${post.likes ? `${post.likes.length} Like` : ''}
                        </div>
                        <div class="profile-post__count-item profile-post__count-item--comment">
                            ${post.comments ? `${post.comments.length} Comment` : ''}
                        </div>
                    </div>
                    <div class="profile-post__actions">
                        <button class="profile-post__action-btn profile-post__action-like 
                        ${post.likes.indexOf(this.currentUser.id) !== -1 ? 'profile-post__action-like--active' : ''}">
                            <i class="fas fa-thumbs-up profile-post__action-icon profile-post__action-like-icon"></i>
                            Like
                        </button>
                        <button class="profile-post__action-btn profile-post__action-comment">
                            <i class="fas fa-comment-alt profile-post__action-icon profile-post__action-comment-icon"></i>
                            Comment
                        </button>
                    </div>
                    <div class="profile-post__comments">
                        <div class="profile-post__comment-list" data-amount=${post.comments ? post.comments.length : 0} ></div>
                        <div class="profile-post__comment-loading">
                            <div class="spinner-border text-info" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>                        
                        <div class="profile-post__comment-user">
                            <div class="profile-post__comment-avatar">
                                <img class="profile-post__comment-avatar-img" src=${this.currentUser.avatar} alt="" />
                            </div>
                            <div class="profile-post__comment-typing">
                                <form class="profile-post__comment-form">
                                    <input class="profile-post__comment-input" type="text" placeholder="Write a comment..." />
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            `)
            if(post.images.length) {
                $($post).find(".profile-post__content-assets").imagesGrid({
                    images: post.images.map(img => `https://res.cloudinary.com/sonhn/image/upload/${img}`),
                    cells : 4,
                    align:false
                });
            }
            if(post.videos.length) {
                post.videos.forEach(vid => $($post).find(".profile-post__content-assets")
                    .append(`
                        <video class="profile-post__content-video" controls loop>
                            <source src="https://res.cloudinary.com/sonhn/video/upload/${vid}">
                        </video>
                `))
            }
            $($post).on('click', '.profile-post__edit-btn',this.handleEditPostBtnClick)
            $($post).on('click', '.profile-post__delete-btn',this.handleDeletePostBtnClick)
            $($post).on('click','.profile-post__count-item--comment',this.handleRenderComments.bind(this))
            $($post).on('click','.profile-post__action-comment',this.handleRenderComments.bind(this))
            $($post).on('click','.profile-post__action-like',this.handleLikeBtnClick.bind(this))
            $($post).on('submit','.profile-post__comment-form',this.handleSubmitFormComment.bind(this))
            if(isCreate)
                $('.profile-post__status-list').prepend($post)
            else
                $('.profile-post__status-list').append($post)
        },
        handleRenderPostList : async function(id) {
            try {
                $('.profile-post__loading').css('display','flex')
                const params = {
                    page : this.page,
                    limit: this.limit,
                    sort:'-createdAt'
                }
                if(id)
                    params.author = id 
                const res = await axios.get('/post/api/post-list',{params})
                if(res.status === 200) {
                    if(res.data.posts.length)
                        res.data.posts.forEach(post => this.handleCreatePost(post,false))
                    else {
                        // Profile page and first load post list is empty
                        profile_state.isAllPosts = true
                        if(profile_state.page === 1 && $(document).find("title").text() === 'Profile')  {
                            $('.profile-post__status-list').append(`
                                <div class="profile-post__empty-list">Bạn chưa có bài đăng nào !</div>
                            `)
                        }
                    }
                }
                $('.profile-post__loading').css('display','none')
            } catch (error) {
                console.log(error)
                $('.profile-post__loading').css('display','none')
                if(error.response.status === 400) {
                    const {data: { errors }} = error.response;
                    alert(errors)
                }
            }

        },
        handleCreateComment(id,comment) {
            const $comment = $(`
                <div class="profile-post__comment-item" data-id=${comment._id}>
                    <div class="profile-post__comment-avatar">
                        <img class="profile-post__comment-avatar-img" src=${comment.author.avatar ? `https://res.cloudinary.com/sonhn/image/upload/${comment.author.avatar}` : "/images/user-avatar.png"} alt="" />
                    </div>
                    <div class="profile-post__comment-info">
                        <div class="profile-post__comment-name">${comment.author.display_name}</div>
                        <div class="profile-post__comment-content">${comment.content}</div>
                    </div>
                    ${this.currentUser.id === comment.author._id ? 
                        `<div class="profile-post__comment-options-btn">
                            <i class="fas fa-ellipsis-h profile-post__comment-icon-option"></i>
                            <div class="profile-post__comment-option-list">
                                <button class="profile-post__comment-option-btn profile-post__comment-edit-btn">
                                    <i class="fas fa-edit profile-post__comment-icon-edit"></i>
                                    <span>Edit comment</span>
                                </button>
                                <button class="profile-post__comment-option-btn profile-post__comment-delete-btn">
                                    <i class="fas fa-trash-alt profile-post__comment-icon-delete"></i>
                                    <span>Delete comment</span>
                                </button>
                            </div>
                        </div> ` : ``
                    }   
                </div>
            `)
            $($comment).on('click', '.profile-post__comment-edit-btn',this.handleEditComment.bind(this))
            $($comment).on('click', '.profile-post__comment-delete-btn',this.handleDeleteComment.bind(this))
            $(`.profile-post__status-item[data-id=${id}] .profile-post__comment-list`).append($comment)
        },
        handleRenderComments : async function(e) {
            try {
                const id = $(e.target).parents('.profile-post__status-item').data('id')
                $(`.profile-post__status-item[data-id=${id}] .profile-post__comments`).toggleClass('profile-post__comments--active')
                const amount =$(`.profile-post__status-item[data-id=${id}] .profile-post__comment-list`).data('amount')
                if($(`.profile-post__status-item[data-id=${id}] .profile-post__comment-list`).is(':empty') && amount) {
                    $(`.profile-post__status-item[data-id=${id}] .profile-post__comment-loading`).css('display','flex')
                    const res = await axios.get(`/post/api/comment-list/${id}`)
                    if(res.status === 200) {
                        $(`.profile-post__status-item[data-id=${id}] .profile-post__comment-loading`).css('display','none')
                        const {comments} = res.data
                        comments.forEach(cmt => this.handleCreateComment(id,cmt))
                    }
                }

            } catch (error) {
                console.log(error)
                if(error.response.status === 400) {
                    const {data: { errors }} = error.response;
                    alert(errors)
                }
            }
        },
        handleSubmitFormComment : async function(e) {
            try {
                e.preventDefault()
                const id = $(e.target).parents('.profile-post__status-item').data('id')
                const comment = $(`.profile-post__status-item[data-id=${id}] .profile-post__comment-input`).val().trim()
                if(!comment)
                    return
                const res = await axios.post(`/post/api/add-comment/${id}`,{comment})
                if(res.status === 200) {
                    const {comment} = res.data
                    this.handleCreateComment(id,comment)
                    $(`.profile-post__status-item[data-id=${id}] .profile-post__comment-input`).val('')
                }
            } catch (error) {
                console.log(error)
                if(error.response.status === 400) {
                    const {data: { errors }} = error.response;
                    alert(errors)
                }
            } 
        },
        handleEditComment(e) {
            const id = $(e.target).parents('.profile-post__comment-item').data('id') // id of comment 
            const content = $(`.profile-post__comment-item[data-id=${id}] .profile-post__comment-content`).text()
            const $formEdit = $(`
                <div class="profile-post__comment-info-edit">
                    <form class="profile-post__comment-edit-form" data-id=${id}>
                        <input class="profile-post__comment-edit-input" type="text" placeholder="Write your comment..."/>
                    </form>
                    <p class="profile-post__comment-edit-cancel">To cancel. <span class="profile-post__comment-edit-cancel-btn">Cancel</span></p>
                </div>
            `)
            $(`.profile-post__comment-item[data-id=${id}] .profile-post__comment-options-btn`).css('display','none')
            $($formEdit).find('.profile-post__comment-edit-input').val(content)
            $($formEdit).on('click', '.profile-post__comment-edit-cancel-btn',this.handleCancelEditComment)
            $($formEdit).on('submit', '.profile-post__comment-edit-form',this.handleSubmitFormCommentEdit)
            $(`.profile-post__comment-item[data-id=${id}] .profile-post__comment-info`).css('display','none')
            $(`.profile-post__comment-item[data-id=${id}] .profile-post__comment-info`).after($formEdit)
            $(`.profile-post__comment-item[data-id=${id}] .profile-post__comment-edit-input`).focus()
        },
        handleCancelEditComment(e) {
            const id = $(e.target).parents('.profile-post__comment-item').data('id')
            $(`.profile-post__comment-item[data-id=${id}] .profile-post__comment-info-edit`).remove()
            $(`.profile-post__comment-item[data-id=${id}] .profile-post__comment-options-btn`).css('display','flex')
            $(`.profile-post__comment-item[data-id=${id}] .profile-post__comment-info`).css('display','block')
        },
        handleSubmitFormCommentEdit : async (e)=>{
            try {
                e.preventDefault()
                const id = $(e.target).data('id')
                const editedComment = $(e.target).children('.profile-post__comment-edit-input').val()
                if(!editedComment)
                    return
                const res = await axios.put(`/post/api/update-comment/${id}`,{comment : editedComment})
                if(res.status === 200) {
                    $(`.profile-post__comment-item[data-id=${id}] .profile-post__comment-info-edit`).remove()
                    $(`.profile-post__comment-item[data-id=${id}] .profile-post__comment-content`).text(res.data.comment)
                    $(`.profile-post__comment-item[data-id=${id}] .profile-post__comment-info`).css('display','block')
                    $(`.profile-post__comment-item[data-id=${id}] .profile-post__comment-options-btn`).css('display','flex')
                }
            } catch (error) {
                console.log(error)
                if(error.response.status === 400) {
                    const {data: { errors }} = error.response;
                    alert(errors)
                }
            }

        },
        handleDeleteComment(e) {
            const id = $(e.target).parents('.profile-post__comment-item').data('id')
            $('.profile-comment__confirm-delete-btn').data('id',id)
            $('#modalConfirmDeleteComment').modal('show')
        },
        handleLikeBtnClick : async (e) => {
            try {
                const id = $(e.target).parents('.profile-post__status-item').data('id')
                const res = await axios.get(`/post/api/like-post/${id}`)
                if(res.status === 200) {
                    const {amount} = res.data
                    $(`.profile-post__status-item[data-id=${id}] .profile-post__action-like`)
                        .toggleClass('profile-post__action-like--active')
                    $(`.profile-post__status-item[data-id=${id}] .profile-post__count-item--like`)
                        .text(`${amount} Like`)
                }
            } catch (error) {
                console.log(error)
                if(error.response.status === 400) {
                    const {data: { errors }} = error.response;
                    alert(errors)
                }
            }
        }  
    }
    // handle hide modal update avatar
    $('#modalUpdateAvatar').on('hidden.bs.modal',() => {
        $('.profile-avatar__form').trigger('reset')
        $('.profile-avatar__preview').attr('src','#');
        $('.profile-avatar__preview').css('display','none')
        $('.profile-avatar__error').empty()
    })
    // handle hide modal update password
    $('#modalUpdatePassword').on('hidden.bs.modal',() => {
        $('.profile-update-password__form').trigger('reset')
        $('.profile-form__error').empty()
    })
    // handle hide modal update profile info
    $('#modalUpdateProfile').on('hidden.bs.modal',() => {
        $('.profile-form__error').empty()
    })
    // handle hide modal create post status
    $('#modalCreatePost').on('hidden.bs.modal',() => {
        $('.profile-create-post__form').trigger('reset')
        $('.profile-form__status_files-preview-list').empty()
        $('.profile-form__post-error').empty()
        $('.profile-form__clear-preview-btn').css('display','none')
    })
    // handle hide modal edit post status
    $('#modalEditPost').on('hidden.bs.modal',() => {
        $('.profile-edit-post__form').trigger('reset')
        $('.profile-form__status_files-preview-list').empty()
        $('.profile-form__post-error').empty()
        $('.profile-form__clear-preview-btn').css('display','none')
        profile_state.isClearFiles = false
    })
    // handle edit profile click
    $('.profile-info__btn-edit').click(async (e) => {
        try {
            const id = $('.profile-page').data('id')
            const res = await axios.get(`/profile/api/${id}`)
            if(res.status === 200) {
                const {user} = res.data
                $('.profile-form__input[name="display_name"]').val(user.display_name)
                $('.profile-form__input[name="faculty"]').val(user.faculty) 
                $('.profile-form__input[name="class"]').val(user.class)
                $('#modalUpdateProfile').modal('show');
            }
        } catch (error) {
            if(error.response.status === 400) {
                const {data: { errors }} = error.response;
                alert(errors)
            }
        }

    })
    // handle submit update profile info
    $('.profile-update-info__form').submit(async (e) => {
        try {
            e.preventDefault()
            $('.modal-loading').css('display','flex')
            const display_name = $('.profile-form__input[name="display_name"]').val().trim()
            const faculty = $('.profile-form__input[name="faculty"]').val().trim() 
            const _class = $('.profile-form__input[name="class"]').val().trim()
            const res = await axios.put('/profile/update-info',{display_name,faculty,_class})
            if(res.status === 200) {
                const {user} = res.data
                $('.profile-dislay__name').text(user.display_name)
                $('.profile-info__name span').text(user.display_name)
                $('.profile-info__faculty span').text(user.faculty)
                $('.profile-info__class span').text(user.class)
                $('.header-user__name').text(user.display_name)
                $('.navbar-item__name').text(user.display_name)
                $('#modalUpdateProfile').modal('hide');
                $('.modal-loading').css('display','none')
            }
        } catch (error) {
            if(error.response.status === 400) {
                $('.modal-loading').css('display','none')
                const {data: { errors }} = error.response;
                Object.keys(errors).forEach(err => $(`.profile-form__error--${err}`).text(errors[err]))
            }
        }
    })
    // handle upload avatar btn click
    $('.profile-avatar__btn-choose-file').click(e => {
        $('.profile-avatar__input[type="file"]').click()
        $('.profile-avatar__error').text('')
    })
    // handle review avatar before update
    $('.profile-avatar__input[type="file"]').on('change',async function(e) {
        try {
            if (this.files && this.files[0]) {
                if(!this.files[0].type.includes('image')) {
                    alert('Vui lòng chọn file hình ảnh')
                    $('.profile-avatar__form').trigger('reset')
                    return
                }
                const base64Encode = await profile_state.readFileAsBase64(this.files[0])
                $('.profile-avatar__preview').attr('src', base64Encode);
                $('.profile-avatar__preview').css('display','block')
            }
            else {
                $('.profile-avatar__preview').attr('src','#');
                $('.profile-avatar__preview').css('display','none')
            }
        } catch (error) {
            console.log(error)
        }
    });
    // handle update avatar 
    $('.profile-avatar__btn-update').click(async (e) => {
        try {
            $('.modal-loading').css('display','flex')
            const image  = $('.profile-avatar__input[type="file"]').prop('files')
            if(!image) {
                $('.profile-avatar__error').text(errors)
                return
            }
            const imageData = new FormData()
            imageData.append('avatar',image[0])
            const res = await axios.put('/profile/update-avatar',imageData)
            if(res.status === 200) {
                const {user} = res.data
                $('#modalUpdateAvatar').modal('hide');
                $('.profile-display__img').attr('src',`https://res.cloudinary.com/sonhn/image/upload/${user.avatar}`);
                $('.header-user__avatar').attr('src',`https://res.cloudinary.com/sonhn/image/upload/${user.avatar}`);
                $('.navbar-item__avatar').attr('src',`https://res.cloudinary.com/sonhn/image/upload/${user.avatar}`);
                $('.profile-post__avatar').attr('src',`https://res.cloudinary.com/sonhn/image/upload/${user.avatar}`);
                $('.profile-post__author-img').attr('src',`https://res.cloudinary.com/sonhn/image/upload/${user.avatar}`)
                $('.modal-loading').css('display','none')
            }
        } catch (error) {
            if(error.response.status === 400) {
                $('.modal-loading').css('display','none')
                const {data: { errors }} = error.response;
                $('.profile-avatar__error').text(errors)
                console.log(errors)
            }
        }
    })
    //handle submit form update password
    $('.profile-update-password__form').submit(async (e) => {
        try {
            e.preventDefault()
            $('.modal-loading').css('display','flex')
            const password = $('.profile-form__input[name="password"]').val().trim()
            const newPassword = $('.profile-form__input[name="newPassword"]').val().trim() 
            const reNewPassword = $('.profile-form__input[name="reNewPassword"]').val().trim()
            const res = await axios.put('/profile/update-password',{password,newPassword,reNewPassword})
            if(res.status === 200) {
                $('#modalUpdatePassword').modal('hide');
                $('.modal-loading').css('display','none')
            }
        } catch (error) {
            if(error.response.status === 400) {
                $('.modal-loading').css('display','none')
                const {data: { errors }} = error.response;
                Object.keys(errors).forEach(err => $(`.profile-form__error--${err}`).text(errors[err]))
            }
        }
    })
    //handle photo post btn click (create post)
    $('.profile-post__option-img-btn').click(e => {
        $('#modalCreatePost').modal('show')
        profile_state.handleUploadPhotoClick('status_files')
    })
    //handle photo post video click (create post)
    $('.profile-post__option-video-btn').click(e => {
        $('#modalCreatePost').modal('show')
        profile_state.handleUploadVideoClick('status_files')
    })
    //handle photo post modal btn click (create post)
    $('.profile-form__option-img-btn--create').click(e => {
        profile_state.handleUploadPhotoClick('status_files')
    })
    //handle video post modal btn click (create post)
    $('.profile-form__option-video-btn--create').click(e => {
        profile_state.handleUploadVideoClick('status_files')
    })
        //handle photo post modal btn click (edit post)
    $('.profile-form__option-img-btn--edit').click(e => {
        profile_state.handleUploadPhotoClick('status_files_edit')
    })
    //handle video post modal btn click (edit post)
    $('.profile-form__option-video-btn--edit').click(e => {
        profile_state.handleUploadVideoClick('status_files_edit')
    })
    // handle focus input create status (create post)
    $('.profile-form__input').focus((e) => {
        $('.profile-form__post-error').empty()
    });
    //handle preview file upload post status
    $('.profile-form__input-status[type="file"]').on('change',async function(e) {
        const name = $(e.target).attr('name')
        try {
            if (this.files && this.files.length) {
                const readers = []
                for(let i =0;i<this.files.length;i++) {
                    readers.push(profile_state.readFileAsBase64(this.files[i]))
                }
                const base64Values = await Promise.all(readers)
                $(`.profile-form__${name}-preview-list`).empty()
                if(profile_state.file_type === 'image') {
                    base64Values.forEach(file => $(`.profile-form__${name}-preview-list`)
                        .append(`<img class="profile-form__status-preview-item" src=${file} alt="" />`)    
                    )
                }
                else {
                    base64Values.forEach(file => $(`.profile-form__${name}-preview-list`)
                        .append(`<video class="profile-form__status-preview-item profile-form__status-preview-item--video" controls>
                            <source src=${file}>
                        </video>`)    
                    )
                }
                $('.profile-form__clear-preview-btn').css('display','flex')
                $(`.profile-form__post-error`).empty()
            }
            else {
                $(`.profile-form__${name}-preview-list`).empty()
            }
        } catch (error) {
            alert(error)
            $('.profile-form__input-status[name="status_files"]').val('')
        }
    })
    // handle clear preview post status (create post)
    $('.profile-form__clear-status_files-btn').click(function() {
        $('.profile-form__input-status[name="status_files"]').val('')
        $('.profile-form__status_files-preview-list').empty()
        $('.profile-form__clear-preview-btn').css('display','none')
    })
    // handle render post list
    function renderPostList() {
        if(window.location.href.indexOf("profile") > -1) {
            const id = $('.profile-page').data('id')
            profile_state.handleRenderPostList(id)
        }
        else {
            profile_state.handleRenderPostList()
        }
    } 
    if ($('.profile-post__status-list').length) { // length of element contain class
        renderPostList()
    }
    // handle submit form create post 
    $('.profile-create-post__form').submit(async (e) => {
        try {
            e.preventDefault()
            $('.modal-loading').css('display','flex')
            const postData = new FormData()
            postData.append('status',$('.profile-form__input[name="status"]').val().trim())
            const files = $('.profile-form__input-status[name="status_files"]').prop('files')
            for (let i=0;i<files.length;i++) {
                postData.append('post_files',files[i])
            }
            const res = await axios.post('/post/api/create-post',postData)
            if(res.status === 200) {
                const {post} = res.data
                profile_state.handleCreatePost(post,true)
                $('#modalCreatePost').modal('hide')
                $('.modal-loading').css('display','none')
            }
        } catch (error) {
            if(error.response.status === 400) {
                $('.modal-loading').css('display','none')
                const {data: { errors }} = error.response;
                $('.profile-form__post-error--create').text(errors)
            }
        }
    })
    // handle clear preview post status (edit post) 
    $('.profile-form__clear-status_files_edit-btn').click(e => {
        profile_state.isClearFiles = true
        $('.profile-form__input-status[name="status_files_edit"]').val('')
        $('.profile-form__status_files_edit-preview-list').empty()
        $('.profile-form__clear-preview-btn').css('display','none')
    })
    // handle submit form edit post 
    $('.profile-edit-post__form').submit(async (e) => {
        try {
            e.preventDefault()
            const id = $(e.target).data('id')
            $('.modal-loading').css('display','flex')
            const postData = new FormData()
            postData.append('status',$('.profile-form__input[name="status_edit"]').val().trim())
            postData.append('isClearFiles',profile_state.isClearFiles)
            const files = $('.profile-form__input-status[name="status_files_edit"]').prop('files')
            for (let i=0;i<files.length;i++) {
                postData.append('post_files_edit',files[i])
            }
            const res = await axios.put(`/post/api/update-post/${id}`,postData)
            if(res.status === 200) {
                const {post} = res.data
                $(`.profile-post__status-item[data-id=${id}] .profile-post__content-status`).text(post.status)
                $(`.profile-post__status-item[data-id=${id}] .profile-post__content-assets`).empty()
                if(post.images.length) {
                    $(`.profile-post__status-item[data-id=${id}] .profile-post__content-assets`).imagesGrid({
                        images: post.images.map(img => `https://res.cloudinary.com/sonhn/image/upload/${img}`),
                        cells : 4,
                        align:false
                    });
                }
                if(post.videos.length) {
                    post.videos.forEach(vid => $(`.profile-post__status-item[data-id=${id}] .profile-post__content-assets`)
                        .append(`
                            <video class="profile-post__content-video" controls loop>
                                <source src="https://res.cloudinary.com/sonhn/video/upload/${vid}">
                            </video>
                    `))
                }
                $('#modalEditPost').modal('hide');
                $('.modal-loading').css('display','none')
            }
        } catch (error) {
            console.log(error)
            if(error.response.status === 400) {
                $('.modal-loading').css('display','none')
                const {data: { errors }} = error.response;
                $('.profile-form__post-error--edit').text(errors)
            }
        }
    })
    // handle confirm delete post 
    $('.profile-post__confirm-delete-btn').click(async (e) => {
        try {
            $('.modal-loading').css('display','flex')
            const id = $(e.target).data('id')
            if(!id)
                return
            const res = await axios.delete(`/post/api/delete-post/${id}`)
            if(res.status === 200) {
                $(`.profile-post__status-item[data-id=${id}]`).remove()
                $('#modalConfirmDeletePost').modal('hide')
                $('.modal-loading').css('display','none')
            }
        } catch (error) {
            $('.modal-loading').css('display','none')
            if (error.response.status === 400) {
                $('#modalConfirmDeletePost').modal('hide')
                const {data: { errors }} = error.response;
                alert(errors)
            }
        }
    })
    // handle confirm delete comment 
    $('.profile-comment__confirm-delete-btn').click(async (e) => {
        try {
            $('.modal-loading').css('display','flex')
            const id = $(e.target).data('id')
            if(!id)
                return
            const res = await axios.delete(`/post/api/delete-comment/${id}`)
            if(res.status === 200) {
                $(`.profile-post__comment-item[data-id=${id}]`).remove()
                $('#modalConfirmDeleteComment').modal('hide')
                $('.modal-loading').css('display','none')
            }
        } catch (error) {
            $('.modal-loading').css('display','none')
            if (error.response.status === 400) {
                $('#modalConfirmComment').modal('hide')
                const {data: { errors }} = error.response;
                alert(errors)
            }
        }
        
    })
    $(window).scroll(function() {
        if($(document).height() - ($(window).scrollTop() + $(window).height()) < 1) {
            if($(document).find("title").text() === 'Home' || $(document).find("title").text() === 'Profile') {
                if(!profile_state.isAllPosts) {
                    profile_state.page+=1
                    renderPostList()
                }
                else
                    return
            }
        }
    });
    $('.not-found__back-btn').click(e => {
        window.history.back();
    })
});
