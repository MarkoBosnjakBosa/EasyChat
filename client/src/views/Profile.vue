<template>
    <div id="profile" class="container-fluid">
        <div class="d-flex" id="barsDiv">
            <div id="sidebarDiv" class="bg-light border-right">
                <div class="heading">EasyChat</div>
                <ul class="list list-group-flush">
                    <li class="list-group-item list-group-item-action bg-light"><div class="chatroomType">Chatrooms</div><i v-if="publicChatrooms.length" id="publicIcon" class="fas fa-angle-double-up" @click="toggleChatrooms('public')"></i></li>
                    <li v-for="publicChatroom in publicChatrooms" :key="publicChatroom._id" class="list-group-item list-group-item-action bg-light publicChatroom" @click="openChatroom(publicChatroom._id)"><div class="chatroomIcon"><i :class="publicChatroom.icon"></i></div>{{publicChatroom.name}}</li>
                    <li class="list-group-item list-group-item-action bg-light"><div class="chatroomType">Private</div><i v-if="privateChatrooms.length" id="privateIcon" class="fas fa-angle-double-up" @click="toggleChatrooms('private')"></i></li>
                    <li v-for="privateChatroom in privateChatrooms" :key="privateChatroom._id" class="list-group-item list-group-item-action bg-light privateChatroom" @click="openChatroom(privateChatroom._id)"><div class="privateChatroomName">{{privateChatroom.name}}</div></li>
                </ul>
            </div>
            <div id="pageDiv">
                <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
                    <button type="button" id="toggleSidebar" class="btn btn-info" @click="toggleSidebar()"><i class="fas fa-angle-double-left"></i></button>
                    <button type="button" class="navbar-toggler" data-toggle="collapse" data-target="#navbarOptions" aria-controls="navbarOptions" aria-expanded="false">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div id="navbarOptions" class="collapse navbar-collapse">
                        <ul class="navbar-nav ml-auto mt-2 mt-lg-0">
                            <li class="nav-item">
                                <a class="nav-link" href="#" @click="openOverview()">Overview</a>
                            </li>
                            <li v-if="isAdmin" class="nav-item">
                                <a class="nav-link" href="#" @click="openUsers()">Users</a>
                            </li>
                            <li class="nav-item dropdown">
                                <a id="userOptions" href="#" class="nav-link dropdown-toggle" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{username}}</a>
                                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="userOptions">
                                    <a class="dropdown-item" href="#">Profile</a>
                                    <a class="dropdown-item" href="#" @click="logout()">Log out</a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </nav>
                <div id="personalInformation">
                    <form autocomplete="off" @submit.prevent="editUser()" enctype="multipart/form-data">
                        <h1>Personal information:</h1>
                        <div class="form-row">
                            <div class="form-group col-md-4">
                                <div class="avatarDiv">
                                    <div id="previewAvatar">
                                        <img :src="renderAvatar()" alt="Avatar" class="rounded-circle img-fluid" width="100" height="100">
                                    </div>
                                    <div class="avatarWrapper">
                                        <button class="avatarUpload" :class="{'errorField' : avatarError && userSubmitting}">Upload avatar <i class="fas fa-upload"></i></button>
                                        <input type="file" id="avatar" @change="selectAvatar($event)"/>
                                    </div>
                                    <small v-if="avatarError && userSubmitting" class="form-text errorInput" style="text-align: center">Please provide a valid avatar!</small>
                                </div>
                            </div>
                            <div class="form-group col-md-8">
                                <div class="form-group">
                                    <label for="username">Username:</label>
                                    <input type="text" id="username" class="form-control" :placeholder="user.username" disabled/>
                                </div>
                                <div class="form-group">
                                    <label for="email">Email:</label>
                                    <input type="text" id="email" class="form-control" :placeholder="user.email" disabled/>
                                </div>
                                <div class="form-group">
                                    <label for="firstName">First name:</label>
                                    <input type="text" id="firstName" class="form-control" :class="{'errorField' : firstNameError && userSubmitting}" placeholder="First name" v-model="user.firstName" @focus="clearFirstNameStatus()" @keypress="clearFirstNameStatus()"/>
                                    <small v-if="firstNameError && userSubmitting" class="form-text errorInput">Please provide a valid first name!</small>
                                </div>
                                <div class="form-group">
                                    <label for="lastName">Last name:</label>
                                    <input type="text" id="lastName" class="form-control" :class="{'errorField' : lastNameError && userSubmitting}" placeholder="Last name" v-model="user.lastName" @focus="clearLastNameStatus()" @keypress="clearLastNameStatus()"/>
                                    <small v-if="lastNameError && userSubmitting" class="form-text errorInput">Please provide a valid last name!</small>
                                </div>
                                <div class="form-group">
                                    <div class="form-check">
                                        <input type="checkbox" id="newsletters" class="form-check-input" v-model="user.sendNewsletters" @click="clearSendNewslettersStatus()"/>
                                        <label for="newsletters" class="form-check-label">Newsletters</label>
                                    </div>
                                </div>
                                <div v-if="userEdited" class="form-group editSuccessful">Personal information have been successfully edited!</div>
                                <div class="form-group submitButton">
                                    <button type="submit" class="btn btn-primary">Edit</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div id="resetPassword">
                    <form autocomplete="off" @submit.prevent="resetPassword()">
                        <h1>Reset password:</h1>
                        <div class="form-group">
                            <div class="input-group">
                                <input type="password" id="password" class="form-control" :class="{'errorField' : passwordError && passwordSubmitting}" placeholder="Password" v-model="password" @focus="clearPasswordStatus()" @keypress="clearPasswordStatus()"/>
                                <div class="input-group-append">
                                    <button type="button" class="btn btn-light" :class="{'errorIcon' : passwordError && passwordSubmitting}" data-toggle="tooltip" title="Password has to have at least 8 characters, one upper and lower case, one digit and a special character." @click="togglePassword()"><i id="togglePassword" class="fa fa-eye"></i></button>
                                </div>
                            </div>
                            <small v-if="passwordError && passwordSubmitting" class="form-text errorInput">Please provide a valid password!</small>
                        </div>
                        <div v-if="passwordReset" class="form-group resetSuccessful">Your password has been successfully reset!</div>
                        <div class="form-group submitButton">
                            <button type="submit" class="btn btn-primary">Reset</button>
                        </div>
                    </form>
                </div>
            </div>  
        </div>
    </div>
