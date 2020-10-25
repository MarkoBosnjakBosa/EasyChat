<template>
    <div id="chatroom" class="container-fluid">
        <div class="d-flex" id="barsDiv">
            <div class="bg-light border-right" id="sidebarDiv">
            <div class="heading">EasyChat</div>
            <ul class="list list-group-flush">
                <li class="list-group-item list-group-item-action bg-light"><div class="chatroomType">Chatrooms</div><i v-if="publicChatrooms.length" id="publicIcon" class="fas fa-angle-double-up" @click="toggleChatrooms('public')"></i></li>
                <li v-for="publicChatroom in publicChatrooms" :key="publicChatroom._id" class="list-group-item list-group-item-action bg-light publicChatroom"><span @click="openChatroom(publicChatroom._id)"><div class="chatroomIcon"><i :class="publicChatroom.icon"></i></div>{{publicChatroom.name}}</span><div class="leaveChatroomIcon" @click="leavePublicChatroom(publicChatroom._id)"><i class="fas fa-times"></i></div></li>
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
                    <div class="chat-window">
                        <div class="messages">
                            <div class="message" v-for="message in messages" v-bind:key="message._id">
                                <div class="username">{{message.username}}</div>
                                <div class="message-text">{{message.msg}}</div>
                            </div>
                        </div>
                        <form class="input-container" @submit.prevent="sendMessage">
                            <input type="text" v-model="msg">
                            <button type="submit">Send</button>
                        </form>
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
        name: "adminOverview",
        data() {
            return {
                username: "",
                publicChatrooms: [],
                privateChatrooms: [],
                messages: [],
                message: ""
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
            checkStatus() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PORT + "/checkStatus").then(response => console.log(response.data)).catch(error => console.log(error));
            },
            openChatroom(chatroomId) {
                this.$router.push("/chatroom/" + chatroomId);
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
        }
    }
</script>

<style scoped>
    #chatroomMessages {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100%;
        max-width: 768px;
        margin: 0 auto;
        padding: 15px;
        box-sizing: border-box;
    }
    .chat-window {
        flex: 1;
        display: flex;
        flex-direction: column;
        background-color: #F9F9F9;
        box-shadow: 1px 1px 6px 0px rgba(0, 0, 0, 0.15);
    }
    .chat-window .messages {
            flex: 1;
            overflow: scroll;
    }
    .chat-window .messages .message {
        display: flex;
        border-bottom: 1px solid #EFEFEF;
        padding: 10px;
    }
    .chat-window .messages .username {
        width: 100px;
        margin-right: 15px;
    }
    .chat-window .messages .message-text {
        flex: 1;
    }
    .input-container {
        display: flex;
    }
    input {
        flex: 1;
        height: 35px;
        font-size: 18px;
        box-sizing: border-box;
    }
    button {
        width: 75px;
        height: 35px;
        box-sizing: border-box;
    }
</style>