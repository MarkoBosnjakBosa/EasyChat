<template>
    <div id="overview" class="container-fluid">
        <div class="d-flex" id="barsDiv">
            <div id="sidebarDiv" class="bg-light border-right">
                <div class="heading">EasyChat</div>
                <ul class="list list-group-flush">
                    <li class="list-group-item list-group-item-action bg-light"><div class="chatroomType">Chatrooms</div><i v-if="publicChatrooms.length" id="publicIcon" class="fas fa-angle-double-up" @click="toggleChatrooms('public')"></i></li>
                    <li v-for="publicChatroom in publicChatrooms" :key="publicChatroom._id" class="list-group-item list-group-item-action bg-light publicChatroom"><div class="publicChatroomType" @click="openChatroom(publicChatroom._id)"><div class="chatroomIcon"><i :class="publicChatroom.icon"></i></div>{{publicChatroom.name}}</div><i class="fas fa-times" @click="leavePublicChatroom(publicChatroom._id)"></i></li>
                    <li class="list-group-item list-group-item-action bg-light"><div class="chatroomType">Private</div><i v-if="privateChatrooms.length" id="privateIcon" class="fas fa-angle-double-up" @click="toggleChatrooms('private')"></i></li>
                    <li v-for="privateChatroom in privateChatrooms" :key="privateChatroom._id" class="list-group-item list-group-item-action bg-light privateChatroom"><div class="privateChatroomType" @click="openChatroom(privateChatroom._id)">{{privateChatroom.name}}</div><i class="fas fa-times" @click="deletePrivateChatroom(privateChatroom._id)"></i></li>
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
                            <li class="nav-item active">
                                <a class="nav-link" href="#">Overview</a>
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
                    <form autocomplete="off" @submit.prevent="joinAvailableChatroom()">
                        <h1>Public chatroom</h1>
                        <div class="form-row">
                            <div class="form-group col-md-3"></div>
                            <div class="form-group col-md-4">
                                <select id="availableChatroom" class="form-control" :class="{'errorField' : availableChatroomError}" v-model="availableChatroom" @focus="clearAvailableChatroomStatus()" @keypress="clearAvailableChatroomStatus()">
                                    <option value="" disabled selected>Select chatroom...</option>
                                    <option v-for="availableChatroom in availableChatrooms" :key="availableChatroom._id" :value="availableChatroom._id">{{availableChatroom.name}}</option>
                                </select>
                                <small v-if="availableChatroomError" class="form-text errorInput">Please provide a valid chatroom!</small>
                            </div>
                            <div class="form-group col-md-1">
                                <button type="submit" class="btn btn-primary">Join</button>
                            </div>
                        </div>
                        <div v-if="publicChatroomJoined" class="form-row">
                            <div class="form-group col-md-3"></div>
                            <div class="form-group col-md-6">
                                <div class="creationSuccessful">You have successfully joined the public chatroom!</div>
                            </div>
                        </div>  
                    </form>
                </div>
                <div id="privateChatroom">
                    <form autocomplete="off" @submit.prevent="createPrivateChatroom()">
                        <h1>Private chatroom</h1>
                        <div class="form-row">
                            <div class="form-group col-md-3"></div>
                            <div class="form-group col-md-4">
                                <select id="availableUser" class="form-control" :class="{'errorField' : availableUserError}" v-model="availableUser" @focus="clearAvailableUserStatus()" @keypress="clearAvailableUserStatus()">
                                    <option value="" disabled selected>Select user...</option>
                                    <option v-for="availableUser in availableUsers" :key="availableUser" :value="availableUser">{{availableUser}}</option>
                                </select>
                                <small v-if="availableUserError" class="form-text errorInput">Please provide a valid user!</small>
                            </div>
                            <div class="form-group col-md-1">
                                <button type="submit" class="btn btn-primary">Create</button>
                            </div>
                        </div>
                        <div v-if="privateChatroomCreated" class="form-row">
                            <div class="form-group col-md-3"></div>
                            <div class="form-group col-md-6">
                                <div class="form-group creationSuccessful">Private chatroom has been successfully created!</div>
                            </div>
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
        name: "overview",
        data() {
            return {
                username: "",
                publicChatrooms: [],
                privateChatrooms: [],
                availableChatrooms: [],
                availableUsers: [],
                availableChatroomError: false,
                availableChatroom: "",
                publicChatroomJoined: false,
                availableUserError: false,
                availableUser: "",
                privateChatroomCreated: false
            }
        },
        methods: {
            isLoggedIn() {
                if(!this.$store.getters.isLoggedIn) this.$router.push("/login");
                this.username = this.$store.getters.getUser;
                this.checkStatus();
            },
            getChatrooms() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/getChatrooms/" + this.username).then(response => {
                    this.publicChatrooms = response.data.public;
                    this.privateChatrooms = response.data.private;
                }).catch(error => console.log(error));
            },
            getAvailableChatrooms() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/getAvailableChatrooms/" + this.username).then(response => {
                    this.availableChatrooms = response.data.availableChatrooms;
                }).catch(error => console.log(error));
            },
            getAvailableUsers() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/getAvailableUsers/" + this.username).then(response => {
                    this.availableUsers = response.data.availableUsers;
                }).catch(error => console.log(error));
            },
            joinAvailableChatroom() {
                this.clearAvailableChatroomStatus();
                if(this.invalidAvailableChatroom) {
                    this.availableChatroomError = true;
                    this.publicChatroomJoined = false;
                    return;
                }
                var body = {availableChatroomId: this.availableChatroom, username: this.username};
                axios.put(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/joinAvailableChatroom", body).then(response => {
                    if(response.data.joined) {
                        var newAvailableChatroom = response.data.availableChatroom;
                        this.publicChatrooms = [...this.publicChatrooms, newAvailableChatroom];
                        this.publicChatroomJoined = true;
                        this.availableChatroom = "";
                        this.availableChatroomError = false;
                        this.getAvailableChatrooms();
                    } else {
                        var errorFields = response.data.errorFields;
                        if(errorFields.includes("availableChatroom")) this.availableChatroomError = true;
                        this.publicChatroomJoined = false;
                    }
                }).catch(error => console.log(error));
            },
            leavePublicChatroom(publicChatroomId) {
                var body = {publicChatroomId: publicChatroomId, username: this.username};
                axios.put(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/leavePublicChatroom", body).then(response => {
                    if(response.data.left) {
                        this.publicChatrooms = this.publicChatrooms.filter(publicChatroom => publicChatroom._id != publicChatroomId);
                        this.getAvailableChatrooms();
                    }
                }).catch(error => console.log(error));
            },
            createPrivateChatroom() {
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
                        this.availableUserError = false;
                        this.getAvailableUsers();
                    } else {
                        var errorFields = response.data.errorFields;
                        if(errorFields.includes("privateUser")) this.availableUserError = true;
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
            clearAvailableChatroomStatus() { this.availableChatroomError = false; },
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
            invalidAvailableChatroom() { return this.availableChatroom === ""; },
            invalidAvailableUser() { return this.availableUser === ""; }
        },
        created() {
            this.isLoggedIn();
            this.getChatrooms();
            this.getAvailableChatrooms();
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