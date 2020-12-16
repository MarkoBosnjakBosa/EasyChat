<template>
    <div id="chatroom" class="container-fluid">
        <div class="d-flex" id="barsDiv">
            <div id="sidebarDiv" class="bg-light border-right">
                <div class="heading">EasyChat</div>
                <ul class="list list-group-flush">
                    <li class="list-group-item list-group-item-action bg-light"><div class="chatroomType">Chatrooms</div><i v-if="publicChatrooms.length" id="publicIcon" class="fas fa-angle-double-up" @click="toggleChatrooms('public')"></i></li>
                    <li v-for="publicChatroom in publicChatrooms" :key="publicChatroom._id" class="list-group-item list-group-item-action bg-light publicChatroom"><a :href="baseUrl + '/chatroom/' + publicChatroom._id"><div class="chatroomIcon"><i :class="publicChatroom.icon"></i></div>{{publicChatroom.name}}</a></li>
                    <li class="list-group-item list-group-item-action bg-light"><div class="chatroomType">Private</div><i v-if="privateChatrooms.length" id="privateIcon" class="fas fa-angle-double-up" @click="toggleChatrooms('private')"></i></li>
                    <li v-for="privateChatroom in privateChatrooms" :key="privateChatroom._id" class="list-group-item list-group-item-action bg-light privateChatroom"><a :href="baseUrl + '/chatroom/' + privateChatroom._id">{{privateChatroom.name}}</a></li>
                </ul>
            </div>
            <div id="pageDiv">
                <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
                    <button type="button" id="toggleSidebar" class="btn btn-info" @click="toggleSidebar()"><i class="fas fa-angle-double-left"></i></button>
                    <button type="button" class="btn btn-info scrollDown" @click="scrollDown()"><i class="fas fa-arrow-down"></i></button>
                    <button type="button" class="navbar-toggler" data-toggle="collapse" data-target="#navbarOptions" aria-controls="navbarOptions" aria-expanded="false">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div id="navbarOptions" class="collapse navbar-collapse">
                        <ul class="navbar-nav ml-auto mt-2 mt-lg-0">
                            <li v-if="isAdmin" class="nav-item">
                                <a class="nav-link" :href="baseUrl + '/admin/overview'">Overview</a>
                            </li>
                            <li v-else class="nav-item">
                                <a class="nav-link" :href="baseUrl + '/overview'">Overview</a>
                            </li>
                            <li v-if="isAdmin" class="nav-item">
                                <a class="nav-link" :href="baseUrl + '/admin/users'">Users</a>
                            </li>
                            <li class="nav-item dropdown">
                                <a id="userOptions" href="#" class="nav-link dropdown-toggle" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{username}}</a>
                                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="userOptions">
                                    <a class="dropdown-item" :href="baseUrl + '/profile'">Profile</a>
                                    <a class="dropdown-item" :href="baseUrl + '/login'" @click="logout()">Log out</a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </nav>
                <h1 class="chatroomHeader"><i :class="currentChatroom.icon"></i> {{currentChatroom.name}}</h1>
                <div class="container-fluid">
                    <div class="form-row">
                        <div class="col-md-8">
                            <div v-if="!messages.length" class="card">
                                <div class="card-header">
                                    <span>Bot {{renderDate("")}}</span>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-sm-1">
                                            <img :src="require('../assets/images/defaultAvatar.jpg')" alt="Avatar" class="rounded-circle img-fluid" width="50" height="50">
                                        </div>
                                        <div class="col-sm-11">
                                            <span>No messages yet...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-for="message in messages" v-bind:key="message._id" :class="{'myMessage': isMyMessage(message.username)}">
                                <div v-if="isMyMessage(message.username)" class="card">
                                    <div class="card-header">
                                        <span>{{message.username + ' ' + renderDate(message.date)}}</span>
                                        <div v-if="editing != message._id" class="actionButtons">
                                            <i class="fas fa-pencil-alt" @click="enableEditing(message)"></i>
                                            <i class="fas fa-times-circle" @click="deleteMessage(message._id)"></i>
                                        </div>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div v-if="editing == message._id" class="col-sm-11">
                                                <div class="row">
                                                    <div class="col-sm-11 editMessage">
                                                        <input type="text" class="form-control" v-model="message.message"/>
                                                    </div>
                                                    <div class="col-sm-1 editButtons">
                                                        <i class="far fa-check-circle editMessage" @click="editMessage(message._id, message.message)"></i>
                                                        <i class="far fa-times-circle disableEditing" @click="disableEditing(message)"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div v-else class="col-sm-11">
                                                <span>{{message.message}}</span>
                                            </div>
                                            <div class="col-sm-1">
                                                <img :src="renderAvatar(message.avatar)" alt="Avatar" class="rounded-circle img-fluid" width="50" height="50">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="card">
                                    <div class="card-header">
                                        <span>{{message.username + ' ' + renderDate(message.date)}}</span>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-sm-1">
                                                <img :src="renderAvatar(message.avatar)" alt="Avatar" class="rounded-circle img-fluid" width="50" height="50">
                                            </div>
                                            <div class="col-sm-11">
                                                <span>{{message.message}}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <small v-if="typing" class="typing"><i><b>{{typing}}</b> is typing...</i></small>
                            <form autocomplete="off" @submit.prevent="sendMessage()">
                                <div class="input-group mb-3">
                                    <input type="text" id="newMessage" class="form-control" :class="{'errorField' : newMessageError}" placeholder="New message..." v-model="newMessage" ref="first" @focus="clearNewMessageStatus()" @keypress="clearNewMessageStatus()"/>
                                    <div class="input-group-append">
                                        <button type="submit" class="btn btn-primary">Send</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="col-md-4">
                            <h1>Online:</h1>
                            <ul class="onlineUsers">
                                <li v-for="onlineUser in onlineUsers" :key="onlineUser"><div class="onlineUser">{{onlineUser}}</div><i class="fas fa-circle onlineUserIcon"></i></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import "bootstrap";
    import "bootstrap/dist/css/bootstrap.min.css";
    import "../assets/css/bars.css";
    import io from "socket.io-client";
    import moment from "moment";
    var axios = require("axios");

    export default {
        name: "chatroom",
        data() {
            return {
                socket: io(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT),
                baseUrl: process.env.VUE_APP_BASE_URL + process.env.VUE_APP_CLIENT_PORT,
                username: "",
                isAdmin: false,
                chatroomId: "",
                messages: [],
                editing: null,
                onlineUsers: {},
                currentChatroom: "",
                newMessageError: false,
                newMessage: "",
                typing: "",
                publicChatrooms: [],
                privateChatrooms: []
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
            joinChatroom() {
                this.socket.emit("userJoining", this.chatroomId, this.username);
                this.socket.on("userJoined", data => {
                    this.messages = data.messages;
                    this.onlineUsers = Object.fromEntries(Object.entries(data.users).filter(([socketId, username]) => username != this.username));
                    this.currentChatroom = data.currentChatroom;
                    this.socket.emit("newUser", this.chatroomId, this.username);
                });
                this.listen();
            },
            listen() {
                this.socket.on("userOnline", user => {
                    if(user.username != this.username && !Object.values(this.onlineUsers).includes(user.username)) {
                        this.onlineUsers[user.socketId] = user.username;
                    }
                });
                this.socket.on("userOffline", socketId => delete this.onlineUsers[socketId]);
                this.socket.on("newMessage", message => this.messages.push(message));
                this.socket.on("editMessage", editedMessage => {
                    this.messages = this.messages.map(message => message._id == editedMessage._id ? editedMessage : message);
                    this.editing = null;
                });
                this.socket.on("deleteMessage", messageId => this.messages = this.messages.filter(message => message._id != messageId));
                this.socket.on("typing", user => this.typing = user);
                this.socket.on("stopTyping", () => this.typing = "");
            },
            sendMessage() {
                this.clearNewMessageStatus();
                if(this.invalidNewMessage) {
                    this.newMessageError = true;
                    return;
                }
                this.socket.emit("newMessage", this.chatroomId, this.newMessage);
                this.$refs.first.focus();
                this.newMessage = "";
                this.newMessageError = false;
            },
            enableEditing(message) {
                this.cachedMessage = Object.assign({}, message);
                this.editing = message._id;
            },
            disableEditing(message) { 
                Object.assign(message, this.cachedMessage);
                this.editing = null;
            },
            editMessage(messageId, message) {
                if(message) {
                    this.socket.emit("editMessage", messageId, message);
                }
            },
            deleteMessage(messageId) {
                this.socket.emit("deleteMessage", messageId);
            },
            isMyMessage(username) {
                if(username == this.username) {
                    return true;
                } else {
                    return false;
                }
            },
            renderAvatar(avatar) {
                return "data:" + avatar.contentType + ";base64," + (new Buffer.from(avatar.image)).toString("base64");
            },
            renderDate(date) {
                if(date) {
                    var dateAndTime = date.split(" ");
                    var temporaryDateArray = dateAndTime[0].split(".");
                    var temporaryDate = temporaryDateArray[2] + "-" + temporaryDateArray[1] + "-" + temporaryDateArray[0];
                    var parsedDate = moment(temporaryDate);
                    var currentDate = moment().startOf("day");
                    if(parsedDate.isBefore(currentDate)) {
                        return dateAndTime[0];
                    } else {
                        return dateAndTime[1];
                    }
                } else {
                    return moment().format("HH:mm");
                }
            },
            scrollDown() {
                window.scroll({top: document.body.scrollHeight, behavior: "smooth"});
            },
            checkStatus() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/checkStatus").then(response => {
                    if(response.data.loggedIn) {
                        this.joinChatroom();
                    }
                }).catch(error => console.log(error));
            },
            logout() {
                this.$store.dispatch("logout");
            },
            clearNewMessageStatus() { this.newMessageError = false; },
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
        watch: {
            newMessage(value) {
                if(value) {
                    this.socket.emit("typing", this.chatroomId, this.username);
                } else {
                    this.socket.emit("stopTyping", this.chatroomId);
                }
            }
        },
        computed: {
            invalidNewMessage() { return this.newMessage === ""; }
        },
        created() {
            this.isLoggedIn();
            this.getChatrooms();
            this.chatroomId = this.$route.params.id;
        }
    }
</script>

<style scoped>
    .chatroomHeader {
        text-align: center;
        margin-top: 10px;
        margin-bottom: 10px;
    }
    .scrollDown {
        margin-left: 10px;
    }
    .card {
        margin-bottom: 10px;
    }
    .card-header, .card-body {
        padding: 10px;
    }
    .editMessage {
        padding-right: 0px;
    }
    .editButtons {
        padding-left: 0px;
        padding-right: 0px;
    }
    .card-header .fas, .card-header .far, .card-body .fas, .card-body .far {
        cursor: pointer;
        margin-left: 5px;
    }
    .actionButtons {
        float: right;
    }
    .card-body .fas, .card-body .far {
        padding-top: 10px;
    }
    .typing {
        margin-left: 5px;
    }
    .onlineUsers {
        list-style-type: none;
        padding-left: 0px;
    }
    .onlineUser {
        float: left;
    }
    .editMessage {
        color: #008000;
    }
    .disableEditing {
        color: #ff0000;
    }
    .onlineUserIcon {
        color: #008000;
        margin-left: 5px;
    }
    .errorField {
        border: 1px solid #ff0000;
        box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.1), 0 0 6px #ff8080;
    }
</style>