<template>
    <div id="chatroom" class="container-fluid">
        <div class="d-flex" id="barsDiv">
            <div class="bg-light border-right" id="sidebarDiv">
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
                    <button id="toggleSidebar" class="btn btn-info" @click="toggleSidebar"><i class="fas fa-angle-double-left"></i></button>
                    <button type="button" class="navbar-toggler" data-toggle="collapse" data-target="#navbarOptions" aria-controls="navbarOptions" aria-expanded="false">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div id="navbarOptions" class="collapse navbar-collapse">
                        <ul class="navbar-nav ml-auto mt-2 mt-lg-0">
                            <li class="nav-item">
                                <a class="nav-link" href="#">Overview</a>
                            </li>
                            <li v-if="isAdmin" class="nav-item">
                                <a class="nav-link" href="#" @click="goToUsers">Users</a>
                            </li>
                            <li class="nav-item dropdown">
                                <a id="userOptions" href="#" class="nav-link dropdown-toggle" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{username}}</a>
                                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="userOptions">
                                    <a class="dropdown-item" href="#" @click="editProfile">Profile</a>
                                    <a class="dropdown-item" href="#" @click="logout">Log out</a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </nav>
                <h1 class="chatroomHeader"><i :class="currentChatroom.icon"></i> {{currentChatroom.name}}</h1>
                <div class="container-fluid">
                    <div class="form-row">
                        <div class="col-md-8">
                            <div v-if="!messages.length" class="message">
                                <img :src="require('../assets/defaultAvatar.jpg')" alt="Avatar">
                                <p>No messages yet...</p>
                                <span class="dataRight">Bot {{renderCurrentDate()}}</span>
                            </div>
                            <div v-for="message in messages" v-bind:key="message._id" class="message" :class="{'myMessage': isMyMessage(message.username)}">
                                <img :src="renderAvatar(message.avatar)" alt="Avatar" :class="{'right': isMyMessage(message.username)}">
                                <p>{{message.message}}</p>
                                <span :class="isMyMessage(message.username) ? 'dataLeft' : 'dataRight'">{{message.username + ' ' + renderDate(message.date)}}</span>
                            </div>
                            <small v-if="typing" class="typing"><i><b>{{typing}}</b> is typing...</i></small>
                            <form class="newMessage" autocomplete="off" @submit.prevent="sendMessage">
                                <div class="form-row">
                                    <div class="form-group col-md-11">
                                        <input type="text" id="newMessage" class="form-control" :class="{'errorField' : newMessageError && submitting}" v-model="newMessage" ref="first" @focus="clearNewMessageStatus" @keypress="clearNewMessageStatus"/>
                                    </div>
                                    <div class="form-group col-md-1">
                                        <button type="submit" class="btn btn-primary">Send</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="col-md-4">
                            <h1>Online: </h1>
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
                username: "",
                isAdmin: false,
                chatroomId: "",
                messages: [],
                onlineUsers: {},
                currentChatroom: "",
                submitting: false,
                newMessageError: false,
                newMessage: "",
                typing: "",
                publicChatrooms: [],
                privateChatrooms: [],
                baseUrl: process.env.VUE_APP_BASE_URL + process.env.VUE_APP_CLIENT_PORT
            }
        },
        methods: {
            isLoggedIn() {
                if(!this.$store.getters.isLoggedIn) this.$router.push("/login");
                this.username = this.$store.getters.getUser.username;
                this.isAdmin = this.$store.getters.getUser.isAdmin;
                this.checkStatus();
            },
            getChatrooms() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/getChatrooms/" + this.username).then(response => {
                    this.publicChatrooms = response.data.public;
                    this.privateChatrooms = response.data.private;
                }).catch(error => console.log(error));
            },
            joinChatroom() {
                this.socket.emit("loggedIn", this.chatroomId, this.username);
                this.socket.on("userJoined", data => {
                    this.messages = data.messages;
                    this.onlineUsers = data.users;
                    this.currentChatroom = data.currentChatroom;
                    this.socket.emit("newUser", this.chatroomId, this.username);
                });
                this.listen();
            },
            listen() {
                this.socket.on("userOnline", user => this.onlineUsers[user.socketId] = user.username);
                this.socket.on("userOffline", socketId => delete this.onlineUsers[socketId]);
                this.socket.on("newMessage", message => this.messages.push(message));
                this.socket.on("typing", user => this.typing = user);
                this.socket.on("stopTyping", () => this.typing = "");
            },
            sendMessage() {
                this.submitting = true;
                this.clearNewMessageStatus();
                if(this.invalidNewMessage) {
                    this.newMessageError = true;
                    return;
                }
                this.socket.emit("newMessage", this.chatroomId, this.newMessage);
                this.$refs.first.focus();
                this.newMessage = "";
                this.newMessageError = false, this.submitting = false;
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
            },
            renderCurrentDate() {
                return moment().format("HH:mm");
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
                this.$router.push("/login");
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
                    this.socket.emit("typing", this.username);
                } else {
                    this.socket.emit("stopTyping");
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
    .message {
        border: 2px solid #dedede;
        background-color: #f1f1f1;
        border-radius: 5px;
        padding: 10px;
        margin: 10px 0;
    }
    .myMessage {
        border-color: #ccc;
        background-color: #ddd;
    }
    .message::after {
        content: "";
        clear: both;
        display: table;
    }
    .message img {
        float: left;
        max-width: 60px;
        width: 50px;
        height: 50px;
        margin-right: 20px;
        border-radius: 50%;
    }
    .message img.right {
        float: right;
        margin-left: 20px;
        margin-right:0;
    }
    .dataRight {
        float: right;
        color: #aaa;
    }
    .dataLeft {
        float: left;
        color: #999;
    }
    .typing {
        margin-bottom: 10px;
    }
    .onlineUsers {
        list-style-type: none;
        padding-left: 0px;
    }
    .onlineUser {
        float: left;
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