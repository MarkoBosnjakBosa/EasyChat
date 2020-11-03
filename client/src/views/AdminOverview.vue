<template>
    <div id="adminOverview" class="container-fluid">
        <div class="d-flex" id="barsDiv">
            <div class="bg-light border-right" id="sidebarDiv">
            <div class="heading">EasyChat</div>
            <ul class="list list-group-flush">
                <li class="list-group-item list-group-item-action bg-light"><div class="chatroomType">Chatrooms</div><i v-if="publicChatrooms.length" id="publicIcon" class="fas fa-angle-double-up" @click="toggleChatrooms('public')"></i></li>
                <li v-for="publicChatroom in publicChatrooms" :key="publicChatroom._id" class="list-group-item list-group-item-action bg-light publicChatroom" @click="openChatroom(publicChatroom._id)"><div class="chatroomIcon"><i :class="publicChatroom.icon"></i></div>{{publicChatroom.name}}</li>
                <li class="list-group-item list-group-item-action bg-light"><div class="chatroomType">Private</div><i v-if="privateChatrooms.length" id="privateIcon" class="fas fa-angle-double-up" @click="toggleChatrooms('private')"></i></li>
                <li v-for="privateChatroom in privateChatrooms" :key="privateChatroom._id" class="list-group-item list-group-item-action bg-light privateChatroom"><div class="privateChatroomType" @click="openChatroom(privateChatroom._id)">{{privateChatroom.name}}</div><i class="fas fa-times" @click="deletePrivateChatroom(privateChatroom._id)"></i></li>
            </ul>
            </div>
            <div id="pageDiv">
                <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
                    <button id="toggleSidebar" class="btn btn-info" @click="toggleSidebar"><i class="fas fa-angle-double-left"></i></button>
                    <button type="button" class="navbar-toggler" data-toggle="collapse" data-target="#navbarOptions" aria-controls="navbarOptions" aria-expanded="false">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div id="navbarOptions" class="collapse navbar-collapse">
                        <ul class="navbar-nav ml-auto mt-2 mt-lg-0">
                            <li class="nav-item active">
                                <a class="nav-link" href="#">Overview</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#" @click="openUsers()">Users</a>
                            </li>
                            <li class="nav-item dropdown">
                                <a id="userOptions" href="#" class="nav-link dropdown-toggle" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{username}}</a>
                                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="userOptions">
                                    <a class="dropdown-item" href="#" @click="openProfile()">Profile</a>
                                    <a class="dropdown-item" href="#" @click="logout()">Log out</a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </nav>
                <div id="publicChatroom">
                    <form autocomplete="off" @submit.prevent="createPublicChatroom()">
                        <h1>Chatroom</h1>
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <input type="text" id="name" class="form-control" :class="{'errorField' : nameError && publicSubmitting}" placeholder="Name" v-model="publicChatroom.name" ref="first" @focus="clearNameStatus()" @keyPress="clearNameStatus()"/>
                                <small v-if="nameError" class="form-text errorInput">Please provide a valid name!</small>
                            </div>
                            <div class="form-group col-md-5">
                                <input type="text" id="icon" class="form-control" :class="{'errorField' : iconError && publicSubmitting}" placeholder="Icon" v-model="publicChatroom.icon" @focus="clearIconStatus()" @keyPress="clearIconStatus()"/>
                                <small v-if="iconError" class="form-text errorInput">Please provide a valid icon!</small>
                            </div>
                            <div class="form-group col-md-1">
                                <button type="submit" class="btn btn-primary">Create</button>
                            </div>
                        </div>
                        <div v-if="publicChatroomCreated" class="form-group creationSuccessful">Chatroom has been successfully created!</div>
                    </form>
                </div>
                <table class="table">
                    <thead class="thead-light">
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Name</th>
                            <th scope="col">Icon</th>
                            <th scope="col">Participants</th>
                            <th scope="col">Blocked</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(publicChatroom, index) in publicChatrooms" :key="publicChatroom._id">
                            <th scope="row">{{++index}}</th>
                            <td v-if="editing == publicChatroom._id"><input type="text" class="form-control" v-model="publicChatroom.name"/></td>
                            <td v-else>{{publicChatroom.name}}</td>
                            <td v-if="editing == publicChatroom._id"><input type="text" class="form-control" v-model="publicChatroom.icon"/></td>
                            <td v-else><i :class="publicChatroom.icon"></i></td>
                            <td v-if="editing == publicChatroom._id" class="padded">
                                <ul>
                                    <li v-for="participant in publicChatroom.participants.filter(userParticipant => userParticipant != username)" :key="participant">{{participant}}<i class="fas fa-ban blockUser" @click="blockParticipant(publicChatroom._id, participant)"></i></li>
                                </ul>
                            </td>
                            <td v-else>{{publicChatroom.participants.join(", ")}}</td>
                            <td v-if="editing == publicChatroom._id" class="padded">
                                <ul>
                                    <li v-for="blockedParticipant in publicChatroom.blockedParticipants" :key="blockedParticipant">{{blockedParticipant}}<i class="fas fa-check allowUser" @click="allowParticipant(publicChatroom._id, blockedParticipant)"></i></li>
                                </ul>
                            </td>
                            <td v-else>{{publicChatroom.blockedParticipants.join(", ")}}</td>
                            <td v-if="editing == publicChatroom._id" class="padded">
                                <i class="far fa-check-circle editPublicChatroom" @click="editPublicChatroom(publicChatroom)"></i>
                                <i class="far fa-times-circle disableEditing" @click="disableEditing()"></i>
                            </td>
                            <td v-else>
                                <i class="fas fa-pencil-alt" @click="enableEditing(publicChatroom._id)"></i>
                                <i class="fas fa-trash" @click="deletePublicChatroom(publicChatroom._id)"></i>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div id="privateChatroom">
                    <form autocomplete="off" @submit.prevent="createPrivateChatroom">
                        <h1>Private chatroom</h1>
                        <div class="form-row">
                            <div class="form-group col-md-3"></div>
                            <div class="form-group col-md-4">
                                <select id="availableUser" class="form-control" :class="{'errorField' : availableUserError && privateSubmitting}" v-model="availableUser" @focus="clearAvailableUserStatus()" @keypress="clearAvailableUserStatus()">
                                    <option value="" disabled selected>Select user...</option>
                                    <option v-for="availableUser in availableUsers" :key="availableUser" :value="availableUser">{{availableUser}}</option>
                                </select>
                                <small v-if="availableUserError && privateSubmitting" class="form-text errorInput">Please provide a valid user!</small>
                            </div>
                            <div class="form-group col-md-1">
                                <button type="submit" class="btn btn-primary">Create</button>
                            </div>
                        </div>
                        <div v-if="privateChatroomCreated" class="form-row">
                            <div class="form-group col-md-3"></div>
                            <div class="form-group col-md-6 creationSuccessful">Private chatroom has been successfully created!</div>
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
        name: "adminOverview",
        data() {
            return {
                username: "",
                isAdmin: false,
                publicChatrooms: [],
                privateChatrooms: [],
                availableUsers: [],
                publicSubmitting: false,
                nameError: false,
                iconError: false,
                publicChatroom: {
                    name: "",
                    icon: ""
                },
                publicChatroomCreated: false,
                editing: null,
                privateSubmitting: false,
                availableUserError: false,
                availableUser: "",
                privateChatroomCreated: false,
                baseUrl: process.env.VUE_APP_BASE_URL + process.env.VUE_APP_CLIENT_PORT
            }
        },
        methods: {
            isLoggedIn() {
                if(!this.$store.getters.isLoggedIn) this.$router.push("/login");
                this.username = this.$store.getters.getUser.username;
                this.isAdmin = this.$store.getters.getUser.isAdmin;
                if(this.isAdmin) {
                    this.checkStatus();
                } else {
                    this.logout();
                }
            },
            getChatrooms() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/getChatrooms/" + this.username).then(response => {
                    this.publicChatrooms = response.data.public;
                    this.privateChatrooms = response.data.private;
                }).catch(error => console.log(error));
            },
            getAvailableUsers() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/getAvailableUsers/" + this.username).then(response => {
                    this.availableUsers = response.data.availableUsers;
                }).catch(error => console.log(error));
            },
            createPublicChatroom() {
                this.publicSubmitting = true;
                this.clearNameStatus();
                this.clearIconStatus();
                var allowSubmit = true;
                if(this.invalidName) {
                    this.nameError = true;
                    allowSubmit = false;
                }
                if(this.invalidIcon) {
                    this.iconError = true;
                    allowSubmit = false;
                }
                if(!allowSubmit) {
                    this.publicChatroomCreated = false;
                    return;
                }
                var body = {username: this.username, name: this.publicChatroom.name, icon: this.publicChatroom.icon};
                axios.post(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/createPublicChatroom", body).then(response => {
                    if(response.data.created) {
                        var newPublicChatroom = response.data.publicChatroom;
                        this.publicChatrooms = [...this.publicChatrooms, newPublicChatroom];
                        this.publicChatroomCreated = true;
                        this.$refs.first.focus();
                        this.publicChatroom = {name: "", icon: ""};
                        this.nameError = false, this.iconError = false, this.publicSubmitting = false;
                    } else {
                        var errorFields = response.data.errorFields;
                        if(errorFields.includes("name")) this.nameError = true;
                        if(errorFields.includes("icon")) this.iconError = true;
                        this.publicChatroomCreated = false;
                    }
                }).catch(error => console.log(error));
            },
            enableEditing(publicChatroomId) { this.editing = publicChatroomId; },
            disableEditing() { this.editing = null; },
            editPublicChatroom(updatedPublicChatroom) {
                if(updatedPublicChatroom.name != "" && updatedPublicChatroom.icon != "") {
                    var body = {id: updatedPublicChatroom._id, name: updatedPublicChatroom.name, icon: updatedPublicChatroom.icon};
                    axios.put(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/editPublicChatroom", body).then(response => {
                        if(response.data.edited) {
                            this.publicChatrooms = this.publicChatrooms.map(publicChatroom => publicChatroom._id == updatedPublicChatroom._id ? updatedPublicChatroom : publicChatroom);
                            this.editing = null;
                        }
                    }).catch(error => console.log(error));
                } else {
                    return;
                }
            },
            deletePublicChatroom(publicChatroomId) {
                axios.delete(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/deletePublicChatroom/" + publicChatroomId).then(response => {
                    if(response.data.deleted) {
                        this.publicChatrooms = this.publicChatrooms.filter(publicChatroom => publicChatroom._id != publicChatroomId);
                    }
                }).catch(error => console.log(error));
            },
            blockParticipant(publicChatroomId, username) {
                var body = {publicChatroomId: publicChatroomId, username: username};
                axios.put(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/blockParticipant", body).then(response => {
                    if(response.data.blocked) {
                        var updatedPublicChatroom = response.data.publicChatroom;
                        this.publicChatrooms = this.publicChatrooms.map(publicChatroom => publicChatroom._id == updatedPublicChatroom._id ? updatedPublicChatroom : publicChatroom);
                    }
                }).catch(error => console.log(error));
            },
            allowParticipant(publicChatroomId, username) {
                var body = {publicChatroomId: publicChatroomId, username: username};
                axios.put(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/allowParticipant", body).then(response => {
                    if(response.data.allowed) {
                        var updatedPublicChatroom = response.data.publicChatroom;
                        this.publicChatrooms = this.publicChatrooms.map(publicChatroom => publicChatroom._id == updatedPublicChatroom._id ? updatedPublicChatroom : publicChatroom);
                    }
                }).catch(error => console.log(error));
            },
            createPrivateChatroom() {
                this.privateSubmitting = true;
                this.clearAvailableUserStatus();
                if(this.invalidAvailableUser) {
                    this.availableUserError = true;
                    this.privateChatroomCreated = false;
                    return;
                }
                var body = {firstUsername: this.username, secondUsername: this.availableUser};
                axios.post(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/createPrivateChatroom", body).then(response => {
                    if(response.data.created) {
                        var newPrivateChatroom = response.data.privateChatroom;
                        this.privateChatrooms = [...this.privateChatrooms, newPrivateChatroom];
                        this.privateChatroomCreated = true;
                        this.availableUser = "";
                        this.availableUserError = false, this.privateSubmitting = false;
                        this.getAvailableUsers();
                    } else {
                        var errorFields = response.data.errorFields;
                        if(errorFields.includes("availableUser")) this.availableUserError = true;
                        this.privateChatroomCreated = false;
                    }
                }).catch(error => console.log(error));
            },
            deletePrivateChatroom(privateChatroomId) {
                axios.delete(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/deletePrivateChatroom/" + privateChatroomId).then(response => {
                    if(response.data.deleted) {
                        this.privateChatrooms = this.privateChatrooms.filter(privateChatroom => privateChatroom._id != privateChatroomId);
                        this.getAvailableUsers();
                    }
                }).catch(error => console.log(error));
            },
            checkStatus() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/checkStatus").then(response => console.log(response.data)).catch(error => console.log(error));
            },
            openUsers() {
                this.$router.push("/admin/users");
            },
            openProfile() {
                this.$router.push("/profile");
            },
            openChatroom(chatroomId) {
                this.$router.push("/chatroom/" + chatroomId);
            },
            logout() {
                this.$store.dispatch("logout");
                this.$router.push("/login");
            },
            clearNameStatus() { this.nameError = false; },
            clearIconStatus() { this.iconError = false; },
            clearAvailableUserStatus() { this.availableUserError = false; },
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
            invalidName() { return this.publicChatroom.name === ""; },
            invalidIcon() { return this.publicChatroom.icon === ""; },
            invalidAvailableUser() { return this.availableUser === ""; }
        },
        created() {
            this.isLoggedIn();
            this.getChatrooms();
            this.getAvailableUsers();
        }
    }
</script>

<style scoped>
    #publicChatroom, #privateChatroom {
        margin: 0 auto;
        max-width: 800px;
    }
    h1 {
        text-align: center;
        margin-top: 20px;
        margin-bottom: 20px;
    }
    tbody .fas, tbody .far {
        cursor: pointer;
        margin-right: 5px;
    }
    .padded {
        padding-top: 20px;
    }
    td ul{
        list-style-type: none;
        padding-left: 0px;
    }
    .allowUser, .editPublicChatroom {
        color: #008000;
    }
    .allowUser {
        margin-left: 5px;
    }
    .blockUser, .disableEditing {
        color: #ff0000;
    }
    .blockUser {
        margin-left: 5px;
    }
    .creationSuccessful {
        color: #008000;
        margin-bottom: 10px;
    }
    .errorField {
        border: 1px solid #ff0000;
        box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.1), 0 0 6px #ff8080;
    }
    .errorInput {
        color: #ff0000;
    }
</style>