</template>

<script>
    import "bootstrap";
    import "bootstrap/dist/css/bootstrap.min.css";
    import "../assets/css/bars.css";
    var axios = require("axios");

    export default {
        name: "profile",
        data() {
            return {
                username: "",
                isAdmin: false,
                publicChatrooms: [],
                privateChatrooms: [],
                userSubmitting: false,
                firstNameError: false,
                lastNameError: false,
                avatarError: false,
                user: {
                    username: "",
                    email: "",
                    firstName: "",
                    lastName: "",
                    avatar: "",
                    sendNewsletters: false
                },
                userEdited: false,
                passwordError: false,
                password: "",
                passwordReset: false
            }
        },
        methods: {
            isLoggedIn() {
                if(!this.$store.getters.isLoggedIn) this.$router.push("/login");
                this.username = this.$store.getters.getUser;
                this.isAdmin = this.$store.getters.isAdmin;
                this.checkStatus();
            },
            getChatrooms() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/getChatrooms/" + this.username).then(response => {
                    this.publicChatrooms = response.data.public;
                    this.privateChatrooms = response.data.private;
                }).catch(error => console.log(error));
            },
            getUser() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/getUser/" + this.username).then(response => {
                    this.user = response.data.user;
                }).catch(error => console.log(error));
            },
            renderAvatar() {
                if(this.user.avatar && !(this.user.avatar instanceof File)) {
                    return "data:" + this.user.avatar.contentType + ";base64," + (new Buffer.from(this.user.avatar.image)).toString("base64");
                } else {
                    return null;
                }
            },
            editUser() {
                this.userSubmitting = true;
                this.clearFirstNameStatus();
                this.clearLastNameStatus();
                this.clearAvatarStatus();
                var allowSubmit = true;
                if(this.invalidFirstName) {
                    this.firstNameError = true;
                    allowSubmit = false;
                }
                if(this.invalidLastName) {
                    this.lastNameError = true;
                    allowSubmit = false;
                }
                if(this.invalidAvatar) {
                    this.avatarError = true;
                    allowSubmit = false;
                }
                if(!allowSubmit) {
                    this.userEdited = false;
                    return;
                }
                var formData = new FormData();
                formData.append("username", this.username);
                formData.append("firstName", this.user.firstName);
                formData.append("lastName", this.user.lastName);
                formData.append("avatar", this.user.avatar);
                formData.append("sendNewsletters", this.user.sendNewsletters);
                axios.put(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/editUser", formData).then(response => {
                    if(response.data.edited) {
                        this.userEdited = true;
                        this.firstNameError = false, this.lastNameError = false, this.avatarError = false, this.userSubmitting = false;
                    } else {
                        var errorFields = response.data.errorFields;
                        if(errorFields.includes("firstName")) this.firstNameError = true;
                        if(errorFields.includes("lastName")) this.lastNameError = true;
                        if(errorFields.includes("avatar")) this.avatarError = true;
                        this.userEdited = false;
                    }
                }).catch(error => console.log(error));
            },
            resetPassword() {
                this.clearPasswordStatus();
                if(this.invalidPassword) {
                    this.passwordError = true;
                    this.passwordReset = false;
                    return;
                }
                var body = {username: this.username, password: this.password};
                axios.put(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/resetPassword", body).then(response => {
                    if(response.data.reset) {
                        this.passwordReset = true;
                        this.password = "";
                        this.passwordError = false;
                    } else {
                        this.passwordError = true;
                        this.passwordReset = false;
                    }
                }).catch(error => console.log(error));
            },
            checkStatus() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/checkStatus").then(response => console.log(response.data)).catch(error => console.log(error));
            },
            openOverview() {
                if(this.isAdmin) {
                    this.$router.push("/admin/overview");
                } else {
                    this.$router.push("/overview");
                }
            },
            openUsers() {
                this.$router.push("/admin/users");
            },
            openChatroom(chatroomId) {
                this.$router.push("/chatroom/" + chatroomId);
            },
            logout() {
                this.$store.dispatch("logout");
                this.$router.push("/login");
            },
            clearFirstNameStatus() { 
                this.firstNameError = false;
                this.userEdited = false;
            },
            clearLastNameStatus() { 
                this.lastNameError = false;
                this.userEdited = false;
            },
            clearAvatarStatus() { 
                this.avatarError = false;
                this.userEdited = false;
            },
            clearSendNewslettersStatus() {
                this.userEdited = false;
            },
            clearPasswordStatus() { 
                this.passwordError = false; 
                this.passwordReset = false;
            },
            selectAvatar(event) {
                this.userSubmitting = false;
                var files = event.target.files;
                var allowedExtensions = ["image/png", "image/jpg", "image/jpeg"];
                if(files && files.length && allowedExtensions.includes(files[0].type) && files[0].size <= 500000) {
                    var file = files[0];
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        var previewAvatar = document.getElementById("previewAvatar");
                        previewAvatar.innerHTML = "<div><img src='" + e.target.result + "' alt='" + file.name + "' class='rounded-circle img-fluid' width='100' height='100'></div><div>" + file.name + "</div>";
                    }
                    this.user.avatar = file;
                    this.clearAvatarStatus();
                    reader.readAsDataURL(file);
                } else {
                    this.avatarError = true;
                    this.userSubmitting = true;
                }
            },
            togglePassword() {
                var type = document.getElementById("password").getAttribute("type");
                switch(type) {
                    case "password": {
                        document.getElementById("password").setAttribute("type", "text");
                        document.getElementById("togglePassword").classList.remove("fa-eye");
                        document.getElementById("togglePassword").classList.add("fa-eye-slash");
                        return;
                    }
                    case "text": {
                        document.getElementById("password").setAttribute("type", "password");
                        document.getElementById("togglePassword").classList.remove("fa-eye-slash");
                        document.getElementById("togglePassword").classList.add("fa-eye");
                        return;
                    }
                }
            },
            toggleChatrooms(type) {
                if(type == "public") {
                    var publicChatrooms = document.querySelectorAll(".publicChatroom");
                    var publicIcon = document.getElementById("publicIcon");
                    publicChatrooms.forEach(publicChatroom => {
                        if(publicChatroom.classList.contains("hiddenPublicChatroom")) {
                            publicChatroom.classList.remove("hiddenPublicChatroom");
                            publicIcon.classList.remove("fa-angle-double-down");
                            publicIcon.classList.add("fa-angle-double-up");
                        } else {
                            publicChatroom.classList.add("hiddenPublicChatroom");
                            publicIcon.classList.remove("fa-angle-double-up");
                            publicIcon.classList.add("fa-angle-double-down");
                        }
                    });
                } else if(type == "private") {
                    var privateChatrooms = document.querySelectorAll(".privateChatroom");
                    var privateIcon = document.getElementById("privateIcon");
                    privateChatrooms.forEach(privateChatroom => {
                        if(privateChatroom.classList.contains("hiddenPrivateChatroom")) {
                            privateChatroom.classList.remove("hiddenPrivateChatroom");
                            privateIcon.classList.remove("fa-angle-double-down");
                            privateIcon.classList.add("fa-angle-double-up");
                        } else {
                            privateChatroom.classList.add("hiddenPrivateChatroom");
                            privateIcon.classList.remove("fa-angle-double-up");
                            privateIcon.classList.add("fa-angle-double-down");
                        }
                    });
                }
            },
            toggleSidebar() {
                var bars = document.getElementById("barsDiv");
                var toggleSidebar = document.getElementById("toggleSidebar");
                bars.classList.toggle("toggled");
                if(bars.classList.contains("toggled")) {
                    toggleSidebar.innerHTML = "<i class='fas fa-angle-double-right'></i>";
                } else {
                    toggleSidebar.innerHTML = "<i class='fas fa-angle-double-left'></i>";
                }
            }
        },
        computed: {
            invalidFirstName() { return this.user.firstName === ""; },
            invalidLastName() { return this.user.lastName === ""; },
            invalidAvatar() { return this.user.avatar === ""; },
            invalidPassword() {
                var passwordFormat = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
                if(this.user.password != "" && passwordFormat.test(this.user.password)) {
                    return false;
                } else {
                    return true;
                }
            }
        },
        created() {
            this.isLoggedIn();
            this.getChatrooms();
            this.getUser();
        }
    }
