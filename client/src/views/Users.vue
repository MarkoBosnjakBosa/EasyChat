<template>
    <div id="profile" class="container-fluid">
        <div class="d-flex" id="barsDiv">
            <div class="bg-light border-right" id="sidebarDiv">
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
                    <button id="toggleSidebar" class="btn btn-info" @click="toggleSidebar"><i class="fas fa-angle-double-left"></i></button>
                    <button type="button" class="navbar-toggler" data-toggle="collapse" data-target="#navbarOptions" aria-controls="navbarOptions" aria-expanded="false">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div id="navbarOptions" class="collapse navbar-collapse">
                        <ul class="navbar-nav ml-auto mt-2 mt-lg-0">
                            <li class="nav-item">
                                <a class="nav-link" href="#" @click="openOverview()">Overview</a>
                            </li>
                            <li class="nav-item active">
                                <a class="nav-link" href="#">Users</a>
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
                <h1>Users:</h1>
                <table class="table">
                    <thead class="thead-light">
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Avatar</th>
                            <th scope="col">Username</th>
                            <th scope="col">Email</th>
                            <th scope="col">Name</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(user, index) in users" :key="user._id">
                            <th scope="row">{{++index}}</th>
                            <td><img :src="renderAvatar(user.avatar)" alt="Avatar" class="rounded-circle" width="20" height="20"></td>
                            <td>{{user.username}}</td>
                            <td>{{user.email}}</td>
                            <td>{{user.firstName + " " + user.lastName}}</td>
                            <td><i class="fas fa-trash" @click="deleteUser(user.username)"></i></td>
                        </tr>
                    </tbody>
                </table>
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
        name: "users",
        data() {
            return {
                username: "",
                publicChatrooms: [],
                privateChatrooms: [],
                users: [],
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
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/getChatrooms/" + this.username).then(response => {
                    this.publicChatrooms = response.data.public;
                    this.privateChatrooms = response.data.private;
                }).catch(error => console.log(error));
            },
            getUsers() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/getUsers/" + this.username).then(response => {
                    this.users = response.data.users;
                }).catch(error => console.log(error));
            },
            renderAvatar(avatar) {
                return "data:" + avatar.contentType + ";base64," + (new Buffer.from(avatar.image)).toString("base64");
            },
            deleteUser(username) {
                axios.delete(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/deleteUser/" + username).then(response => {
                    if(response.data.deleted) {
                        this.users = this.users.filter(user => user.username != username);
                    }
                }).catch(error => console.log(error));
            },
            checkStatus() {
                axios.get(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/checkStatus").then(response => console.log(response.data)).catch(error => console.log(error));
            },
            openOverview() {
                this.$router.push("/admin/overview");
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
        created() {
            this.isLoggedIn();
            this.getChatrooms();
            this.getUsers();
        }
    }
</script>

<style scoped>
    h1 {
        text-align: center;
        margin-top: 20px;
        margin-bottom: 20px;
    }
    .fa-trash {
        cursor: pointer;
    }
    img {
        margin-top: -5px;
    }
</style>