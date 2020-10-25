<template>
    <div id="chatroom" class="container-fluid">
        <div class="d-flex" id="barsDiv">
            <div class="bg-light border-right" id="sidebarDiv">
            <div class="heading">EasyChat</div>
            <ul class="list list-group-flush">
                <li class="list-group-item list-group-item-action bg-light"><div class="chatroomType">Chatrooms</div><i v-if="publicChatrooms.length" id="publicIcon" class="fas fa-angle-double-up" @click="toggleChatrooms('public')"></i></li>
                <li v-for="publicChatroom in publicChatrooms" :key="publicChatroom._id" class="list-group-item list-group-item-action bg-light publicChatroom"><a :href="baseUrl + '/chatroom/' + publicChatroom._id"><div class="chatroomIcon"><i :class="publicChatroom.icon"></i></div>{{publicChatroom.name}}</a></li>
                <li class="list-group-item list-group-item-action bg-light"><div class="chatroomType">Private</div><i v-if="privateChatrooms.length" id="privateIcon" class="fas fa-angle-double-up" @click="toggleChatrooms('private')"></i></li>
                <li v-for="privateChatroom in privateChatrooms" :key="privateChatroom._id" class="list-group-item list-group-item-action bg-light privateChatroom"><a :href="baseUrl + '/chatroom/' + publicChatroom._id">{{privateChatroom.name}}</a></li>
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
                            <li class="nav-item dropdown">
                                <a id="userOptions" href="#" class="nav-link dropdown-toggle" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{username}}</a>
                                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="userOptions">
                                    <a class="dropdown-item" href="#">Profile</a>
                                    <a class="dropdown-item" href="#">Change password</a>
                                    <a class="dropdown-item" href="#" @click="logout">Log out</a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </nav>
                <div id="chatroomMessages">
                    <div class="chat">
                        <div class="chatMessages">
                            <div v-for="message in messages" v-bind:key="message._id" class="chatMessage">
                                <div class="chatUsername">{{message.username}}</div>
                                <div class="chatText">{{message.message}}</div>
                            </div>
                        </div>
                        <form class="newMessage" @submit.prevent="sendMessage">
                            <input type="text" id="message" v-model="newMessage">
                            <button type="submit" class="sendButton">Send</button>
                        </form>
                    </div>
                    <div>
                        <ul class="onlineUsers">
                            <li v-for="onlineUser in onlineUsers" :key="onlineUser"><div class="onlineUser">{{onlineUser}}</div><i class="fas fa-circle onlineUserIcon"></i></li>
                        </ul>
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
    var axios = require("axios");
    import io from "socket.io-client";

    export default {
        name: "chatroom",
        data() {
            return {
                socket: io(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT),
                username: "",
                chatroomId: "",
                messages: [],
                onlineUsers: [],
                newMessage: "",
                publicChatrooms: [],
                privateChatrooms: [],
                baseUrl: process.env.VUE_APP_BASE_URL + process.env.VUE_APP_CLIENT_PORT
            }
        },
        methods: {
            isLoggedIn() {
                if(!this.$store.getters.isLoggedIn) this.$router.push("/login");
                this.username = this.$store.getters.getUser.username;
                this.checkStatus();
            },
            getChatrooms() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/getChatrooms/" + this.username).then(response => {
                    this.publicChatrooms = response.data.public;
                    this.privateChatrooms = response.data.private;
                }).catch(error => console.log(error));
            },
            joinChatroom() {
                this.socket.emit("loggedIn", this.chatroomId);
                this.socket.on("userJoined", data => {
                    this.messages = data.messages;
                    this.onlineUsers = data.users;
                    this.socket.emit("newUser", this.chatroomId, this.username);
                });
                this.listen();
            },
            listen() {
                this.socket.on("userOnline", user =>  this.onlineUsers.push(user));
                this.socket.on("userOffline", user => this.onlineUsers.splice(this.users.indexOf(user), 1));
                this.socket.on("newMessage", message => this.messages.push(message));
            },
            sendMessage() {
                if(!this.newMessage) return;
                this.socket.emit("newMessage", this.chatroomId, this.newMessage);
                this.newMessage = "";
            },
            checkStatus() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/checkStatus").then(response => {
                    if(response.data.loggedIn) {
                        this.joinChatroom();
                    }
                }).catch(error => console.log(error));
            },
            logout() {
                this.$store.dispatch("logout");
                this.$router.push("/login");
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
        },
        created() {
            this.isLoggedIn();
            this.getChatrooms();
            this.chatroomId = this.$route.params.id;
        }
    }
</script>

<style scoped>
    #chatroomMessages {
        display: flex;
        justify-content: flex-start;
        height: 100vh;
        max-width: 80%;
        padding: 15px;
        box-sizing: border-box;
    }
    .chat {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        width: 90%;
        background-color: #F9F9F9;
        box-shadow: 1px 1px 6px 0px rgba(0, 0, 0, 0.15);
    }
    .chatMessages {
        flex: 1;
        overflow: scroll;
    }
    .chatMessage {
        display: flex;
        border-bottom: 1px solid #EFEFEF;
        padding: 10px;
    }
    .chatUsername {
        width: 100px;
        margin-right: 15px;
    }
    .chatText {
        flex: 1;
    }
    .newMessage {
        display: flex;
    }
    #message {
        flex: 1;
        height: 35px;
        font-size: 18px;
        box-sizing: border-box;
    }
    .sendButton {
        width: 75px;
        height: 35px;
        box-sizing: border-box;
    }
    .onlineUsers {
        list-style-type: none;
    }
    .onlineUser {
        float: left;
    }
    .onlineUserIcon {
        color: #008000;
        margin-left: 5px;
    }
</style>