</script>

<style scoped>
    #personalInformation {
        margin: 0 auto;
        max-width: 800px;
    }
    #resetPassword {
        margin: 0 auto;
        max-width: 400px;
    }
    h1 {
        text-align: center;
        margin-top: 20px;
        margin-bottom: 20px;
    }
    .avatarDiv {
        margin: 0 auto;
        margin-top: 50px;
    }
    #previewAvatar {
        text-align: center;
        margin-bottom: 10px;
    }
    .avatarWrapper {
        position: relative;
        overflow: hidden;
        display: inline-block;
    }
    .avatarUpload {
        border: 2px solid #808080;
        color: #808080;
        background-color: #fff;
        padding: 8px 20px;
        border-radius: 8px;
        font-size: 20px;
        font-weight: bold;
        margin-left: 30px;
    }
    #avatar {
        opacity: 0;
        position: absolute;
        left: 0px;
        top: 0px;
        font-size: 100px;
    }
    .submitButton {
        text-align: center;
    }
    .editSuccessful, .resetSuccessful {
        color: #008000;
        margin-bottom: 10px;
    }
    .errorField {
        border: 1px solid #ff0000;
        box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.1), 0 0 6px #ff8080;
    }
    .errorIcon {
        border: 1px solid #ff0000;
        border-left: 0px;
        box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.1), 0 0 6px #ff8080;
    }
    .errorInput {
        color: #ff0000;
    }
</style>